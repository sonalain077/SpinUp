package com.parkandsee.backend.service;

import com.parkandsee.backend.dto.PaymentRequest;
import com.parkandsee.backend.dto.PaymentResponse;
import com.parkandsee.backend.entity.ReservationEntity;
import com.parkandsee.backend.entity.VehicleType;
import com.parkandsee.backend.entity.ReservationStatus;
import com.parkandsee.backend.repository.ReservationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

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
        e.setVehicleType(VehicleType.valueOf(request.getVehicleType().toUpperCase()));
        e.setStartAt(request.getStartAt());
        e.setDurationMinutes(request.getDurationMinutes());
        e.setAddress(request.getAddress());
        e.setPaymentAmount(request.getPaymentAmount());
        e.setStatus(ReservationStatus.ACTIVE);
        e.setCreatedAt(LocalDateTime.now());

        ReservationEntity saved = reservationRepository.save(e);

        return new PaymentResponse(true, "Reservation confirmed", saved.getId(), 
                                 saved.getPaymentAmount(), saved.getHourlyRate());
    }

    private boolean simulatePayment(String token) {
        // In real life we'd call a payment gateway. Here, accept any token or null as success for demo.
        return true;
    }
}
