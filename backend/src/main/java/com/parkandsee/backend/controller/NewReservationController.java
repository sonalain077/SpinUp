package com.parkandsee.backend.controller;

import com.parkandsee.backend.dto.CreateReservationRequest;
import com.parkandsee.backend.dto.CreateReservationResponse;
import com.parkandsee.backend.service.ReservationService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Controller REST pour la création de réservations (nouvelle API).
 * Endpoint principal: POST /api/reservations
 */
@RestController
@RequestMapping("/api/reservations")
@CrossOrigin(origins = "*")
public class NewReservationController {

    private final ReservationService reservationService;

    public NewReservationController(ReservationService reservationService) {
        this.reservationService = reservationService;
    }

    /**
     * Crée une nouvelle réservation de parking.
     * 
     * POST /api/reservations
     * 
     * Request body:
     * {
     *   "plate": "ZZ-331-AE",
     *   "vehicleType": "MOTO",
     *   "parkingId": "<UUID>",
     *   "startAt": "2025-11-06T20:30:00Z",
     *   "durationMinutes": 390,
     *   "payment": { "method": "CARD", "amountCents": 1950 }
     * }
     * 
     * @param request Données de la réservation
     * @return Réponse avec les détails de la réservation créée
     */
    @PostMapping
    public ResponseEntity<CreateReservationResponse> createReservation(
            @Valid @RequestBody CreateReservationRequest request) {
        
        try {
            CreateReservationResponse response = reservationService.createReservation(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            // Les erreurs de validation sont gérées par le GlobalExceptionHandler
            throw e;
        }
    }
}
