package com.parkandsee.backend.dto;

import java.util.List;
import java.util.UUID;

/**
 * DTO de réponse pour GET /api/agent/overview.
 * Contient les statistiques globales, l'occupation par parking, et les infractions.
 */
public class AgentOverviewDTO {

    private TotalsDTO totals;
    private List<ParkingOccupationDTO> perParking;
    private List<InfringementDTO> infringements;

    // Nested DTOs
    public static class TotalsDTO {
        private Long parkedVehicles;
        private Integer capacity;
        private Double saturationIndex;

        public TotalsDTO() {}

        public TotalsDTO(Long parkedVehicles, Integer capacity, Double saturationIndex) {
            this.parkedVehicles = parkedVehicles;
            this.capacity = capacity;
            this.saturationIndex = saturationIndex;
        }

        public Long getParkedVehicles() {
            return parkedVehicles;
        }

        public void setParkedVehicles(Long parkedVehicles) {
            this.parkedVehicles = parkedVehicles;
        }

        public Integer getCapacity() {
            return capacity;
        }

        public void setCapacity(Integer capacity) {
            this.capacity = capacity;
        }

        public Double getSaturationIndex() {
            return saturationIndex;
        }

        public void setSaturationIndex(Double saturationIndex) {
            this.saturationIndex = saturationIndex;
        }
    }

    public static class ParkingOccupationDTO {
        private UUID parkingId;
        private String parkingName;
        private Long used;
        private Integer capacity;

        public ParkingOccupationDTO() {}

        public ParkingOccupationDTO(UUID parkingId, String parkingName, Long used, Integer capacity) {
            this.parkingId = parkingId;
            this.parkingName = parkingName;
            this.used = used;
            this.capacity = capacity;
        }

        public UUID getParkingId() {
            return parkingId;
        }

        public void setParkingId(UUID parkingId) {
            this.parkingId = parkingId;
        }

        public String getParkingName() {
            return parkingName;
        }

        public void setParkingName(String parkingName) {
            this.parkingName = parkingName;
        }

        public Long getUsed() {
            return used;
        }

        public void setUsed(Long used) {
            this.used = used;
        }

        public Integer getCapacity() {
            return capacity;
        }

        public void setCapacity(Integer capacity) {
            this.capacity = capacity;
        }
    }

    // Constructors
    public AgentOverviewDTO() {}

    public AgentOverviewDTO(TotalsDTO totals, List<ParkingOccupationDTO> perParking,
                           List<InfringementDTO> infringements) {
        this.totals = totals;
        this.perParking = perParking;
        this.infringements = infringements;
    }

    // Getters and Setters
    public TotalsDTO getTotals() {
        return totals;
    }

    public void setTotals(TotalsDTO totals) {
        this.totals = totals;
    }

    public List<ParkingOccupationDTO> getPerParking() {
        return perParking;
    }

    public void setPerParking(List<ParkingOccupationDTO> perParking) {
        this.perParking = perParking;
    }

    public List<InfringementDTO> getInfringements() {
        return infringements;
    }

    public void setInfringements(List<InfringementDTO> infringements) {
        this.infringements = infringements;
    }
}
