package com.parkandsee.backend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;
import java.time.Duration;

@Entity
@Table(name = "reservations", indexes = {
    @Index(name = "idx_licence_plate", columnList = "licencePlate"),
    @Index(name = "idx_start_at", columnList = "startAt"),
    @Index(name = "idx_status", columnList = "status")
})
public class ReservationEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(length = 36)
    private String id;

    @NotNull(message = "La plaque d'immatriculation est obligatoire")
    @Pattern(regexp = "^[A-Z]{2}-[0-9]{3}-[A-Z]{2}$", message = "Format de plaque invalide (XX-123-XX)")
    @Column(nullable = false)
    private String licencePlate;

    @NotNull(message = "Le type de véhicule est obligatoire")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private VehicleType vehicleType;

    @NotNull(message = "L'heure de début est obligatoire")
    @Column(nullable = false)
    private LocalDateTime startAt;

    @NotNull(message = "La durée en minutes est obligatoire")
    @Positive(message = "La durée doit être positive")
    @Column(nullable = false)
    private Integer durationMinutes;

    @NotNull(message = "L'adresse est obligatoire")
    @Column(nullable = false)
    private String address;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ReservationStatus status = ReservationStatus.ACTIVE;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;

    public ReservationEntity() {}

    public ReservationEntity(String licencePlate, VehicleType vehicleType, 
                           LocalDateTime startAt, Integer durationMinutes, String address) {
        this.licencePlate = licencePlate;
        this.vehicleType = vehicleType;
        this.startAt = startAt;
        this.durationMinutes = durationMinutes;
        this.address = address;
    }

    /**
     * Calcule l'heure de fin de la réservation
     * @return LocalDateTime de fin de réservation
     */
    public LocalDateTime getEndAt() {
        return startAt != null && durationMinutes != null 
            ? startAt.plusMinutes(durationMinutes) 
            : null;
    }

    /**
     * Vérifie si la réservation est en excès de temps
     * @return true si la réservation a dépassé sa durée autorisée
     */
    public boolean isOverdue() {
        LocalDateTime endAt = getEndAt();
        return endAt != null && LocalDateTime.now().isAfter(endAt);
    }

    /**
     * Calcule le nombre de minutes de dépassement
     * @return minutes de dépassement, 0 si pas de dépassement
     */
    public long getOverdueMinutes() {
        if (!isOverdue()) {
            return 0;
        }
        LocalDateTime endAt = getEndAt();
        return Duration.between(endAt, LocalDateTime.now()).toMinutes();
    }

    /**
     * Vérifie si la réservation est active maintenant
     * @return true si la réservation est en cours
     */
    public boolean isActiveNow() {
        // Une réservation n'est active que si son statut est ACTIVE
        if (status != ReservationStatus.ACTIVE) {
            return false;
        }
        
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime endAt = getEndAt();
        return startAt != null && endAt != null && 
               !now.isBefore(startAt) && now.isBefore(endAt);
    }

    // getters and setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getLicencePlate() {
        return licencePlate;
    }

    public void setLicencePlate(String licencePlate) {
        this.licencePlate = licencePlate;
    }

    public VehicleType getVehicleType() {
        return vehicleType;
    }

    public void setVehicleType(VehicleType vehicleType) {
        this.vehicleType = vehicleType;
    }

    public LocalDateTime getStartAt() {
        return startAt;
    }

    public void setStartAt(LocalDateTime startAt) {
        this.startAt = startAt;
    }

    public Integer getDurationMinutes() {
        return durationMinutes;
    }

    public void setDurationMinutes(Integer durationMinutes) {
        this.durationMinutes = durationMinutes;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public ReservationStatus getStatus() {
        return status;
    }

    public void setStatus(ReservationStatus status) {
        this.status = status;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
