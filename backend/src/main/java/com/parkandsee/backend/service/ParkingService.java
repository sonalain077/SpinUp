package com.parkandsee.backend.service;

import com.parkandsee.backend.dto.PaymentRequest;
import com.parkandsee.backend.dto.PaymentResponse;
import com.parkandsee.backend.dto.ExtensionRequest;
import com.parkandsee.backend.entity.ReservationEntity;
import com.parkandsee.backend.entity.VehicleType;
import com.parkandsee.backend.entity.ReservationStatus;
import com.parkandsee.backend.repository.ReservationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;
import java.util.Optional;
import java.util.List;

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

    /**
     * Recherche une réservation active par plaque d'immatriculation
     */
    public Optional<ReservationEntity> findActiveReservationByLicencePlate(String licencePlate) {
        List<ReservationEntity> reservations = reservationRepository
            .findByLicencePlateAndStatus(licencePlate, ReservationStatus.ACTIVE);
        
        // Retourner la première réservation active trouvée
        return reservations.stream()
            .filter(r -> r.getEndAt().isAfter(LocalDateTime.now()))
            .findFirst();
    }

    /**
     * Recherche une réservation active par ID
     */
    public Optional<ReservationEntity> findActiveReservationById(String reservationId) {
        Optional<ReservationEntity> reservation = reservationRepository.findById(reservationId);
        
        if (reservation.isPresent()) {
            ReservationEntity r = reservation.get();
            // Vérifier que la réservation est active et pas expirée
            if (r.getStatus() == ReservationStatus.ACTIVE && 
                r.getEndAt().isAfter(LocalDateTime.now())) {
                return reservation;
            }
        }
        
        return Optional.empty();
    }

    /**
     * Étendre une réservation existante
     */
    @Transactional
    public PaymentResponse extendReservation(ExtensionRequest request) {
        // Rechercher la réservation
        Optional<ReservationEntity> reservationOpt = findActiveReservationById(request.getReservationId());
        
        if (reservationOpt.isEmpty()) {
            return new PaymentResponse(false, "Réservation non trouvée ou expirée", null);
        }

        ReservationEntity reservation = reservationOpt.get();
        
        // Vérification optionnelle de la plaque d'immatriculation
        if (request.getLicencePlate() != null && 
            !request.getLicencePlate().equals(reservation.getLicencePlate())) {
            return new PaymentResponse(false, "Plaque d'immatriculation incorrecte", null);
        }

        // Simuler le paiement
        boolean paid = simulatePayment(request.getPaymentToken());
        if (!paid) {
            return new PaymentResponse(false, "Échec du paiement", null);
        }

        // Calculer le coût de l'extension
        double extensionCost = calculateExtensionCost(request.getExtensionMinutes());
        
        // Mettre à jour la réservation
        reservation.setDurationMinutes(reservation.getDurationMinutes() + request.getExtensionMinutes());
        reservation.setPaymentAmount(reservation.getPaymentAmount() + extensionCost);
        
        ReservationEntity saved = reservationRepository.save(reservation);
        
        return new PaymentResponse(true, 
            String.format("Stationnement rallongé de %d minutes", request.getExtensionMinutes()),
            saved.getId(), extensionCost, saved.getHourlyRate());
    }

    /**
     * Calculer le coût d'une extension (1.50€ par tranche de 30 minutes)
     */
    private double calculateExtensionCost(int extensionMinutes) {
        final double pricePerHalfHour = 1.50;
        int halfHours = (int) Math.ceil(extensionMinutes / 30.0);
        return halfHours * pricePerHalfHour;
    }
}
