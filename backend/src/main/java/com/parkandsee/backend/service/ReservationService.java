package com.parkandsee.backend.service;

import com.parkandsee.backend.dto.CreateReservationRequest;
import com.parkandsee.backend.dto.CreateReservationResponse;
import com.parkandsee.backend.entity.*;
import com.parkandsee.backend.repository.ParkingRepository;
import com.parkandsee.backend.repository.NewReservationRepository;
import com.parkandsee.backend.repository.VehicleRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;
import java.time.Duration;
import java.time.Instant;

/**
 * Service métier pour la création et la gestion des réservations.
 */
@Service
@Transactional
public class ReservationService {

    private final VehicleRepository vehicleRepository;
    private final ParkingRepository parkingRepository;
    private final NewReservationRepository reservationRepository;

    public ReservationService(VehicleRepository vehicleRepository,
                             ParkingRepository parkingRepository,
                             NewReservationRepository reservationRepository) {
        this.vehicleRepository = vehicleRepository;
        this.parkingRepository = parkingRepository;
        this.reservationRepository = reservationRepository;
    }

    /**
     * Crée une nouvelle réservation (transactionnel).
     * Effectue un upsert du véhicule (normalisation de la plaque).
     * Valide que le parking existe et que les paramètres sont cohérents.
     * 
     * @param request Requête de création de réservation
     * @return Réponse contenant les détails de la réservation créée
     * @throws IllegalArgumentException si les paramètres sont invalides
     */
    public CreateReservationResponse createReservation(CreateReservationRequest request) {
        // 1. Normaliser et valider la plaque
        String normalizedPlate = Vehicle.normalizePlate(request.getPlate());
        if (normalizedPlate == null || normalizedPlate.isBlank()) {
            throw new IllegalArgumentException("La plaque d'immatriculation est invalide");
        }

        // 2. Parser et valider le type de véhicule
        VehicleType vehicleType;
        try {
            vehicleType = VehicleType.valueOf(request.getVehicleType().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Type de véhicule invalide: " + request.getVehicleType() +
                    ". Types valides: CAR, MOTORCYCLE, VAN, TRUCK, BICYCLE, ELECTRIC_SCOOTER");
        }

        // 3. Upsert du véhicule (find or create)
        Vehicle vehicle = vehicleRepository.findByPlate(normalizedPlate)
                .orElseGet(() -> {
                    Vehicle newVehicle = new Vehicle(normalizedPlate, vehicleType);
                    return vehicleRepository.save(newVehicle);
                });

        // Si le véhicule existe mais avec un type différent, on met à jour
        if (vehicle.getType() != vehicleType) {
            vehicle.setType(vehicleType);
            vehicle = vehicleRepository.save(vehicle);
        }

        // 4. Vérifier que le parking existe
        Parking parking = parkingRepository.findById(request.getParkingId())
                .orElseThrow(() -> new IllegalArgumentException(
                        "Parking introuvable avec l'ID: " + request.getParkingId()));

        // 5. Valider les paramètres temporels
        if (request.getDurationMinutes() <= 0) {
            throw new IllegalArgumentException("La durée doit être positive");
        }

        if (request.getStartAt() == null) {
            throw new IllegalArgumentException("L'heure de début est obligatoire");
        }

        // 6. Valider le paiement
        if (request.getPayment() == null) {
            throw new IllegalArgumentException("Les informations de paiement sont obligatoires");
        }

        if (request.getPayment().getAmountCents() < 0) {
            throw new IllegalArgumentException("Le montant ne peut pas être négatif");
        }

        if (request.getPayment().getMethod() == null) {
            throw new IllegalArgumentException("La méthode de paiement est obligatoire");
        }

        // 7. Créer la réservation
        Reservation reservation = new Reservation(
                vehicle,
                parking,
                request.getStartAt(),
                request.getDurationMinutes(),
                request.getPayment().getAmountCents(),
                request.getPayment().getMethod()
        );

        reservation = reservationRepository.save(reservation);

        // 8. Construire et retourner la réponse
        return new CreateReservationResponse(
                reservation.getId(),
                vehicle.getPlate(),
                vehicle.getType().name(),
                parking.getName(),
                reservation.getStartAt(),
                reservation.getEndAt(),
                reservation.getDurationMinutes(),
                reservation.getPriceCents(),
                reservation.getPaymentMethod(),
                reservation.getStatus(),
                reservation.getCreatedAt()
        );
    }
}
