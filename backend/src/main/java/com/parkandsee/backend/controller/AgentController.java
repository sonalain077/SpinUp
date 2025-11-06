package com.parkandsee.backend.controller;

import com.parkandsee.backend.dto.AgentOverviewDTO;
import com.parkandsee.backend.dto.ParkedVehicleDTO;
import com.parkandsee.backend.service.AgentDashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

/**
 * Controller REST pour le Dashboard Agent.
 * Fournit les statistiques et la liste des véhicules/infractions.
 */
@RestController
@RequestMapping("/api/agent")
@CrossOrigin(origins = "*")
public class AgentController {

    private final AgentDashboardService agentDashboardService;

    public AgentController(AgentDashboardService agentDashboardService) {
        this.agentDashboardService = agentDashboardService;
    }

    /**
     * GET /api/agent/parked
     * 
     * Retourne la liste des véhicules actuellement garés.
     * (Status = ACTIVE ET endAt > now)
     * 
     * Response:
     * [
     *   {
     *     "plate": "CD-555-EF",
     *     "vehicleType": "CAR",
     *     "parkingName": "Parking Centre Ville",
     *     "startAt": "2025-11-06T08:23:00Z",
     *     "endAt": "2025-11-06T10:23:00Z",
     *     "remainingMinutes": 64
     *   }
     * ]
     */
    @GetMapping("/parked")
    public ResponseEntity<List<ParkedVehicleDTO>> getParkedVehicles() {
        List<ParkedVehicleDTO> parked = agentDashboardService.getParkedVehicles();
        return ResponseEntity.ok(parked);
    }

    /**
     * GET /api/agent/overview
     * 
     * Retourne une vue d'ensemble complète:
     * - totals: véhicules garés, capacité totale, indice de saturation
     * - perParking: occupation par parking
     * - infringements: liste des infractions avec sévérité
     * 
     * Response:
     * {
     *   "totals": {
     *     "parkedVehicles": 11,
     *     "capacity": 180,
     *     "saturationIndex": 0.06
     *   },
     *   "perParking": [
     *     { "parkingId": "...", "parkingName": "Centre Ville", "used": 3, "capacity": 40 }
     *   ],
     *   "infringements": [
     *     {
     *       "plate": "CD-555-EF",
     *       "vehicleType": "CAR",
     *       "parkingName": "Centre Ville",
     *       "paidMinutes": 120,
     *       "startAt": "2025-11-06T08:23:00Z",
     *       "endAt": "2025-11-06T10:23:00Z",
     *       "exceededMinutes": 79,
     *       "severity": "GRAVE"
     *     }
     *   ]
     * }
     */
    @GetMapping("/overview")
    public ResponseEntity<AgentOverviewDTO> getOverview() {
        AgentOverviewDTO overview = agentDashboardService.getOverview();
        return ResponseEntity.ok(overview);
    }
}
