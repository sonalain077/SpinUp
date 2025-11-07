package com.parkandsee.backend.dto;

import java.time.Instant;

/**
 * DTO pour l'historique des véhicules régularisés
 */
public class RegularizedHistoryDTO {
    private String reservationId;
    private String licencePlate;
    private String vehicleType;
    private String parkingName;
    private Instant startAt;
    private Instant endAt;
    private Instant regularizedAt;
    private int exceededMinutes;
    private int paidMinutes;
    
    public RegularizedHistoryDTO() {
    }
    
    public RegularizedHistoryDTO(String reservationId, String licencePlate, String vehicleType,
                                String parkingName, Instant startAt, Instant endAt, 
                                Instant regularizedAt, int exceededMinutes, int paidMinutes) {
        this.reservationId = reservationId;
        this.licencePlate = licencePlate;
        this.vehicleType = vehicleType;
        this.parkingName = parkingName;
        this.startAt = startAt;
        this.endAt = endAt;
        this.regularizedAt = regularizedAt;
        this.exceededMinutes = exceededMinutes;
        this.paidMinutes = paidMinutes;
    }

    // Getters and Setters
    public String getReservationId() {
        return reservationId;
    }

    public void setReservationId(String reservationId) {
        this.reservationId = reservationId;
    }

    public String getLicencePlate() {
        return licencePlate;
    }

    public void setLicencePlate(String licencePlate) {
        this.licencePlate = licencePlate;
    }

    public String getVehicleType() {
        return vehicleType;
    }

    public void setVehicleType(String vehicleType) {
        this.vehicleType = vehicleType;
    }

    public String getParkingName() {
        return parkingName;
    }

    public void setParkingName(String parkingName) {
        this.parkingName = parkingName;
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

    public Instant getRegularizedAt() {
        return regularizedAt;
    }

    public void setRegularizedAt(Instant regularizedAt) {
        this.regularizedAt = regularizedAt;
    }

    public int getExceededMinutes() {
        return exceededMinutes;
    }

    public void setExceededMinutes(int exceededMinutes) {
        this.exceededMinutes = exceededMinutes;
    }

    public int getPaidMinutes() {
        return paidMinutes;
    }

    public void setPaidMinutes(int paidMinutes) {
        this.paidMinutes = paidMinutes;
    }
}
