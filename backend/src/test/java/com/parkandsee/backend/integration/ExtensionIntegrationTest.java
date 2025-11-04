package com.parkandsee.backend.integration;

import java.time.LocalDateTime;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureWebMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.WebApplicationContext;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.parkandsee.backend.dto.ExtensionRequest;
import com.parkandsee.backend.dto.PaymentRequest;
import com.parkandsee.backend.dto.PaymentResponse;
import com.parkandsee.backend.service.ParkingService;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.MOCK)
@AutoConfigureWebMvc
@TestPropertySource(properties = {
    "spring.datasource.url=jdbc:h2:mem:testdb_extension",
    "spring.jpa.hibernate.ddl-auto=create-drop"
})
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_EACH_TEST_METHOD)
class ExtensionIntegrationTest {

    @Autowired
    private WebApplicationContext webApplicationContext;

    @Autowired
    private ParkingService parkingService;

    @Autowired
    private ObjectMapper objectMapper;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext).build();
    }

    @Test
    @Transactional
    void testCompleteExtensionFlow() throws Exception {
        // Step 1: Create initial reservation
        PaymentRequest initialRequest = new PaymentRequest();
        initialRequest.setLicencePlate("AB-123-CD");
        initialRequest.setVehicleType("car");
        initialRequest.setStartAt(LocalDateTime.now().plusMinutes(15));
        initialRequest.setDurationMinutes(120); // 2 hours
        initialRequest.setAddress("Test Parking Center");
        initialRequest.setPaymentToken("initial-token-123");
        initialRequest.setPaymentAmount(3.0);

        // Create reservation via service
        PaymentResponse reservationResponse = parkingService.reserveAndPay(initialRequest);
        String reservationId = reservationResponse.getReservationId();

        // Step 2: Search for the reservation by licence plate
        mockMvc.perform(get("/api/parking/search")
                .param("licencePlate", "AB-123-CD")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(reservationId))
                .andExpect(jsonPath("$.licencePlate").value("AB-123-CD"))
                .andExpect(jsonPath("$.status").value("ACTIVE"))
                .andExpect(jsonPath("$.durationMinutes").value(120));

        // Step 3: Search for the reservation by reservation ID
        mockMvc.perform(get("/api/parking/search")
                .param("reservationId", reservationId)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(reservationId))
                .andExpect(jsonPath("$.licencePlate").value("AB-123-CD"));

        // Step 4: Extend the reservation
        ExtensionRequest extensionRequest = new ExtensionRequest();
        extensionRequest.setReservationId(reservationId);
        extensionRequest.setLicencePlate("AB-123-CD");
        extensionRequest.setExtensionMinutes(60); // 1 hour extension
        extensionRequest.setPaymentToken("extension-token-456");

        mockMvc.perform(post("/api/parking/extend")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(extensionRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.reservationId").value(reservationId))
                .andExpect(jsonPath("$.paymentAmount").value(1.50)) // 1 hour = 1.50€
                .andExpect(jsonPath("$.message").value("Stationnement rallongé de 60 minutes"));

        // Step 5: Verify the reservation was extended
        mockMvc.perform(get("/api/parking/search")
                .param("reservationId", reservationId)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.durationMinutes").value(180)) // 120 + 60
                .andExpect(jsonPath("$.paymentAmount").value(4.50)); // 3.0 + 1.50
    }

    @Test
    @Transactional
    void testExtensionWithoutLicencePlateVerification() throws Exception {
        // Step 1: Create initial reservation
        PaymentRequest initialRequest = new PaymentRequest();
        initialRequest.setLicencePlate("XY-789-ZZ");
        initialRequest.setVehicleType("motorcycle");
        initialRequest.setStartAt(LocalDateTime.now().plusMinutes(30));
        initialRequest.setDurationMinutes(60);
        initialRequest.setAddress("Test Parking");
        initialRequest.setPaymentToken("token-789");
        initialRequest.setPaymentAmount(1.50);

        PaymentResponse reservationResponse = parkingService.reserveAndPay(initialRequest);
        String reservationId = reservationResponse.getReservationId();

        // Step 2: Extend without providing licence plate
        ExtensionRequest extensionRequest = new ExtensionRequest();
        extensionRequest.setReservationId(reservationId);
        // No licence plate provided
        extensionRequest.setExtensionMinutes(30);
        extensionRequest.setPaymentToken("extension-token");

        mockMvc.perform(post("/api/parking/extend")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(extensionRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.paymentAmount").value(1.50)); // 30 min = 1.50€
    }

    @Test
    void testSearchNonExistentReservation() throws Exception {
        // Search by licence plate
        mockMvc.perform(get("/api/parking/search")
                .param("licencePlate", "ZZ-999-ZZ")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());

        // Search by reservation ID
        mockMvc.perform(get("/api/parking/search")
                .param("reservationId", "R-NONEXISTENT")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());
    }

    @Test
    void testExtensionErrors() throws Exception {
        // Test 1: Extend non-existent reservation
        ExtensionRequest nonExistentRequest = new ExtensionRequest();
        nonExistentRequest.setReservationId("R-NONEXISTENT");
        nonExistentRequest.setExtensionMinutes(60);
        nonExistentRequest.setPaymentToken("token");

        mockMvc.perform(post("/api/parking/extend")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(nonExistentRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Réservation non trouvée ou expirée"));

        // Test 2: Invalid request (missing required fields)
        ExtensionRequest invalidRequest = new ExtensionRequest();
        invalidRequest.setExtensionMinutes(60); // Missing reservationId and paymentToken

        mockMvc.perform(post("/api/parking/extend")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void testSearchWithoutParameters() throws Exception {
        // Search without any parameters should return bad request
        mockMvc.perform(get("/api/parking/search")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest());
    }

    @Test
    @Transactional
    void testMultipleExtensions() throws Exception {
        // Create initial reservation
        PaymentRequest initialRequest = new PaymentRequest();
        initialRequest.setLicencePlate("MU-456-LT");
        initialRequest.setVehicleType("van");
        initialRequest.setStartAt(LocalDateTime.now().plusMinutes(10));
        initialRequest.setDurationMinutes(60);
        initialRequest.setAddress("Multi Extension Parking");
        initialRequest.setPaymentToken("multi-token");
        initialRequest.setPaymentAmount(1.50);

        PaymentResponse reservationResponse = parkingService.reserveAndPay(initialRequest);
        String reservationId = reservationResponse.getReservationId();

        // First extension: 30 minutes
        ExtensionRequest firstExtension = new ExtensionRequest();
        firstExtension.setReservationId(reservationId);
        firstExtension.setExtensionMinutes(30);
        firstExtension.setPaymentToken("ext1-token");

        mockMvc.perform(post("/api/parking/extend")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(firstExtension)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.paymentAmount").value(1.50));

        // Second extension: 45 minutes (should cost 3.0€ = 2 * 1.50€)
        ExtensionRequest secondExtension = new ExtensionRequest();
        secondExtension.setReservationId(reservationId);
        secondExtension.setExtensionMinutes(45);
        secondExtension.setPaymentToken("ext2-token");

        mockMvc.perform(post("/api/parking/extend")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(secondExtension)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.paymentAmount").value(3.0));

        // Verify final state: 60 + 30 + 45 = 135 minutes, 1.50 + 1.50 + 3.0 = 6.0€
        mockMvc.perform(get("/api/parking/search")
                .param("reservationId", reservationId)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.durationMinutes").value(135))
                .andExpect(jsonPath("$.paymentAmount").value(6.0));
    }
}