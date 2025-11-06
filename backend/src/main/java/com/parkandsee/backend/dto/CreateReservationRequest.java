package com.parkandsee.backend.dto;

import com.parkandsee.backend.entity.PaymentMethod;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.time.Instant;
import java.util.UUID;

/**
 * DTO pour la création d'une réservation via POST /api/reservations.
 * Toutes les dates sont en UTC (ISO-8601).
 */
public class CreateReservationRequest {

    @NotBlank(message = "La plaque d'immatriculation est obligatoire")
    @Pattern(regexp = "^[A-Z]{2}-?[0-9]{3}-?[A-Z]{2}$", 
             message = "Format de plaque invalide (attendu: XX-123-XX ou XX123XX)")
    private String plate;

    @NotBlank(message = "Le type de véhicule est obligatoire")
    private String vehicleType;

    @NotNull(message = "L'ID du parking est obligatoire")
    private UUID parkingId;

    @NotNull(message = "L'heure de début est obligatoire")
    private Instant startAt;

    @NotNull(message = "La durée est obligatoire")
    @Positive(message = "La durée doit être positive")
    private Integer durationMinutes;

    @Valid
    @NotNull(message = "Les informations de paiement sont obligatoires")
    private PaymentInfo payment;

    // Nested class for payment information
    public static class PaymentInfo {
        @NotNull(message = "La méthode de paiement est obligatoire")
        private PaymentMethod method;

        @NotNull(message = "Le montant est obligatoire")
        @PositiveOrZero(message = "Le montant doit être positif ou nul")
        private Integer amountCents;

        public PaymentInfo() {}

        public PaymentInfo(PaymentMethod method, Integer amountCents) {
            this.method = method;
            this.amountCents = amountCents;
        }

        public PaymentMethod getMethod() {
            return method;
        }

        public void setMethod(PaymentMethod method) {
            this.method = method;
        }

        public Integer getAmountCents() {
            return amountCents;
        }

        public void setAmountCents(Integer amountCents) {
            this.amountCents = amountCents;
        }
    }

    // Constructors
    public CreateReservationRequest() {}

    public CreateReservationRequest(String plate, String vehicleType, UUID parkingId,
                                   Instant startAt, Integer durationMinutes, PaymentInfo payment) {
        this.plate = plate;
        this.vehicleType = vehicleType;
        this.parkingId = parkingId;
        this.startAt = startAt;
        this.durationMinutes = durationMinutes;
        this.payment = payment;
    }

    // Getters and Setters
    public String getPlate() {
        return plate;
    }

    public void setPlate(String plate) {
        this.plate = plate;
    }

    public String getVehicleType() {
        return vehicleType;
    }

    public void setVehicleType(String vehicleType) {
        this.vehicleType = vehicleType;
    }

    public UUID getParkingId() {
        return parkingId;
    }

    public void setParkingId(UUID parkingId) {
        this.parkingId = parkingId;
    }

    public Instant getStartAt() {
        return startAt;
    }

    public void setStartAt(Instant startAt) {
        this.startAt = startAt;
    }

    public Integer getDurationMinutes() {
        return durationMinutes;
    }

    public void setDurationMinutes(Integer durationMinutes) {
        this.durationMinutes = durationMinutes;
    }

    public PaymentInfo getPayment() {
        return payment;
    }

    public void setPayment(PaymentInfo payment) {
        this.payment = payment;
    }
}
