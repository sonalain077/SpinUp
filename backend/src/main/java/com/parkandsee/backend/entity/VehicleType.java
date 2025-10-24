package com.parkandsee.backend.entity;

/**
 * Types de véhicules supportés par le système Park & See
 */
public enum VehicleType {
    CAR("Voiture"),
    MOTORCYCLE("Moto"),
    VAN("Camionnette"),
    TRUCK("Camion"),
    BICYCLE("Vélo"),
    ELECTRIC_SCOOTER("Trottinette électrique");

    private final String displayName;

    VehicleType(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}