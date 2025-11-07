package com.parkandsee.backend.dto;

/**
 * DTO pour les statistiques d'un parking
 */
public class ParkingStatsDTO {
    private String parkingId;
    private String parkingName;
    private int used;
    private int capacity;
    private int free;
    private double fillPercent;

    public ParkingStatsDTO() {
    }

    public ParkingStatsDTO(String parkingId, String parkingName, int used, int capacity) {
        this.parkingId = parkingId;
        this.parkingName = parkingName;
        this.used = used;
        this.capacity = capacity;
        this.free = capacity - used;
        this.fillPercent = capacity > 0 ? (double) used / capacity : 0.0;
    }

    public String getParkingId() {
        return parkingId;
    }

    public void setParkingId(String parkingId) {
        this.parkingId = parkingId;
    }

    public String getParkingName() {
        return parkingName;
    }

    public void setParkingName(String parkingName) {
        this.parkingName = parkingName;
    }

    public int getUsed() {
        return used;
    }

    public void setUsed(int used) {
        this.used = used;
        this.free = capacity - used;
        this.fillPercent = capacity > 0 ? (double) used / capacity : 0.0;
    }

    public int getCapacity() {
        return capacity;
    }

    public void setCapacity(int capacity) {
        this.capacity = capacity;
        this.free = capacity - used;
        this.fillPercent = capacity > 0 ? (double) used / capacity : 0.0;
    }

    public int getFree() {
        return free;
    }

    public void setFree(int free) {
        this.free = free;
    }

    public double getFillPercent() {
        return fillPercent;
    }

    public void setFillPercent(double fillPercent) {
        this.fillPercent = fillPercent;
    }
}
