package com.parkandsee.backend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import org.hibernate.annotations.CreationTimestamp;
import java.time.Instant;
import java.util.UUID;

/**
 * Entité représentant un véhicule dans le système Park & See.
 * Un véhicule est identifié de manière unique par sa plaque d'immatriculation.
 */
@Entity
@Table(name = "vehicles", indexes = {
    @Index(name = "idx_vehicle_plate", columnList = "plate", unique = true)
})
public class Vehicle {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @NotNull(message = "La plaque d'immatriculation est obligatoire")
    @Pattern(regexp = "^[A-Z]{2}-[0-9]{3}-[A-Z]{2}$", message = "Format de plaque invalide (XX-123-XX)")
    @Column(nullable = false, unique = true, length = 11)
    private String plate;

    @NotNull(message = "Le type de véhicule est obligatoire")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private VehicleType type;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    // Constructors
    public Vehicle() {}

    public Vehicle(String plate, VehicleType type) {
        this.plate = plate;
        this.type = type;
    }

    // Getters and Setters
    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getPlate() {
        return plate;
    }

    public void setPlate(String plate) {
        this.plate = plate;
    }

    public VehicleType getType() {
        return type;
    }

    public void setType(VehicleType type) {
        this.type = type;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    /**
     * Normalise une plaque d'immatriculation: trim, uppercase, suppression des espaces.
     * @param rawPlate plaque brute saisie par l'utilisateur
     * @return plaque normalisée (ex: "AB-123-CD")
     */
    public static String normalizePlate(String rawPlate) {
        if (rawPlate == null) {
            return null;
        }
        return rawPlate.trim().toUpperCase().replaceAll("\\s+", "");
    }

    @Override
    public String toString() {
        return "Vehicle{" +
                "id=" + id +
                ", plate='" + plate + '\'' +
                ", type=" + type +
                ", createdAt=" + createdAt +
                '}';
    }
}
