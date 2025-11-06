package com.parkandsee.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.parkandsee.backend.dto.CreateReservationRequest;
import com.parkandsee.backend.entity.PaymentMethod;
import com.parkandsee.backend.repository.NewReservationRepository;
import com.parkandsee.backend.repository.ParkingRepository;
import com.parkandsee.backend.repository.VehicleRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Tests d'intégration pour NewReservationController
 * Vérifie la création de réservations avec upsert de véhicules
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class NewReservationControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private VehicleRepository vehicleRepository;

    @Autowired
    private ParkingRepository parkingRepository;

    @Autowired
    private NewReservationRepository reservationRepository;

    private String centreVilleParkingId;

    @BeforeEach
    void setUp() {
        // data-new.sql est chargé automatiquement
        // UUID du parking "Centre Ville" (doit correspondre à data-new.sql)
        centreVilleParkingId = "550e8400-e29b-41d4-a716-446655440001";
    }

    @Test
    void createReservation_validRequest_returnsCreated() throws Exception {
        // Given
        Instant startAt = Instant.now().truncatedTo(ChronoUnit.SECONDS);
        
        CreateReservationRequest.PaymentInfo paymentInfo = new CreateReservationRequest.PaymentInfo();
        paymentInfo.setMethod(PaymentMethod.CARD);
        paymentInfo.setAmountCents(300); // 3.00€
        
        CreateReservationRequest request = new CreateReservationRequest();
        request.setPlate("AB-123-CD");
        request.setVehicleType("CAR");
        request.setParkingId(centreVilleParkingId);
        request.setStartAt(startAt);
        request.setDurationMinutes(60);
        request.setPayment(paymentInfo);

        // When/Then
        mockMvc.perform(post("/api/reservations")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.reservationId").isNotEmpty())
                .andExpect(jsonPath("$.plate").value("AB123CD")) // Normalisé
                .andExpect(jsonPath("$.vehicleType").value("CAR"))
                .andExpect(jsonPath("$.parkingName").value("Centre Ville"))
                .andExpect(jsonPath("$.durationMinutes").value(60))
                .andExpect(jsonPath("$.priceCents").value(300))
                .andExpect(jsonPath("$.status").value("ACTIVE"))
                .andExpect(jsonPath("$.startAt").value(startAt.toString()))
                .andExpect(jsonPath("$.endAt").isNotEmpty());
    }

    @Test
    void createReservation_existingVehicle_reusesVehicle() throws Exception {
        // Given - Créer une première réservation
        Instant startAt1 = Instant.now().minus(2, ChronoUnit.HOURS).truncatedTo(ChronoUnit.SECONDS);
        
        CreateReservationRequest.PaymentInfo paymentInfo = new CreateReservationRequest.PaymentInfo();
        paymentInfo.setMethod(PaymentMethod.CARD);
        paymentInfo.setAmountCents(150);
        
        CreateReservationRequest request1 = new CreateReservationRequest();
        request1.setPlate("XY-789-ZZ");
        request1.setVehicleType("MOTORCYCLE");
        request1.setParkingId(centreVilleParkingId);
        request1.setStartAt(startAt1);
        request1.setDurationMinutes(30);
        request1.setPayment(paymentInfo);

        mockMvc.perform(post("/api/reservations")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request1)))
                .andExpect(status().isCreated());

        long vehicleCountBefore = vehicleRepository.count();

        // When - Créer une seconde réservation avec la même plaque
        Instant startAt2 = Instant.now().truncatedTo(ChronoUnit.SECONDS);
        request1.setStartAt(startAt2);
        request1.setDurationMinutes(60);

        mockMvc.perform(post("/api/reservations")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request1)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.plate").value("XY789ZZ"));

        // Then - Le nombre de véhicules n'a pas augmenté (upsert)
        long vehicleCountAfter = vehicleRepository.count();
        assert vehicleCountBefore == vehicleCountAfter;
    }

    @Test
    void createReservation_invalidParkingId_returnsBadRequest() throws Exception {
        // Given
        Instant startAt = Instant.now().truncatedTo(ChronoUnit.SECONDS);
        
        CreateReservationRequest.PaymentInfo paymentInfo = new CreateReservationRequest.PaymentInfo();
        paymentInfo.setMethod(PaymentMethod.CARD);
        paymentInfo.setAmountCents(150);
        
        CreateReservationRequest request = new CreateReservationRequest();
        request.setPlate("AB-123-CD");
        request.setVehicleType("CAR");
        request.setParkingId("00000000-0000-0000-0000-000000000000"); // Parking inexistant
        request.setStartAt(startAt);
        request.setDurationMinutes(30);
        request.setPayment(paymentInfo);

        // When/Then
        mockMvc.perform(post("/api/reservations")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error", containsString("Parking not found")));
    }

    @Test
    void createReservation_missingRequiredFields_returnsBadRequest() throws Exception {
        // Given - Request sans plate
        CreateReservationRequest request = new CreateReservationRequest();
        request.setVehicleType("CAR");
        request.setParkingId(centreVilleParkingId);
        request.setStartAt(Instant.now());
        request.setDurationMinutes(30);

        // When/Then
        mockMvc.perform(post("/api/reservations")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void createReservation_zeroDuration_returnsBadRequest() throws Exception {
        // Given
        Instant startAt = Instant.now().truncatedTo(ChronoUnit.SECONDS);
        
        CreateReservationRequest.PaymentInfo paymentInfo = new CreateReservationRequest.PaymentInfo();
        paymentInfo.setMethod(PaymentMethod.CARD);
        paymentInfo.setAmountCents(0);
        
        CreateReservationRequest request = new CreateReservationRequest();
        request.setPlate("AB-123-CD");
        request.setVehicleType("CAR");
        request.setParkingId(centreVilleParkingId);
        request.setStartAt(startAt);
        request.setDurationMinutes(0); // Invalide
        request.setPayment(paymentInfo);

        // When/Then
        mockMvc.perform(post("/api/reservations")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error", containsString("Duration must be positive")));
    }

    @Test
    void createReservation_plateNormalization_worksCorrectly() throws Exception {
        // Given - Plaque avec espaces et minuscules
        Instant startAt = Instant.now().truncatedTo(ChronoUnit.SECONDS);
        
        CreateReservationRequest.PaymentInfo paymentInfo = new CreateReservationRequest.PaymentInfo();
        paymentInfo.setMethod(PaymentMethod.LYDIA);
        paymentInfo.setAmountCents(150);
        
        CreateReservationRequest request = new CreateReservationRequest();
        request.setPlate(" ab 123 cd "); // Espaces + minuscules
        request.setVehicleType("CAR");
        request.setParkingId(centreVilleParkingId);
        request.setStartAt(startAt);
        request.setDurationMinutes(30);
        request.setPayment(paymentInfo);

        // When/Then
        mockMvc.perform(post("/api/reservations")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.plate").value("AB123CD")); // Normalisé
    }
}
