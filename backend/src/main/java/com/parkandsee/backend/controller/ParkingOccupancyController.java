package com.parkandsee.backend.controller;

import com.parkandsee.backend.dto.ParkingOccupancyDTO;
import com.parkandsee.backend.service.ParkingOccupancyService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller pour gérer l'occupation des parkings
 */
@RestController
@RequestMapping("/api/parking")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class ParkingOccupancyController {
    
    private final ParkingOccupancyService parkingOccupancyService;
    
    /**
     * GET /api/parking/occupancy - Occupation de tous les parkings
     */
    @GetMapping("/occupancy")
    public ResponseEntity<List<ParkingOccupancyDTO>> getAllParkingOccupancy() {
        List<ParkingOccupancyDTO> occupancy = parkingOccupancyService.getAllParkingOccupancy();
        return ResponseEntity.ok(occupancy);
    }
}
