package com.parkandsee.backend.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.parkandsee.backend.entity.ReservationEntity;
import com.parkandsee.backend.repository.ReservationRepository;

@RestController
@RequestMapping("/api/parking")
public class ReservationController {

    private final ReservationRepository reservationRepository;

    public ReservationController(ReservationRepository reservationRepository) {
        this.reservationRepository = reservationRepository;
    }

    // List all reservations (for debug / verification). In prod, add paging/auth.
    @GetMapping("/reservations")
    public ResponseEntity<List<ReservationEntity>> list() {
        List<ReservationEntity> all = reservationRepository.findAll();
        return ResponseEntity.ok(all);
    }

    // Get a specific reservation by ID
    @GetMapping("/reservations/{id}")
    public ResponseEntity<ReservationEntity> getReservationById(@PathVariable String id) {
        System.out.println("=== RECHERCHE RÉSERVATION ===");
        System.out.println("ID recherché: " + id);
        
        Optional<ReservationEntity> reservation = reservationRepository.findById(id);
        
        if (reservation.isPresent()) {
            System.out.println("✅ Réservation trouvée: " + reservation.get().getId());
            return ResponseEntity.ok(reservation.get());
        } else {
            System.out.println("❌ Réservation non trouvée pour l'ID: " + id);
            return ResponseEntity.notFound().build();
        }
    }

    // Delete a reservation (for justified/regularized excess)
    @DeleteMapping("/reservations/{id}")
    public ResponseEntity<Void> deleteReservation(@PathVariable String id) {
        if (reservationRepository.existsById(id)) {
            reservationRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}
