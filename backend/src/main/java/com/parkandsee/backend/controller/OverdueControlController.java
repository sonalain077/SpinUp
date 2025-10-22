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
    public ResponseEntity<ReservationEntity> markReservationAsOverdue(
            @PathVariable String reservationId) {
        try {
            ReservationEntity updatedReservation = 
                    overdueControlService.markAsOverdue(reservationId);
            return ResponseEntity.ok(updatedReservation);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
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
}