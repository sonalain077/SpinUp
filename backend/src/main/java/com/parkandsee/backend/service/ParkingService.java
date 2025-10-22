package com.parkandsee.backend.service;

import com.parkandsee.backend.dto.PaymentRequest;
import com.parkandsee.backend.dto.PaymentResponse;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

import com.parkandsee.backend.entity.ReservationEntity;
import com.parkandsee.backend.repository.ReservationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ParkingService {

    private final ReservationRepository reservationRepository;

    public ParkingService(ReservationRepository reservationRepository) {
        this.reservationRepository = reservationRepository;
    }

    @Transactional
    public PaymentResponse reserveAndPay(PaymentRequest request) {
        // Basic validation already handled by @Valid in controller
        // Simulate payment processing
        boolean paid = simulatePayment(request.getPaymentToken());
        if (!paid) {
            return new PaymentResponse(false, "Payment failed (simulated)", null);
        }

        String id = UUID.randomUUID().toString();
        ReservationEntity e = new ReservationEntity();
        e.setId(id);
        e.setLicencePlate(request.getLicencePlate());
        e.setVehicleType(request.getVehicleType());
        e.setStartAt(request.getStartAt());
        e.setDurationMinutes(request.getDurationMinutes());
        e.setAddress(request.getAddress());
        e.setCreatedAt(LocalDateTime.now());

        reservationRepository.save(e);

        return new PaymentResponse(true, "Reservation confirmed", id);
    }

    private boolean simulatePayment(String token) {
        // In real life we'd call a payment gateway. Here, accept any token or null as success for demo.
        return true;
    }
}
