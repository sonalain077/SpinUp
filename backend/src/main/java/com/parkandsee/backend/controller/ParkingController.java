package com.parkandsee.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.parkandsee.backend.dto.PaymentRequest;
import com.parkandsee.backend.dto.PaymentResponse;
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
    
    @GetMapping(value = "/status", produces = "application/json")
    public ResponseEntity<String> status() {
        return ResponseEntity.ok("{\"status\": \"OK\", \"service\": \"Park & See Backend\"}");
    }
}
