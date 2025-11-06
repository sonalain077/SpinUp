package com.parkandsee.backend.dto;

import java.time.Instant;

/**
 * DTO représentant une infraction (véhicule en dépassement).
 */
public class InfringementDTO {

    private String plate;
    private String vehicleType;
    private String parkingName;
    private Integer paidMinutes;
    private Instant startAt;
    private Instant endAt;
    private Long exceededMinutes;
    private String severity; // "LEGER" ou "GRAVE"

    // Constructors
    public InfringementDTO() {}

    public InfringementDTO(String plate, String vehicleType, String parkingName,
                          Integer paidMinutes, Instant startAt, Instant endAt,
                          Long exceededMinutes, String severity) {
        this.plate = plate;
        this.vehicleType = vehicleType;
        this.parkingName = parkingName;
        this.paidMinutes = paidMinutes;
        this.startAt = startAt;
        this.endAt = endAt;
        this.exceededMinutes = exceededMinutes;
        this.severity = severity;
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

    public Integer getPaidMinutes() {
        return paidMinutes;
    }

    public void setPaidMinutes(Integer paidMinutes) {
        this.paidMinutes = paidMinutes;
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

    public Long getExceededMinutes() {
        return exceededMinutes;
    }

    public void setExceededMinutes(Long exceededMinutes) {
        this.exceededMinutes = exceededMinutes;
    }

    public String getSeverity() {
        return severity;
    }

    public void setSeverity(String severity) {
        this.severity = severity;
    }
}
