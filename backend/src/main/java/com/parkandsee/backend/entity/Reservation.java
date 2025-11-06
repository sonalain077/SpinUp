package com.parkandsee.backend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import org.hibernate.annotations.CreationTimestamp;
import java.time.Duration;
import java.time.Instant;
import java.util.UUID;

/**
 * Entité représentant une réservation de parking dans le système Park & See.
 * Une réservation lie un véhicule à un parking pour une période donnée.
 * Toutes les dates/heures sont stockées en UTC (Instant).
 */
@Entity
@Table(name = "reservations", indexes = {
    @Index(name = "idx_reservation_parking_status", columnList = "parking_id,status"),
    @Index(name = "idx_reservation_end_at", columnList = "endAt"),
    @Index(name = "idx_reservation_status", columnList = "status")
})
public class Reservation {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @NotNull(message = "Le véhicule est obligatoire")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "vehicle_id", nullable = false)
    private Vehicle vehicle;

    @NotNull(message = "Le parking est obligatoire")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "parking_id", nullable = false)
    private Parking parking;

    @NotNull(message = "L'heure de début est obligatoire")
    @Column(nullable = false)
    private Instant startAt;

    @NotNull(message = "L'heure de fin est obligatoire")
    @Column(nullable = false)
    private Instant endAt;

    @NotNull(message = "La durée en minutes est obligatoire")
    @Positive(message = "La durée doit être positive")
    @Column(nullable = false)
    private Integer durationMinutes;

    @NotNull(message = "Le montant est obligatoire")
    @PositiveOrZero(message = "Le montant doit être positif ou nul")
    @Column(nullable = false)
    private Integer priceCents;

    @NotNull(message = "La méthode de paiement est obligatoire")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private PaymentMethod paymentMethod;

    @NotNull(message = "Le statut est obligatoire")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ReservationStatus status = ReservationStatus.ACTIVE;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    // Constructors
    public Reservation() {}

    public Reservation(Vehicle vehicle, Parking parking, Instant startAt, Integer durationMinutes,
                      Integer priceCents, PaymentMethod paymentMethod) {
        this.vehicle = vehicle;
        this.parking = parking;
        this.startAt = startAt;
        this.durationMinutes = durationMinutes;
        this.endAt = startAt.plus(Duration.ofMinutes(durationMinutes));
        this.priceCents = priceCents;
        this.paymentMethod = paymentMethod;
        this.status = ReservationStatus.ACTIVE;
    }

    // Business logic methods

    /**
     * Vérifie si la réservation est actuellement active (véhicule garé).
     * Une réservation est active si son statut est ACTIVE et que l'heure actuelle < endAt.
     */
    public boolean isCurrentlyParked() {
        return status == ReservationStatus.ACTIVE && Instant.now().isBefore(endAt);
    }

    /**
     * Vérifie si la réservation est en infraction (dépassement de durée).
     * Une réservation est en infraction si son statut est ACTIVE et que l'heure actuelle > endAt.
     */
    public boolean isInfringement() {
        return status == ReservationStatus.ACTIVE && Instant.now().isAfter(endAt);
    }

    /**
     * Calcule le nombre de minutes de dépassement.
     * @return minutes de dépassement, 0 si pas de dépassement
     */
    public long getExceededMinutes() {
        if (!isInfringement()) {
            return 0;
        }
        return Duration.between(endAt, Instant.now()).toMinutes();
    }

    /**
     * Calcule le nombre de minutes restantes avant la fin de la réservation.
     * @return minutes restantes, 0 si déjà expiré
     */
    public long getRemainingMinutes() {
        Instant now = Instant.now();
        if (now.isAfter(endAt)) {
            return 0;
        }
        return Duration.between(now, endAt).toMinutes();
    }

    /**
     * Détermine la sévérité de l'infraction.
     * @return "LEGER" si < 30 min, "GRAVE" si >= 30 min
     */
    public String getSeverity() {
        long exceeded = getExceededMinutes();
        return exceeded < 30 ? "LEGER" : "GRAVE";
    }

    // Getters and Setters
    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public Vehicle getVehicle() {
        return vehicle;
    }

    public void setVehicle(Vehicle vehicle) {
        this.vehicle = vehicle;
    }

    public Parking getParking() {
        return parking;
    }

    public void setParking(Parking parking) {
        this.parking = parking;
    }

    public Instant getStartAt() {
        return startAt;
    }

    public void setStartAt(Instant startAt) {
        this.startAt = startAt;
    }

    public Instant getEndAt() {
        return endAt;
    }

    public void setEndAt(Instant endAt) {
        this.endAt = endAt;
    }

    public Integer getDurationMinutes() {
        return durationMinutes;
    }

    public void setDurationMinutes(Integer durationMinutes) {
        this.durationMinutes = durationMinutes;
    }

    public Integer getPriceCents() {
        return priceCents;
    }

    public void setPriceCents(Integer priceCents) {
        this.priceCents = priceCents;
    }

    public PaymentMethod getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(PaymentMethod paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public ReservationStatus getStatus() {
        return status;
    }

    public void setStatus(ReservationStatus status) {
        this.status = status;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    @Override
    public String toString() {
        return "Reservation{" +
                "id=" + id +
                ", vehicle=" + (vehicle != null ? vehicle.getPlate() : null) +
                ", parking=" + (parking != null ? parking.getName() : null) +
                ", startAt=" + startAt +
                ", endAt=" + endAt +
                ", status=" + status +
                '}';
    }
}
