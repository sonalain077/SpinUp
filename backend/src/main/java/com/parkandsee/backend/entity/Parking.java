package com.parkandsee.backend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.util.UUID;

/**
 * Entité représentant un parking dans le système Park & See.
 * Chaque parking a une capacité fixe et un nom unique.
 */
@Entity
@Table(name = "parkings", indexes = {
    @Index(name = "idx_parking_name", columnList = "name", unique = true)
})
public class Parking {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @NotNull(message = "Le nom du parking est obligatoire")
    @Column(nullable = false, unique = true, length = 100)
    private String name;

    @NotNull(message = "La capacité du parking est obligatoire")
    @Positive(message = "La capacité doit être positive")
    @Column(nullable = false)
    private Integer capacity;

    // Constructors
    public Parking() {}

    public Parking(String name, Integer capacity) {
        this.name = name;
        this.capacity = capacity;
    }

    // Getters and Setters
    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Integer getCapacity() {
        return capacity;
    }

    public void setCapacity(Integer capacity) {
        this.capacity = capacity;
    }

    @Override
    public String toString() {
        return "Parking{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", capacity=" + capacity +
                '}';
    }
}
