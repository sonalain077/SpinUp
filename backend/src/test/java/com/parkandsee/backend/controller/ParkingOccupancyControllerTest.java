package com.parkandsee.backend.controller;

import com.parkandsee.backend.dto.ParkingOccupancyDTO;
import com.parkandsee.backend.service.ParkingOccupancyService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Arrays;
import java.util.List;

import static org.hamcrest.Matchers.hasSize;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ParkingOccupancyController.class)
class ParkingOccupancyControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ParkingOccupancyService parkingOccupancyService;

    private List<ParkingOccupancyDTO> mockParkings;

    @BeforeEach
    void setUp() {
        ParkingOccupancyDTO parking1 = new ParkingOccupancyDTO();
        parking1.setParkingId("park-001");
        parking1.setParkingName("Parking Centre-Ville");
        parking1.setAddress("10 Rue de la République");
        parking1.setTotalSpots(150);
        parking1.setOccupiedSpots(45);
        parking1.setAvailableSpots(105);
        parking1.setOccupancyRate(30.0);
        parking1.setOverdueCount(2);

        ParkingOccupancyDTO parking2 = new ParkingOccupancyDTO();
        parking2.setParkingId("park-002");
        parking2.setParkingName("Parking Gare Nord");
        parking2.setAddress("25 Avenue de la Gare");
        parking2.setTotalSpots(200);
        parking2.setOccupiedSpots(180);
        parking2.setAvailableSpots(20);
        parking2.setOccupancyRate(90.0);
        parking2.setOverdueCount(5);

        mockParkings = Arrays.asList(parking1, parking2);
    }

    @Test
    void getParkingOccupancy_ShouldReturnListOfParkings() throws Exception {
        // Given
        when(parkingOccupancyService.getAllParkingOccupancy()).thenReturn(mockParkings);

        // When & Then
        mockMvc.perform(get("/api/parking/occupancy"))
                .andExpect(status().isOk())
                .andExpect(content().contentType("application/json"))
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].parkingName").value("Parking Centre-Ville"))
                .andExpect(jsonPath("$[0].totalSpots").value(150))
                .andExpect(jsonPath("$[0].occupiedSpots").value(45))
                .andExpect(jsonPath("$[0].occupancyRate").value(30.0))
                .andExpect(jsonPath("$[0].overdueCount").value(2))
                .andExpect(jsonPath("$[1].parkingName").value("Parking Gare Nord"))
                .andExpect(jsonPath("$[1].occupancyRate").value(90.0));
    }

    @Test
    void getParkingOccupancy_WithEmptyList_ShouldReturnEmptyArray() throws Exception {
        // Given
        when(parkingOccupancyService.getAllParkingOccupancy()).thenReturn(Arrays.asList());

        // When & Then
        mockMvc.perform(get("/api/parking/occupancy"))
                .andExpect(status().isOk())
                .andExpect(content().contentType("application/json"))
                .andExpect(jsonPath("$", hasSize(0)));
    }

    @Test
    void getParkingOccupancy_ShouldHaveCorrectStructure() throws Exception {
        // Given
        when(parkingOccupancyService.getAllParkingOccupancy()).thenReturn(mockParkings);

        // When & Then
        mockMvc.perform(get("/api/parking/occupancy"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].parkingId").exists())
                .andExpect(jsonPath("$[0].parkingName").exists())
                .andExpect(jsonPath("$[0].address").exists())
                .andExpect(jsonPath("$[0].totalSpots").exists())
                .andExpect(jsonPath("$[0].occupiedSpots").exists())
                .andExpect(jsonPath("$[0].availableSpots").exists())
                .andExpect(jsonPath("$[0].occupancyRate").exists())
                .andExpect(jsonPath("$[0].overdueCount").exists());
    }
}
