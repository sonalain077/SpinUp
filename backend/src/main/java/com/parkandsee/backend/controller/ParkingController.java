package com.parkandsee.backend.controller;

import com.parkandsee.backend.dto.PaymentRequest;
import com.parkandsee.backend.dto.PaymentResponse;
import com.parkandsee.backend.service.ParkingService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/parking")
public class ParkingController {

    private final ParkingService parkingService;

    public ParkingController(ParkingService parkingService) {
        this.parkingService = parkingService;
    }

    @PostMapping("/reserve")
    public ResponseEntity<PaymentResponse> reserveAndPay(@Valid @RequestBody PaymentRequest request) {
        PaymentResponse response = parkingService.reserveAndPay(request);
        return ResponseEntity.ok(response);
    }
}
