package com.parkandsee.backend.controller;

import com.parkandsee.backend.dto.ActiveVehicleDTO;
import com.parkandsee.backend.service.ActiveVehicleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Controller pour gérer les véhicules actuellement stationnés
 */
@RestController
@RequestMapping("/api/vehicles")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class ActiveVehicleController {
    
    private final ActiveVehicleService activeVehicleService;
    
    /**
     * GET /api/vehicles/active - Tous les véhicules stationnés
     */
    @GetMapping("/active")
    public ResponseEntity<List<ActiveVehicleDTO>> getAllActiveVehicles() {
        List<ActiveVehicleDTO> vehicles = activeVehicleService.getAllActiveVehicles();
        return ResponseEntity.ok(vehicles);
    }
    
    /**
     * GET /api/vehicles/overdue - Véhicules en retard uniquement
     */
    @GetMapping("/overdue")
    public ResponseEntity<List<ActiveVehicleDTO>> getOverdueVehicles() {
        List<ActiveVehicleDTO> vehicles = activeVehicleService.getOverdueVehicles();
        return ResponseEntity.ok(vehicles);
    }
    
    /**
     * GET /api/vehicles/count - Compteurs
     */
    @GetMapping("/count")
    public ResponseEntity<Map<String, Integer>> getVehicleCounts() {
        List<ActiveVehicleDTO> allVehicles = activeVehicleService.getAllActiveVehicles();
        
        int total = allVehicles.size();
        int overdue = (int) allVehicles.stream()
            .filter(v -> "OVERDUE".equals(v.getStatus()))
            .count();
        int active = total - overdue;
        
        Map<String, Integer> counts = new HashMap<>();
        counts.put("total", total);
        counts.put("active", active);
        counts.put("overdue", overdue);
        
        return ResponseEntity.ok(counts);
    }
}
