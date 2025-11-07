package com.parkandsee.backend.controller;

import com.parkandsee.backend.dto.AgentOverviewDTO;
import com.parkandsee.backend.dto.ParkingInfringementsDTO;
import com.parkandsee.backend.dto.RegularizedHistoryDTO;
import com.parkandsee.backend.dto.VehicleDetailDTO;
import com.parkandsee.backend.entity.ReservationEntity;
import com.parkandsee.backend.entity.ReservationStatus;
import com.parkandsee.backend.repository.ReservationRepository;
import com.parkandsee.backend.service.AgentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Controller pour les endpoints du dashboard agent
 */
@RestController
@RequestMapping("/api/agent")
@CrossOrigin(origins = "*")
public class AgentController {

    private final AgentService agentService;
    private final ReservationRepository reservationRepository;

    public AgentController(AgentService agentService, ReservationRepository reservationRepository) {
        this.agentService = agentService;
        this.reservationRepository = reservationRepository;
    }

    /**
     * GET /api/agent/overview
     * Vue d'ensemble complète pour le dashboard
     */
    @GetMapping("/overview")
    public ResponseEntity<AgentOverviewDTO> getOverview() {
        try {
            AgentOverviewDTO overview = agentService.calculateOverview();
            return ResponseEntity.ok(overview);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * GET /api/agent/infringements
     * Liste des infractions groupées par parking
     */
    @GetMapping("/infringements")
    public ResponseEntity<List<ParkingInfringementsDTO>> getInfringements() {
        try {
            List<ParkingInfringementsDTO> infringements = agentService.getInfringements();
            return ResponseEntity.ok(infringements);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * POST /api/agent/infringements/{reservationId}/regularize
     * Régulariser une infraction
     */
    @PostMapping("/infringements/{reservationId}/regularize")
    public ResponseEntity<Map<String, Object>> regularizeInfringement(@PathVariable String reservationId) {
        try {
            Optional<ReservationEntity> optReservation = reservationRepository.findById(reservationId);
            
            if (optReservation.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            ReservationEntity reservation = optReservation.get();
            reservation.setStatus(ReservationStatus.REGULARISE);
            reservationRepository.save(reservation);
            
            Map<String, Object> response = new HashMap<>();
            response.put("regularized", true);
            response.put("reservationId", reservationId);
            response.put("status", "REGULARISE");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * GET /api/agent/regularized-history
     * Historique des véhicules régularisés
     */
    @GetMapping("/regularized-history")
    public ResponseEntity<List<RegularizedHistoryDTO>> getRegularizedHistory() {
        try {
            List<RegularizedHistoryDTO> history = agentService.getRegularizedHistory();
            return ResponseEntity.ok(history);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * GET /api/agent/parking/{parkingName}/vehicles
     * Liste des véhicules dans un parking spécifique
     */
    @GetMapping("/parking/{parkingName}/vehicles")
    public ResponseEntity<List<VehicleDetailDTO>> getVehiclesByParking(@PathVariable String parkingName) {
        try {
            List<VehicleDetailDTO> vehicles = agentService.getVehiclesByParking(parkingName);
            return ResponseEntity.ok(vehicles);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
}
