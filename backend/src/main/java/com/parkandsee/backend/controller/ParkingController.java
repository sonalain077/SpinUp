package com.parkandsee.backend.controller;

import java.util.Optional;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.parkandsee.backend.dto.ExitResponse;
import com.parkandsee.backend.dto.ExtensionRequest;
import com.parkandsee.backend.dto.PaymentRequest;
import com.parkandsee.backend.dto.PaymentResponse;
import com.parkandsee.backend.entity.ReservationEntity;
import com.parkandsee.backend.service.ParkingService;

import jakarta.validation.Valid;


@RestController
@RequestMapping("/api/parking")
public class ParkingController {

    private final ParkingService parkingService;

    public ParkingController(ParkingService parkingService) {
        this.parkingService = parkingService;
    }

    @PostMapping("/reserve")
    public ResponseEntity<PaymentResponse> reserveAndPay(@Valid @RequestBody PaymentRequest request) {
        System.out.println("=== REQUÊTE REÇUE ===");
        System.out.println("Plaque: " + request.getLicencePlate());
        System.out.println("Type véhicule: " + request.getVehicleType());
        System.out.println("Début: " + request.getStartAt());
        System.out.println("Durée: " + request.getDurationMinutes());
        System.out.println("Adresse: " + request.getAddress());
        System.out.println("Token: " + request.getPaymentToken());
        System.out.println("===================");
        
        PaymentResponse response = parkingService.reserveAndPay(request);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/ping")
    public ResponseEntity<String> ping() {
        return ResponseEntity.ok("Backend is running!");
    }
    
    @GetMapping("/test-simple")
    public ResponseEntity<String> testSimple() {
        return ResponseEntity.ok("Test simple fonctionne!");
    }
    
    @GetMapping(value = "/status", produces = "application/json")
    public ResponseEntity<String> status() {
        return ResponseEntity.ok("{\"status\": \"OK\", \"service\": \"Park & See Backend\"}");
    }
    
    /**
     * Rechercher une réservation active par plaque d'immatriculation ou ID de réservation
     */
    @GetMapping("/search")
    public ResponseEntity<ReservationEntity> searchReservation(
            @RequestParam(value = "licencePlate", required = false) String licencePlate,
            @RequestParam(value = "reservationId", required = false) String reservationId) {
        
        // Vérifier qu'au moins un paramètre est fourni
        if ((licencePlate == null || licencePlate.trim().isEmpty()) && 
            (reservationId == null || reservationId.trim().isEmpty())) {
            return ResponseEntity.badRequest().build();
        }
        
        Optional<ReservationEntity> reservation;
        
        // Recherche par ID de réservation en priorité
        if (reservationId != null && !reservationId.trim().isEmpty()) {
            reservation = parkingService.findActiveReservationById(reservationId.trim());
        } else {
            reservation = parkingService.findActiveReservationByLicencePlate(licencePlate.trim());
        }
        
        if (reservation.isPresent()) {
            return ResponseEntity.ok(reservation.get());
        } else {
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * Étendre une réservation existante avec paiement
     */
    @PostMapping("/extend")
    public ResponseEntity<PaymentResponse> extendReservation(@Valid @RequestBody ExtensionRequest request) {
        PaymentResponse response = parkingService.extendReservation(request);
        return ResponseEntity.ok(response);
    }
    
    /**
     * Vérifier si un véhicule peut sortir du parking
     */
    @GetMapping("/check-exit")
    public ResponseEntity<ExitResponse> checkExit(@RequestParam("reservationId") String reservationId) {
        if (reservationId == null || reservationId.trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        
        ExitResponse response = parkingService.checkExit(reservationId.trim());
        return ResponseEntity.ok(response);
    }
    
    /**
     * Confirmer la sortie du parking (supprime la réservation)
     */
    @PostMapping("/confirm-exit")
    public ResponseEntity<ExitResponse> confirmExit(@RequestParam("reservationId") String reservationId) {
        if (reservationId == null || reservationId.trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        
        ExitResponse response = parkingService.confirmExit(reservationId.trim());
        return ResponseEntity.ok(response);
    }

}
