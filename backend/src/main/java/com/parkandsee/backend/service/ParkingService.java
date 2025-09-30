package com.parkandsee.backend.service;

import com.parkandsee.backend.dto.PaymentRequest;
import com.parkandsee.backend.dto.PaymentResponse;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class ParkingService {

    private final Map<String, Reservation> store = new ConcurrentHashMap<>();

    public PaymentResponse reserveAndPay(PaymentRequest request) {
        // Basic validation already handled by @Valid in controller
        // Simulate payment processing
        boolean paid = simulatePayment(request.getPaymentToken());
        if (!paid) {
            return new PaymentResponse(false, "Payment failed (simulated)", null);
        }

        String id = UUID.randomUUID().toString();
        Reservation r = new Reservation();
        r.id = id;
        r.licencePlate = request.getLicencePlate();
        r.startAt = request.getStartAt();
        r.durationMinutes = request.getDurationMinutes();
        r.address = request.getAddress();
        r.createdAt = LocalDateTime.now();

        store.put(id, r);

        return new PaymentResponse(true, "Reservation confirmed", id);
    }

    private boolean simulatePayment(String token) {
        // In real life we'd call a payment gateway. Here, accept any token or null as success for demo.
        return true;
    }

    // simple inner class to store reservations in memory
    static class Reservation {
        String id;
        String licencePlate;
        LocalDateTime startAt;
        Integer durationMinutes;
        String address;
        LocalDateTime createdAt;
    }
}
