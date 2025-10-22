package com.parkandsee.backend.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.parkandsee.backend.dto.PaymentRequest;
import com.parkandsee.backend.entity.ReservationEntity;
import com.parkandsee.backend.entity.ReservationStatus;
import com.parkandsee.backend.entity.VehicleType;
import com.parkandsee.backend.repository.ReservationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureWebMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureWebMvc
@ActiveProfiles("test")
@Transactional
class OverdueControlIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ReservationRepository reservationRepository;

    @Autowired
    private ObjectMapper objectMapper;

    private ReservationEntity testReservation;

    @BeforeEach
    void setUp() {
        // Nettoyer la base de données
        reservationRepository.deleteAll();

        // Créer une réservation de test expirée
        LocalDateTime now = LocalDateTime.now();
        testReservation = new ReservationEntity();
        testReservation.setId("integration-test-1");
        testReservation.setLicencePlate("IT-123-ST");
        testReservation.setVehicleType(VehicleType.CAR);
        testReservation.setStartAt(now.minusMinutes(90));
        testReservation.setDurationMinutes(60);
        testReservation.setAddress("Test Integration Street");
        testReservation.setStatus(ReservationStatus.ACTIVE);
        
        reservationRepository.save(testReservation);
    }

    @Test
    void completeOverdueControlWorkflow_fromReservationToOverdueMarking() throws Exception {
        // 1. Créer une nouvelle réservation via l'API de paiement
        PaymentRequest paymentRequest = new PaymentRequest();
        paymentRequest.setLicencePlate("WF-999-OW");
        paymentRequest.setVehicleType("CAR");
        paymentRequest.setStartAt(LocalDateTime.now().minusMinutes(75));
        paymentRequest.setDurationMinutes(60);
        paymentRequest.setAddress("Workflow Test Address");
        paymentRequest.setPaymentToken("test-token-123");

        String paymentJson = objectMapper.writeValueAsString(paymentRequest);

        // Créer la réservation
        String response = mockMvc.perform(post("/api/parking/reserve-and-pay")
                .contentType(MediaType.APPLICATION_JSON)
                .content(paymentJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andReturn()
                .getResponse()
                .getContentAsString();

        // Extraire l'ID de la réservation créée
        String reservationId = objectMapper.readTree(response).get("reservationId").asText();

        // 2. Vérifier que la réservation apparaît dans les réservations en excès
        mockMvc.perform(get("/api/agent/overdue"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(2)) // testReservation + nouvelle réservation
                .andExpect(jsonPath("$[?(@.licencePlate=='WF-999-OW')]").exists())
                .andExpect(jsonPath("$[?(@.licencePlate=='IT-123-ST')]").exists());

        // 3. Marquer une réservation comme en excès
        mockMvc.perform(post("/api/agent/overdue/" + reservationId + "/mark"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Réservation marquée en excès"));

        // 4. Vérifier que le statut a été mis à jour dans la base de données
        ReservationEntity updatedReservation = reservationRepository.findById(reservationId).orElse(null);
        assertThat(updatedReservation).isNotNull();
        assertThat(updatedReservation.getStatus()).isEqualTo(ReservationStatus.OVERDUE);

        // 5. Vérifier les statistiques
        mockMvc.perform(get("/api/agent/overdue/stats"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalActive").value(1)) // Une seule réservation ACTIVE restante
                .andExpect(jsonPath("$.currentOverdue").value(1)) // Une réservation en excès temps réel
                .andExpect(jsonPath("$.markedOverdue").value(1)) // Une réservation marquée OVERDUE
                .andExpect(jsonPath("$.timestamp").exists());

        // 6. Vérifier que la réservation marquée n'apparaît plus dans la liste des excès en temps réel
        mockMvc.perform(get("/api/agent/overdue"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1)) // Seulement testReservation
                .andExpect(jsonPath("$[0].licencePlate").value("IT-123-ST"));
    }

    @Test
    void overdueControlWorkflow_withNonOverdueReservation_returnsEmptyList() throws Exception {
        // Créer une réservation active non expirée
        LocalDateTime now = LocalDateTime.now();
        ReservationEntity activeReservation = new ReservationEntity();
        activeReservation.setId("non-overdue-test");
        activeReservation.setLicencePlate("NN-555-OD");
        activeReservation.setVehicleType(VehicleType.MOTORCYCLE);
        activeReservation.setStartAt(now.minusMinutes(30));
        activeReservation.setDurationMinutes(60);
        activeReservation.setAddress("Active Reservation Street");
        activeReservation.setStatus(ReservationStatus.ACTIVE);
        
        reservationRepository.save(activeReservation);

        // Vérifier qu'elle n'apparaît pas dans les excès
        mockMvc.perform(get("/api/agent/overdue"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[?(@.licencePlate=='NN-555-OD')]").doesNotExist())
                .andExpect(jsonPath("$[?(@.licencePlate=='IT-123-ST')]").exists()); // Seulement testReservation expirée
    }

    @Test
    void markNonExistentReservationAsOverdue_returns404() throws Exception {
        mockMvc.perform(post("/api/agent/overdue/nonexistent-id/mark"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Réservation non trouvée"));
    }

    @Test
    void overdueStatistics_withMultipleStatusTypes_returnsCorrectCounts() throws Exception {
        // Ajouter différents types de réservations
        ReservationEntity completedReservation = new ReservationEntity();
        completedReservation.setId("completed-test");
        completedReservation.setLicencePlate("CP-777-LT");
        completedReservation.setVehicleType(VehicleType.BICYCLE);
        completedReservation.setStartAt(LocalDateTime.now().minusMinutes(120));
        completedReservation.setDurationMinutes(60);
        completedReservation.setAddress("Completed Reservation Street");
        completedReservation.setStatus(ReservationStatus.COMPLETED);
        
        ReservationEntity markedOverdueReservation = new ReservationEntity();
        markedOverdueReservation.setId("marked-overdue-test");
        markedOverdueReservation.setLicencePlate("MO-888-VD");
        markedOverdueReservation.setVehicleType(VehicleType.ELECTRIC_SCOOTER);
        markedOverdueReservation.setStartAt(LocalDateTime.now().minusMinutes(100));
        markedOverdueReservation.setDurationMinutes(60);
        markedOverdueReservation.setAddress("Marked Overdue Street");
        markedOverdueReservation.setStatus(ReservationStatus.OVERDUE);

        reservationRepository.save(completedReservation);
        reservationRepository.save(markedOverdueReservation);

        // Vérifier les statistiques
        mockMvc.perform(get("/api/agent/overdue/stats"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalActive").value(1)) // Seulement testReservation
                .andExpect(jsonPath("$.currentOverdue").value(1)) // testReservation expirée
                .andExpect(jsonPath("$.markedOverdue").value(1)) // markedOverdueReservation
                .andExpect(jsonPath("$.timestamp").exists());
    }

    @Test
    void corsHeaders_areSetCorrectlyOnAllEndpoints() throws Exception {
        // Test CORS sur l'endpoint des réservations en excès
        mockMvc.perform(get("/api/agent/overdue"))
                .andExpect(status().isOk())
                .andExpect(header().string("Access-Control-Allow-Origin", "*"));

        // Test CORS sur l'endpoint de marquage
        mockMvc.perform(post("/api/agent/overdue/" + testReservation.getId() + "/mark"))
                .andExpect(status().isOk())
                .andExpect(header().string("Access-Control-Allow-Origin", "*"));

        // Test CORS sur l'endpoint des statistiques
        mockMvc.perform(get("/api/agent/overdue/stats"))
                .andExpect(status().isOk())
                .andExpect(header().string("Access-Control-Allow-Origin", "*"));
    }
}