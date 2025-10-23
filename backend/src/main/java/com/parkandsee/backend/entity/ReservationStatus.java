package com.parkandsee.backend.entity;

/**
 * Statuts possibles d'une réservation
 */
public enum ReservationStatus {
    ACTIVE("Active"),
    COMPLETED("Terminée"),
    CANCELLED("Annulée"),
    OVERDUE("En dépassement");

    private final String displayName;

    ReservationStatus(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}