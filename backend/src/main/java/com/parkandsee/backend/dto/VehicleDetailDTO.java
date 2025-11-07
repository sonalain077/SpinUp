package com.parkandsee.backend.dto;

import java.time.Instant;

/**
 * DTO pour les détails d'un véhicule stationné
 */
public class VehicleDetailDTO {
    private String reservationId;
    private String licencePlate;
    private String vehicleType;
    private Instant startAt;
    private Instant endAt;
    private String status;
    private int durationMinutes;
    private boolean isOverdue;
    private Integer exceededMinutes;

    public VehicleDetailDTO() {
    }

    public VehicleDetailDTO(String reservationId, String licencePlate, String vehicleType, 
                           Instant startAt, Instant endAt, String status, int durationMinutes,
                           boolean isOverdue, Integer exceededMinutes) {
        this.reservationId = reservationId;
        this.licencePlate = licencePlate;
        this.vehicleType = vehicleType;
        this.startAt = startAt;
        this.endAt = endAt;
        this.status = status;
        this.durationMinutes = durationMinutes;
        this.isOverdue = isOverdue;
        this.exceededMinutes = exceededMinutes;
    }

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

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public int getDurationMinutes() {
        return durationMinutes;
    }

    public void setDurationMinutes(int durationMinutes) {
        this.durationMinutes = durationMinutes;
    }

    public boolean isOverdue() {
        return isOverdue;
    }

    public void setOverdue(boolean overdue) {
        isOverdue = overdue;
    }

    public Integer getExceededMinutes() {
        return exceededMinutes;
    }

    public void setExceededMinutes(Integer exceededMinutes) {
        this.exceededMinutes = exceededMinutes;
    }
}
