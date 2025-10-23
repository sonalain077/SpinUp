package com.parkandsee.backend;

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.parkandsee.backend.dto.PaymentRequest;
import com.parkandsee.backend.entity.VehicleType;
import com.parkandsee.backend.entity.ReservationEntity;
import com.parkandsee.backend.repository.ReservationRepository;

@SpringBootTest
@AutoConfigureMockMvc
@TestPropertySource(properties = {
    "spring.datasource.url=jdbc:h2:mem:integrationtestdb",
    "spring.jpa.hibernate.ddl-auto=create-drop",
    "spring.h2.console.enabled=true"
})
@Transactional
class IntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private ReservationRepository reservationRepository;

    private PaymentRequest validRequest;

    @BeforeEach
    void setUp() {
        // Clean database before each test
        reservationRepository.deleteAll();
        
        // Setup valid payment request
        validRequest = new PaymentRequest();
        validRequest.setLicencePlate("IT-999-XX");
        validRequest.setVehicleType("CAR");
        validRequest.setStartAt(LocalDateTime.now().plusHours(2));
        validRequest.setDurationMinutes(120);
        validRequest.setAddress("Integration Test Parking, Test City");
        validRequest.setPaymentToken("integration-test-token");
    }

    @Test
    void pingEndpoint_ShouldReturnSuccessMessage() throws Exception {
        mockMvc.perform(get("/api/parking/ping"))
                .andExpect(status().isOk())
                .andExpect(content().string("Backend is running!"));
    }

    @Test
    void statusEndpoint_ShouldReturnJsonStatus() throws Exception {
        mockMvc.perform(get("/api/parking/status"))
                .andExpect(status().isOk())
                .andExpect(content().contentType("application/json"))
                .andExpect(jsonPath("$.status").value("OK"))
                .andExpect(jsonPath("$.service").value("Park & See Backend"));
    }

    @Test
    void fullReservationFlow_ShouldCreateReservationInDatabase() throws Exception {
        // Verify database is initially empty
        assertEquals(0, reservationRepository.count());

        // Make reservation request
        mockMvc.perform(post("/api/parking/reserve")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(validRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Reservation confirmed"))
                .andExpect(jsonPath("$.reservationId").exists());

        // Verify database now contains the reservation
        assertEquals(1, reservationRepository.count());

        // Verify the stored data
        List<ReservationEntity> reservations = reservationRepository.findAll();
        ReservationEntity savedReservation = reservations.get(0);

        assertEquals("IT-999-XX", savedReservation.getLicencePlate());
        assertEquals(VehicleType.CAR, savedReservation.getVehicleType());
        assertEquals(120, savedReservation.getDurationMinutes());
        assertEquals("Integration Test Parking, Test City", savedReservation.getAddress());
        assertNotNull(savedReservation.getId());
        assertNotNull(savedReservation.getCreatedAt());
        assertNotNull(savedReservation.getStartAt());
    }

    @Test
    void multipleReservations_ShouldCreateMultipleRecords() throws Exception {
        // Create first reservation
        mockMvc.perform(post("/api/parking/reserve")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(validRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        // Create second reservation with different data
        PaymentRequest secondRequest = new PaymentRequest();
        secondRequest.setLicencePlate("XY-789-ZA");
        secondRequest.setVehicleType("MOTORCYCLE");
        secondRequest.setStartAt(LocalDateTime.now().plusHours(3));
        secondRequest.setDurationMinutes(60);
        secondRequest.setAddress("Second Test Parking");
        secondRequest.setPaymentToken("second-token");

        mockMvc.perform(post("/api/parking/reserve")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(secondRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        // Verify both reservations are stored
        assertEquals(2, reservationRepository.count());

        List<ReservationEntity> reservations = reservationRepository.findAll();
        assertEquals(2, reservations.size());

        // Verify different licence plates
        assertTrue(reservations.stream().anyMatch(r -> "IT-999-XX".equals(r.getLicencePlate())));
        assertTrue(reservations.stream().anyMatch(r -> "XY-789-ZA".equals(r.getLicencePlate())));
    }

    @Test
    void reservationWithValidation_ShouldRejectInvalidData() throws Exception {
        // Test with missing licence plate
        validRequest.setLicencePlate(null);

        mockMvc.perform(post("/api/parking/reserve")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(validRequest)))
                .andExpect(status().isBadRequest());

        // Verify no record was created
        assertEquals(0, reservationRepository.count());
    }

    @Test
    void reservationWithEmptyFields_ShouldRejectRequest() throws Exception {
        // Test with empty licence plate
        validRequest.setLicencePlate("");

        mockMvc.perform(post("/api/parking/reserve")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(validRequest)))
                .andExpect(status().isBadRequest());

        // Verify no record was created
        assertEquals(0, reservationRepository.count());
    }

    @Test
    void reservationWithPastStartTime_ShouldRejectRequest() throws Exception {
        // Set start time in the past
        validRequest.setStartAt(LocalDateTime.now().minusHours(1));

        mockMvc.perform(post("/api/parking/reserve")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(validRequest)))
                .andExpect(status().isBadRequest());

        // Verify no record was created
        assertEquals(0, reservationRepository.count());
    }

    @Test
    void reservationWithNullPaymentToken_ShouldStillSucceed() throws Exception {
        // Set payment token to null (should still work as per business logic)
        validRequest.setPaymentToken(null);

        mockMvc.perform(post("/api/parking/reserve")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(validRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Reservation confirmed"));

        // Verify record was created
        assertEquals(1, reservationRepository.count());
    }

    @Test
    void reservationWithDifferentVehicleTypes_ShouldWork() throws Exception {
        String[] vehicleTypes = {"CAR", "MOTORCYCLE", "BICYCLE", "ELECTRIC_SCOOTER"};
        String[] plates = {"AB-123-CD", "EF-456-GH", "IJ-789-KL", "MN-012-OP"};
        
        for (int i = 0; i < vehicleTypes.length; i++) {
            validRequest.setLicencePlate(plates[i]);
            validRequest.setVehicleType(vehicleTypes[i]);

            mockMvc.perform(post("/api/parking/reserve")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(validRequest)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success").value(true));
        }

        // Verify all reservations were created
        assertEquals(vehicleTypes.length, reservationRepository.count());

        // Verify all vehicle types are stored correctly
        List<ReservationEntity> reservations = reservationRepository.findAll();
        for (String vehicleType : vehicleTypes) {
            assertTrue(reservations.stream().anyMatch(r -> vehicleType.equals(r.getVehicleType().name())),
                    "Vehicle type " + vehicleType + " should be found in reservations");
        }
    }

    @Test
    void reservationWithDifferentDurations_ShouldWork() throws Exception {
        Integer[] durations = {15, 30, 60, 120, 240, 480};
        String[] plates = {"AB-015-CD", "EF-030-GH", "IJ-060-KL", "MN-120-OP", "QR-240-ST", "UV-480-WX"};
        
        for (int i = 0; i < durations.length; i++) {
            validRequest.setLicencePlate(plates[i]);
            validRequest.setDurationMinutes(durations[i]);

            mockMvc.perform(post("/api/parking/reserve")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(validRequest)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success").value(true));
        }

        // Verify all reservations were created
        assertEquals(durations.length, reservationRepository.count());

        // Verify all durations are stored correctly
        List<ReservationEntity> reservations = reservationRepository.findAll();
        for (Integer duration : durations) {
            assertTrue(reservations.stream().anyMatch(r -> duration.equals(r.getDurationMinutes())),
                    "Duration " + duration + " should be found in reservations");
        }
    }

    @Test
    void reservationResponse_ShouldContainValidUUID() throws Exception {
        String responseContent = mockMvc.perform(post("/api/parking/reserve")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(validRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.reservationId").exists())
                .andReturn()
                .getResponse()
                .getContentAsString();

        // Parse response to get reservation ID
        com.fasterxml.jackson.databind.JsonNode jsonNode = objectMapper.readTree(responseContent);
        String reservationId = jsonNode.get("reservationId").asText();

        // Verify UUID format (RFC 4122 compliant UUID)
        assertTrue(reservationId.matches("^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$"),
                "Reservation ID should be a valid UUID format");
        
        // Verify a reservation was created
        assertEquals(1, reservationRepository.findAll().size());
    }

    @Test
    void applicationContext_ShouldStartSuccessfully() {
        // This test verifies that the Spring context starts without errors
        // If the application context fails to start, this test will fail
        assertTrue(true, "Application context should start successfully");
    }
}