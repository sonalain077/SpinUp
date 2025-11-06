package com.parkandsee.backend.dto;

import java.time.Instant;

/**
 * DTO représentant un véhicule actuellement garé (pour GET /api/agent/parked).
 */
public class ParkedVehicleDTO {

    private String plate;
    private String vehicleType;
    private String parkingName;
    private Instant startAt;
    private Instant endAt;
    private Long remainingMinutes;

    // Constructors
    public ParkedVehicleDTO() {}

    public ParkedVehicleDTO(String plate, String vehicleType, String parkingName,
                           Instant startAt, Instant endAt, Long remainingMinutes) {
        this.plate = plate;
        this.vehicleType = vehicleType;
        this.parkingName = parkingName;
        this.startAt = startAt;
        this.endAt = endAt;
        this.remainingMinutes = remainingMinutes;
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

    public Long getRemainingMinutes() {
        return remainingMinutes;
    }

    public void setRemainingMinutes(Long remainingMinutes) {
        this.remainingMinutes = remainingMinutes;
    }
}
