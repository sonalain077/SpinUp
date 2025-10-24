package com.parkandsee.backend.controller;

import com.parkandsee.backend.entity.ReservationEntity;
import com.parkandsee.backend.service.OverdueControlService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

/**
 * Contrôleur REST pour la gestion des excès de durée de stationnement
 * Interface destinée aux agents de contrôle
 */
@RestController
@RequestMapping("/api/agent/overdue")
@CrossOrigin(origins = "*") // Pour permettre l'accès depuis le frontend
public class OverdueControlController {

    @Autowired
    private OverdueControlService overdueControlService;

    /**
     * GET /api/agent/overdue
     * Récupère toutes les réservations en excès de temps
     */
    @GetMapping
    public ResponseEntity<List<ReservationEntity>> getAllOverdueReservations() {
        List<ReservationEntity> overdueReservations = overdueControlService.findAllOverdueReservations();
        return ResponseEntity.ok(overdueReservations);
    }

    /**
     * GET /api/agent/overdue/by-plate/{licencePlate}
     * Récupère les réservations en excès pour une plaque spécifique
     */
    @GetMapping("/by-plate/{licencePlate}")
    public ResponseEntity<List<ReservationEntity>> getOverdueByLicencePlate(
            @PathVariable String licencePlate) {
        List<ReservationEntity> overdueReservations = 
                overdueControlService.findOverdueByLicencePlate(licencePlate);
        return ResponseEntity.ok(overdueReservations);
    }

    /**
     * POST /api/agent/overdue/{reservationId}/mark
     * Marque une réservation comme étant en dépassement
     */
    @PostMapping("/{reservationId}/mark")
    public ResponseEntity<?> markReservationAsOverdue(
            @PathVariable String reservationId) {
        ReservationEntity updatedReservation = overdueControlService.markAsOverdue(reservationId);
        
        if (updatedReservation == null) {
            return ResponseEntity.status(404)
                    .body(new MarkResponse(false, "Réservation non trouvée"));
        }
        
        return ResponseEntity.ok(new MarkResponse(true, "Réservation marquée en excès"));
    }

    /**
     * POST /api/agent/overdue/update-all
     * Met à jour automatiquement toutes les réservations en excès
     */
    @PostMapping("/update-all")
    public ResponseEntity<UpdateAllResponse> updateAllOverdueReservations() {
        int updatedCount = overdueControlService.updateOverdueReservations();
        return ResponseEntity.ok(new UpdateAllResponse(updatedCount));
    }

    /**
     * GET /api/agent/overdue/stats
     * Récupère les statistiques des excès de temps
     */
    @GetMapping("/stats")
    public ResponseEntity<OverdueControlService.OverdueStats> getOverdueStats() {
        OverdueControlService.OverdueStats stats = overdueControlService.getOverdueStats();
        return ResponseEntity.ok(stats);
    }

    /**
     * GET /api/agent/overdue/all-active
     * Récupère TOUTES les réservations actives (ACTIVE + SIGNALE)
     * Pour le Dashboard Agent : affiche tous les véhicules présents
     */
    @GetMapping("/all-active")
    public ResponseEntity<List<ReservationEntity>> getAllActiveReservations() {
        List<ReservationEntity> allActive = overdueControlService.findAllActiveReservations();
        return ResponseEntity.ok(allActive);
    }

    /**
     * GET /api/agent/occupation
     * Récupère les statistiques d'occupation en temps réel
     */
    @GetMapping("/occupation")
    public ResponseEntity<OverdueControlService.OccupationStats> getOccupationStats() {
        OverdueControlService.OccupationStats stats = overdueControlService.getOccupationStats();
        return ResponseEntity.ok(stats);
    }

    /**
     * GET /api/agent/occupation/by-zone
     * Récupère les statistiques d'occupation par zone/parking
     */
    @GetMapping("/occupation/by-zone")
    public ResponseEntity<List<OverdueControlService.ParkingZoneStats>> getOccupationByZone() {
        List<OverdueControlService.ParkingZoneStats> stats = overdueControlService.getOccupationByZone();
        return ResponseEntity.ok(stats);
    }

    /**
     * GET /api/agent/parking/{parkingName}/vehicles
     * Récupère tous les véhicules actifs dans un parking spécifique
     */
    @GetMapping("/parking/{parkingName}/vehicles")
    public ResponseEntity<List<ReservationEntity>> getVehiclesByParking(
            @PathVariable String parkingName) {
        List<ReservationEntity> vehicles = overdueControlService.findVehiclesByParking(parkingName);
        return ResponseEntity.ok(vehicles);
    }

    /**
     * PUT /api/agent/overdue/{reservationId}/signal
     * Signale une réservation comme infraction
     */
    @PutMapping("/{reservationId}/signal")
    public ResponseEntity<?> signalInfraction(@PathVariable String reservationId) {
        ReservationEntity updated = overdueControlService.signalInfraction(reservationId);
        
        if (updated == null) {
            return ResponseEntity.status(404)
                    .body(new MarkResponse(false, "Réservation non trouvée"));
        }
        
        return ResponseEntity.ok(new MarkResponse(true, "Infraction signalée"));
    }

    /**
     * PUT /api/agent/overdue/{reservationId}/regularize
     * Régularise une réservation en excès
     */
    @PutMapping("/{reservationId}/regularize")
    public ResponseEntity<?> regularizeInfraction(@PathVariable String reservationId) {
        ReservationEntity updated = overdueControlService.regularizeInfraction(reservationId);
        
        if (updated == null) {
            return ResponseEntity.status(404)
                    .body(new MarkResponse(false, "Réservation non trouvée"));
        }
        
        return ResponseEntity.ok(updated);
    }

    /**
     * GET /api/agent/overdue/history
     * Récupère l'historique des véhicules régularisés
     */
    @GetMapping("/history")
    public ResponseEntity<List<ReservationEntity>> getRegularizedHistory() {
        List<ReservationEntity> history = overdueControlService.getRegularizedHistory();
        return ResponseEntity.ok(history);
    }

    /**
     * Classe pour la réponse de mise à jour en masse
     */
    public static class UpdateAllResponse {
        private final int updatedReservationsCount;

        public UpdateAllResponse(int updatedReservationsCount) {
            this.updatedReservationsCount = updatedReservationsCount;
        }

        public int getUpdatedReservationsCount() {
            return updatedReservationsCount;
        }
    }

    /**
     * Classe pour la réponse de marquage d'une réservation
     */
    public static class MarkResponse {
        private final boolean success;
        private final String message;

        public MarkResponse(boolean success, String message) {
            this.success = success;
            this.message = message;
        }

        public boolean isSuccess() {
            return success;
        }

        public String getMessage() {
            return message;
        }
    }
}