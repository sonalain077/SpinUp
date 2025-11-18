package com.parkandsee.backend.dto;

/**
 * DTO pour l'entité Parking - informations publiques
 */
public class ParkingDTO {
    private String id;
    private String name;
    private String address;
    private Integer totalSpots;

    public ParkingDTO() {
    }

    public ParkingDTO(String id, String name, String address, Integer totalSpots) {
        this.id = id;
        this.name = name;
        this.address = address;
        this.totalSpots = totalSpots;
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public Integer getTotalSpots() {
        return totalSpots;
    }

    public void setTotalSpots(Integer totalSpots) {
        this.totalSpots = totalSpots;
    }
}
