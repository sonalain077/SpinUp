package com.parkandsee.backend.controller;

import java.time.LocalDateTime;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.parkandsee.backend.dto.ExtensionRequest;
import com.parkandsee.backend.dto.PaymentResponse;
import com.parkandsee.backend.entity.ReservationEntity;
import com.parkandsee.backend.entity.VehicleType;
import com.parkandsee.backend.entity.ReservationStatus;
import com.parkandsee.backend.service.ParkingService;

@WebMvcTest(controllers = ParkingController.class)
@AutoConfigureMockMvc(addFilters = false) // Désactive les filtres de sécurité
class ParkingExtensionControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private ParkingService parkingService;

    private ExtensionRequest validExtensionRequest;
    private ReservationEntity activeReservation;
    private PaymentResponse extensionResponse;

    @BeforeEach
    void setUp() {
        // Setup active reservation
        activeReservation = new ReservationEntity();
        activeReservation.setId("R-12345");
        activeReservation.setLicencePlate("AB-123-CD");
        activeReservation.setVehicleType(VehicleType.CAR);
        activeReservation.setStartAt(LocalDateTime.now().minusHours(1));
        activeReservation.setDurationMinutes(120); // 2 heures
        activeReservation.setAddress("Test Parking");
        activeReservation.setPaymentAmount(3.0); // 2 heures = 3€
        activeReservation.setStatus(ReservationStatus.ACTIVE);

        // Setup valid extension request
        validExtensionRequest = new ExtensionRequest();
        validExtensionRequest.setReservationId("R-12345");
        validExtensionRequest.setLicencePlate("AB-123-CD");
        validExtensionRequest.setExtensionMinutes(60);
        validExtensionRequest.setPaymentToken("ext-token-123");

        // Setup extension response
        extensionResponse = new PaymentResponse();
        extensionResponse.setSuccess(true);
        extensionResponse.setReservationId("R-12345");
        extensionResponse.setPaymentAmount(1.50);
        extensionResponse.setMessage("Extension successful");
    }

    @Test
    void testSearchReservationByLicencePlate_Success() throws Exception {
        // Given
        when(parkingService.findActiveReservationByLicencePlate("AB-123-CD"))
            .thenReturn(Optional.of(activeReservation));

        // When & Then
        mockMvc.perform(get("/api/parking/search")
                .param("licencePlate", "AB-123-CD")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("R-12345"))
                .andExpect(jsonPath("$.licencePlate").value("AB-123-CD"))
                .andExpect(jsonPath("$.status").value("ACTIVE"));
    }

    @Test
    void testSearchReservationByLicencePlate_NotFound() throws Exception {
        // Given
        when(parkingService.findActiveReservationByLicencePlate("ZZ-999-ZZ"))
            .thenReturn(Optional.empty());

        // When & Then
        mockMvc.perform(get("/api/parking/search")
                .param("licencePlate", "ZZ-999-ZZ")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());
    }

    @Test
    void testSearchReservationByReservationId_Success() throws Exception {
        // Given
        when(parkingService.findActiveReservationById("R-12345"))
            .thenReturn(Optional.of(activeReservation));

        // When & Then
        mockMvc.perform(get("/api/parking/search")
                .param("reservationId", "R-12345")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("R-12345"))
                .andExpect(jsonPath("$.licencePlate").value("AB-123-CD"))
                .andExpect(jsonPath("$.status").value("ACTIVE"));
    }

    @Test
    void testSearchReservationByReservationId_NotFound() throws Exception {
        // Given
        when(parkingService.findActiveReservationById("R-99999"))
            .thenReturn(Optional.empty());

        // When & Then
        mockMvc.perform(get("/api/parking/search")
                .param("reservationId", "R-99999")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());
    }

    @Test
    void testExtendReservation_Success() throws Exception {
        // Given
        when(parkingService.extendReservation(any(ExtensionRequest.class)))
            .thenReturn(extensionResponse);

        // When & Then
        mockMvc.perform(post("/api/parking/extend")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(validExtensionRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.reservationId").value("R-12345"))
                .andExpect(jsonPath("$.amount").value(1.50))
                .andExpect(jsonPath("$.message").value("Extension successful"));
    }

    @Test
    void testExtendReservation_InvalidRequest() throws Exception {
        // Given - invalid request (missing required fields)
        ExtensionRequest invalidRequest = new ExtensionRequest();
        invalidRequest.setExtensionMinutes(60); // Missing reservationId and paymentToken

        // When & Then
        mockMvc.perform(post("/api/parking/extend")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void testExtendReservation_ReservationNotFound() throws Exception {
        // Given
        PaymentResponse errorResponse = new PaymentResponse();
        errorResponse.setSuccess(false);
        errorResponse.setMessage("Reservation not found");

        when(parkingService.extendReservation(any(ExtensionRequest.class)))
            .thenReturn(errorResponse);

        // When & Then
        mockMvc.perform(post("/api/parking/extend")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(validExtensionRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Reservation not found"));
    }

    @Test
    void testSearchReservation_MissingParameters() throws Exception {
        // When & Then - no parameters provided
        mockMvc.perform(get("/api/parking/search")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest());
    }

    @Test
    void testSearchReservation_InvalidLicencePlateFormat() throws Exception {
        // Given - invalid licence plate format
        when(parkingService.findActiveReservationByLicencePlate("INVALID"))
            .thenReturn(Optional.empty());

        // When & Then
        mockMvc.perform(get("/api/parking/search")
                .param("licencePlate", "INVALID")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());
    }

    @Test
    void testExtendReservation_NegativeExtensionMinutes() throws Exception {
        // Given - negative extension minutes
        validExtensionRequest.setExtensionMinutes(-30);

        // When & Then
        mockMvc.perform(post("/api/parking/extend")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(validExtensionRequest)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void testExtendReservation_ZeroExtensionMinutes() throws Exception {
        // Given - zero extension minutes
        validExtensionRequest.setExtensionMinutes(0);

        // When & Then
        mockMvc.perform(post("/api/parking/extend")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(validExtensionRequest)))
                .andExpect(status().isBadRequest());
    }
}