package com.parkandsee.backend.service;

import com.parkandsee.backend.dto.PaymentRequest;
import com.parkandsee.backend.dto.PaymentResponse;
import com.parkandsee.backend.dto.ExtensionRequest;
import com.parkandsee.backend.dto.ExitResponse;
import com.parkandsee.backend.dto.OverduePaymentRequest;
import com.parkandsee.backend.dto.OverduePaymentResponse;
import com.parkandsee.backend.dto.ParkingDTO;
import com.parkandsee.backend.entity.ReservationEntity;
import com.parkandsee.backend.entity.VehicleType;
import com.parkandsee.backend.entity.ReservationStatus;
import com.parkandsee.backend.entity.ParkingEntity;
import com.parkandsee.backend.repository.ReservationRepository;
import com.parkandsee.backend.repository.ParkingRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;
import java.util.Optional;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ParkingService {

    private final ReservationRepository reservationRepository;
    private final ParkingRepository parkingRepository;

    public ParkingService(ReservationRepository reservationRepository, 
                         ParkingRepository parkingRepository) {
        this.reservationRepository = reservationRepository;
        this.parkingRepository = parkingRepository;
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
     * Régulariser une infraction (paiement du dépassement et mise à jour du statut)
     */
    @Transactional
    public OverduePaymentResponse payOverdue(OverduePaymentRequest request) {
        Optional<ReservationEntity> reservationOpt = reservationRepository.findById(request.getReservationId());
        if (reservationOpt.isEmpty()) {
            return OverduePaymentResponse.failure("Réservation non trouvée");
        }

        ReservationEntity reservation = reservationOpt.get();

        // Calculer les montants de dépassement avant modification
        long overdueMinutes = reservation.getOverdueMinutes();
        double overdueAmount = reservation.getOverdueAmount();

        if (overdueMinutes <= 0 || overdueAmount <= 0.0) {
            // Rien à payer
            return OverduePaymentResponse.failure("Aucune infraction à régulariser");
        }

        // Simuler le paiement (toujours OK en démo)
        if (!simulatePayment(request.getPaymentToken())) {
            return OverduePaymentResponse.failure("Échec du paiement");
        }

        // Mettre à jour la réservation: ajouter le montant payé et marquer comme régularisée
        Double currentPaid = reservation.getPaymentAmount() == null ? 0.0 : reservation.getPaymentAmount();
        reservation.setPaymentAmount(currentPaid + overdueAmount);
        reservation.setStatus(com.parkandsee.backend.entity.ReservationStatus.REGULARISE);
        reservationRepository.save(reservation);

        return OverduePaymentResponse.success(reservation.getId(), overdueAmount, overdueMinutes);
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

    /**
     * Vérifier si un véhicule peut quitter le parking
     * @param reservationId ID de la réservation
     * @return ExitResponse avec autorisation ou refus de sortie
     */
    public ExitResponse checkExit(String reservationId) {
        Optional<ReservationEntity> reservationOpt = reservationRepository.findById(reservationId);
        
        if (reservationOpt.isEmpty()) {
            return new ExitResponse(false, "Réservation non trouvée", false, 0L, 0.0, null);
        }

        ReservationEntity reservation = reservationOpt.get();
        
        // Vérifier si la réservation est en dépassement (sauf si déjà régularisée)
        if (reservation.isOverdue() && reservation.getStatus() != ReservationStatus.REGULARISE) {
            long overdueMinutes = reservation.getOverdueMinutes();
            double overdueAmount = reservation.getOverdueAmount();
            
            return ExitResponse.denied(
                String.format("Sortie refusée : Vous avez dépassé votre durée de stationnement de %d minutes. " +
                             "Veuillez régulariser votre situation (%.2f€) avant de quitter le parking.", 
                             overdueMinutes, overdueAmount),
                overdueMinutes,
                overdueAmount,
                reservationId
            );
        }
        
        // Autoriser la sortie
        return ExitResponse.allowed(
            "Sortie autorisée. Merci d'avoir utilisé Park & See !",
            reservationId
        );
    }

    /**
     * Confirmer la sortie du parking et supprimer la réservation
     * @param reservationId ID de la réservation
     * @return ExitResponse confirmant la suppression
     */
    @Transactional
    public ExitResponse confirmExit(String reservationId) {
        Optional<ReservationEntity> reservationOpt = reservationRepository.findById(reservationId);
        
        if (reservationOpt.isEmpty()) {
            return new ExitResponse(false, "Réservation non trouvée", false, 0L, 0.0, null);
        }

        ReservationEntity reservation = reservationOpt.get();
        
        // Vérifier à nouveau le dépassement (sécurité), sauf si déjà régularisée
        if (reservation.isOverdue() && reservation.getStatus() != ReservationStatus.REGULARISE) {
            long overdueMinutes = reservation.getOverdueMinutes();
            double overdueAmount = reservation.getOverdueAmount();
            
            return ExitResponse.denied(
                "Sortie refusée : Vous devez régulariser votre infraction avant de quitter.",
                overdueMinutes,
                overdueAmount,
                reservationId
            );
        }
        String msg;
        switch (reservation.getStatus()) {
            case REGULARISE -> msg = "Véhicule régularisé et sorti avec succès. Bonne route !";
            case COMPLETED -> msg = "Véhicule déjà terminé puis sorti. Bonne route !";
            default -> msg = "Véhicule sorti avec succès. Bonne route !";
        }

        reservationRepository.delete(reservation);
        return ExitResponse.allowed(msg, reservationId);
    }

    /**
     * Récupérer tous les parkings disponibles
     * Utilisé pour afficher la liste des parkings dans le frontend
     */
    public List<ParkingDTO> getAllParkings() {
        List<ParkingEntity> parkings = parkingRepository.findAll();
        return parkings.stream()
            .map(p -> new ParkingDTO(p.getId(), p.getName(), p.getAddress(), p.getTotalSpots()))
            .collect(Collectors.toList());
    }
}


