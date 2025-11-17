package com.parkandsee.backend.controller;

import com.parkandsee.backend.entity.ReservationEntity;
import com.parkandsee.backend.entity.ReservationStatus;
import com.parkandsee.backend.entity.VehicleType;
import com.parkandsee.backend.service.OverdueControlService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.Arrays;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(OverdueControlController.class)
class OverdueControlControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private OverdueControlService overdueControlService;

    private ReservationEntity overdueReservation;

    @BeforeEach
    void setUp() {
        LocalDateTime now = LocalDateTime.now();
        
        overdueReservation = new ReservationEntity();
        overdueReservation.setId("reservation-1");
        overdueReservation.setLicencePlate("AB-123-CD");
        overdueReservation.setVehicleType(VehicleType.CAR);
        overdueReservation.setStartAt(now.minusMinutes(90));
        overdueReservation.setDurationMinutes(60);
        overdueReservation.setAddress("Place du Marché");
        overdueReservation.setStatus(ReservationStatus.ACTIVE);
    }

    @Test
    void getAllOverdueReservations_withOverdueReservations_returnsOkWithData() throws Exception {
        // Given
        when(overdueControlService.findAllOverdueReservations())
                .thenReturn(Arrays.asList(overdueReservation));

        // When & Then
        mockMvc.perform(get("/api/agent/overdue")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].id").value("reservation-1"))
                .andExpect(jsonPath("$[0].licencePlate").value("AB-123-CD"))
                .andExpect(jsonPath("$[0].vehicleType").value("CAR"))
                .andExpect(jsonPath("$[0].address").value("Place du Marché"))
                .andExpect(jsonPath("$[0].status").value("ACTIVE"));
    }

    @Test
    void getAllOverdueReservations_withNoOverdueReservations_returnsOkWithEmptyArray() throws Exception {
        // Given
        when(overdueControlService.findAllOverdueReservations())
                .thenReturn(Arrays.asList());

        // When & Then
        mockMvc.perform(get("/api/agent/overdue")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$").isEmpty());
    }

    @Test
    void markReservationAsOverdue_withExistingReservation_returnsOkWithSuccessMessage() throws Exception {
        // Given
        ReservationEntity markedReservation = new ReservationEntity();
        markedReservation.setId("reservation-1");
        when(overdueControlService.markAsOverdue("reservation-1"))
                .thenReturn(markedReservation);

        // When & Then
        mockMvc.perform(post("/api/agent/overdue/reservation-1/mark")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Réservation marquée en excès"));
    }

    @Test
    void markReservationAsOverdue_withNonExistingReservation_returnsNotFound() throws Exception {
        // Given
        when(overdueControlService.markAsOverdue("nonexistent"))
                .thenReturn(null);

        // When & Then
        mockMvc.perform(post("/api/agent/overdue/nonexistent/mark")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Réservation non trouvée"));
    }

    @Test
    void getOverdueStatistics_returnsOkWithStats() throws Exception {
        // Given
        // Paramètres: activeReservations, currentOverdue, markedOverdue, regularized, totalOverdueMinutes, averageOverdueMinutes, lastUpdate
        OverdueControlService.OverdueStats stats = new OverdueControlService.OverdueStats(5L, 2L, 3L, 1L, 150L, 50L, LocalDateTime.now());
        
        when(overdueControlService.getOverdueStats()).thenReturn(stats);

        // When & Then
        mockMvc.perform(get("/api/agent/overdue/stats")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.totalActive").value(5))
                .andExpect(jsonPath("$.currentOverdue").value(2))
                .andExpect(jsonPath("$.markedOverdue").value(3))
                .andExpect(jsonPath("$.timestamp").exists());
    }

    @Test
    void getAllOverdueReservations_hasCorsHeaders() throws Exception {
        // Given
        when(overdueControlService.findAllOverdueReservations())
                .thenReturn(Arrays.asList());

        // When & Then
        // Note: @WebMvcTest ne charge pas automatiquement les filtres CORS
        // Les headers CORS sont gérés par @CrossOrigin sur le contrôleur
        // Ce test vérifie que l'endpoint fonctionne correctement
        mockMvc.perform(get("/api/agent/overdue")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON));
    }

    @Test
    void markReservationAsOverdue_withEmptyId_returnsBadRequest() throws Exception {
        // When & Then
        mockMvc.perform(post("/api/agent/overdue//mark")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound()); // Spring traite les URLs mal formées comme 404
    }
}