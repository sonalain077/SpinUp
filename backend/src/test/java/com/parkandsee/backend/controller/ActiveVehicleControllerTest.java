package com.parkandsee.backend.controller;

import com.parkandsee.backend.dto.ActiveVehicleDTO;
import com.parkandsee.backend.service.ActiveVehicleService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Arrays;
import java.util.List;

import static org.hamcrest.Matchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ActiveVehicleController.class)
class ActiveVehicleControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ActiveVehicleService activeVehicleService;

    private List<ActiveVehicleDTO> mockVehicles;
    private List<ActiveVehicleDTO> mockOverdueVehicles;

    @BeforeEach
    void setUp() {
        ActiveVehicleDTO vehicle1 = new ActiveVehicleDTO();
        vehicle1.setLicencePlate("AB-123-CD");
        vehicle1.setVehicleType("CAR");
        vehicle1.setParkingName("Parking Centre-Ville");
        vehicle1.setDurationMinutes(60);
        vehicle1.setRemainingMinutes(30);
        vehicle1.setStatus("ACTIVE");
        vehicle1.setAmountPaid(3.0);

        ActiveVehicleDTO vehicle2 = new ActiveVehicleDTO();
        vehicle2.setLicencePlate("EF-456-GH");
        vehicle2.setVehicleType("MOTORCYCLE");
        vehicle2.setParkingName("Parking Gare Nord");
        vehicle2.setDurationMinutes(60);
        vehicle2.setRemainingMinutes(-15);
        vehicle2.setStatus("OVERDUE");
        vehicle2.setAmountPaid(3.0);

        mockVehicles = Arrays.asList(vehicle1, vehicle2);
        mockOverdueVehicles = Arrays.asList(vehicle2);
    }

    @Test
    void getAllActiveVehicles_ShouldReturnListOfVehicles() throws Exception {
        // Given
        when(activeVehicleService.getAllActiveVehicles()).thenReturn(mockVehicles);

        // When & Then
        mockMvc.perform(get("/api/vehicles/active"))
                .andExpect(status().isOk())
                .andExpect(content().contentType("application/json"))
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].licencePlate").value("AB-123-CD"))
                .andExpect(jsonPath("$[0].status").value("ACTIVE"))
                .andExpect(jsonPath("$[1].licencePlate").value("EF-456-GH"))
                .andExpect(jsonPath("$[1].status").value("OVERDUE"));
    }

    @Test
    void getOverdueVehicles_ShouldReturnOnlyOverdueVehicles() throws Exception {
        // Given
        when(activeVehicleService.getOverdueVehicles()).thenReturn(mockOverdueVehicles);

        // When & Then
        mockMvc.perform(get("/api/vehicles/overdue"))
                .andExpect(status().isOk())
                .andExpect(content().contentType("application/json"))
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].licencePlate").value("EF-456-GH"))
                .andExpect(jsonPath("$[0].status").value("OVERDUE"))
                .andExpect(jsonPath("$[0].remainingMinutes").value(-15));
    }

    @Test
    void getVehicleCount_ShouldReturnCorrectCounts() throws Exception {
        // Given
        when(activeVehicleService.getAllActiveVehicles()).thenReturn(mockVehicles);
        when(activeVehicleService.getOverdueVehicles()).thenReturn(mockOverdueVehicles);

        // When & Then
        mockMvc.perform(get("/api/vehicles/count"))
                .andExpect(status().isOk())
                .andExpect(content().contentType("application/json"))
                .andExpect(jsonPath("$.total").value(2))
                .andExpect(jsonPath("$.active").value(1))
                .andExpect(jsonPath("$.overdue").value(1));
    }

    @Test
    void getAllActiveVehicles_WithEmptyList_ShouldReturnEmptyArray() throws Exception {
        // Given
        when(activeVehicleService.getAllActiveVehicles()).thenReturn(Arrays.asList());

        // When & Then
        mockMvc.perform(get("/api/vehicles/active"))
                .andExpect(status().isOk())
                .andExpect(content().contentType("application/json"))
                .andExpect(jsonPath("$", hasSize(0)));
    }

    @Test
    void getOverdueVehicles_WithNoOverdueVehicles_ShouldReturnEmptyArray() throws Exception {
        // Given
        when(activeVehicleService.getOverdueVehicles()).thenReturn(Arrays.asList());

        // When & Then
        mockMvc.perform(get("/api/vehicles/overdue"))
                .andExpect(status().isOk())
                .andExpect(content().contentType("application/json"))
                .andExpect(jsonPath("$", hasSize(0)));
    }
}
