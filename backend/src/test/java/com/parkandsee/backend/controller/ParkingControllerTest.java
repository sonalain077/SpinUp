package com.parkandsee.backend.controller;

import java.time.LocalDateTime;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.parkandsee.backend.dto.PaymentRequest;
import com.parkandsee.backend.dto.PaymentResponse;
import com.parkandsee.backend.service.ParkingService;

@WebMvcTest(ParkingController.class)
class ParkingControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private ParkingService parkingService;

    private PaymentRequest validRequest;
    private PaymentResponse successResponse;

    @BeforeEach
    void setUp() {
        // Setup valid payment request
        validRequest = new PaymentRequest();
        validRequest.setLicencePlate("AB-123-CD");
        validRequest.setVehicleType("voiture");
        validRequest.setStartAt(LocalDateTime.now().plusHours(1));
        validRequest.setDurationMinutes(60);
        validRequest.setAddress("123 Test Street");
        validRequest.setPaymentToken("test-token-123");

        // Setup success response
        successResponse = new PaymentResponse(true, "Reservation confirmed", "test-reservation-id");
    }

    @Test
    void ping_ShouldReturnBackendRunningMessage() throws Exception {
        mockMvc.perform(get("/api/parking/ping"))
                .andExpect(status().isOk())
                .andExpect(content().string("Backend is running!"));
    }

    @Test
    void status_ShouldReturnJsonStatus() throws Exception {
        mockMvc.perform(get("/api/parking/status"))
                .andExpect(status().isOk())
                .andExpect(content().contentType("application/json"))
                .andExpect(content().string("{\"status\": \"OK\", \"service\": \"Park & See Backend\"}"));
    }

    @Test
    void reserveAndPay_WithValidRequest_ShouldReturnSuccess() throws Exception {
        // Given
        when(parkingService.reserveAndPay(any(PaymentRequest.class))).thenReturn(successResponse);

        // When & Then
        mockMvc.perform(post("/api/parking/reserve")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(validRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Reservation confirmed"))
                .andExpect(jsonPath("$.reservationId").value("test-reservation-id"));
    }

    @Test
    void reserveAndPay_WithFailedPayment_ShouldReturnFailure() throws Exception {
        // Given
        PaymentResponse failureResponse = new PaymentResponse(false, "Payment failed", null);
        when(parkingService.reserveAndPay(any(PaymentRequest.class))).thenReturn(failureResponse);

        // When & Then
        mockMvc.perform(post("/api/parking/reserve")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(validRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Payment failed"))
                .andExpect(jsonPath("$.reservationId").isEmpty());
    }

    @Test
    void reserveAndPay_WithMissingLicencePlate_ShouldReturnBadRequest() throws Exception {
        // Given
        validRequest.setLicencePlate(null);

        // When & Then
        mockMvc.perform(post("/api/parking/reserve")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(validRequest)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void reserveAndPay_WithEmptyLicencePlate_ShouldReturnBadRequest() throws Exception {
        // Given
        validRequest.setLicencePlate("");

        // When & Then
        mockMvc.perform(post("/api/parking/reserve")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(validRequest)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void reserveAndPay_WithMissingVehicleType_ShouldReturnBadRequest() throws Exception {
        // Given
        validRequest.setVehicleType(null);

        // When & Then
        mockMvc.perform(post("/api/parking/reserve")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(validRequest)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void reserveAndPay_WithPastStartTime_ShouldReturnBadRequest() throws Exception {
        // Given
        validRequest.setStartAt(LocalDateTime.now().minusHours(1));

        // When & Then
        mockMvc.perform(post("/api/parking/reserve")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(validRequest)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void reserveAndPay_WithNullDuration_ShouldReturnBadRequest() throws Exception {
        // Given
        validRequest.setDurationMinutes(null);

        // When & Then
        mockMvc.perform(post("/api/parking/reserve")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(validRequest)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void reserveAndPay_WithMissingAddress_ShouldReturnBadRequest() throws Exception {
        // Given
        validRequest.setAddress(null);

        // When & Then
        mockMvc.perform(post("/api/parking/reserve")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(validRequest)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void reserveAndPay_WithInvalidJson_ShouldReturnBadRequest() throws Exception {
        // When & Then
        mockMvc.perform(post("/api/parking/reserve")
                .contentType(MediaType.APPLICATION_JSON)
                .content("invalid json"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void reserveAndPay_WithMissingContentType_ShouldReturnUnsupportedMediaType() throws Exception {
        // When & Then
        mockMvc.perform(post("/api/parking/reserve")
                .content(objectMapper.writeValueAsString(validRequest)))
                .andExpect(status().isUnsupportedMediaType());
    }
}