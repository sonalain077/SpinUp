package com.parkandsee.backend.dto;

import java.time.Instant;
import java.util.List;

/**
 * DTO pour la vue d'ensemble du dashboard agent
 */
public class AgentOverviewDTO {
    private Instant lastUpdate;
    private String health;
    private TotalsDTO totals;
    private MostFilledDTO mostFilled;
    private DistributionDTO distribution;
    private List<ParkingStatsDTO> perParking;
    private OverstayStatsDTO overstayStats;

    // Constructors
    public AgentOverviewDTO() {
    }

    public AgentOverviewDTO(Instant lastUpdate, String health, TotalsDTO totals, 
                           MostFilledDTO mostFilled, DistributionDTO distribution,
                           List<ParkingStatsDTO> perParking, OverstayStatsDTO overstayStats) {
        this.lastUpdate = lastUpdate;
        this.health = health;
        this.totals = totals;
        this.mostFilled = mostFilled;
        this.distribution = distribution;
        this.perParking = perParking;
        this.overstayStats = overstayStats;
    }

    // Getters and Setters
    public Instant getLastUpdate() {
        return lastUpdate;
    }

    public void setLastUpdate(Instant lastUpdate) {
        this.lastUpdate = lastUpdate;
    }

    public String getHealth() {
        return health;
    }

    public void setHealth(String health) {
        this.health = health;
    }

    public TotalsDTO getTotals() {
        return totals;
    }

    public void setTotals(TotalsDTO totals) {
        this.totals = totals;
    }

    public MostFilledDTO getMostFilled() {
        return mostFilled;
    }

    public void setMostFilled(MostFilledDTO mostFilled) {
        this.mostFilled = mostFilled;
    }

    public DistributionDTO getDistribution() {
        return distribution;
    }

    public void setDistribution(DistributionDTO distribution) {
        this.distribution = distribution;
    }

    public List<ParkingStatsDTO> getPerParking() {
        return perParking;
    }

    public void setPerParking(List<ParkingStatsDTO> perParking) {
        this.perParking = perParking;
    }

    public OverstayStatsDTO getOverstayStats() {
        return overstayStats;
    }

    public void setOverstayStats(OverstayStatsDTO overstayStats) {
        this.overstayStats = overstayStats;
    }

    // Nested DTOs
    public static class TotalsDTO {
        private int parkedVehicles;
        private int capacity;
        private double saturationIndex;

        public TotalsDTO() {
        }

        public TotalsDTO(int parkedVehicles, int capacity, double saturationIndex) {
            this.parkedVehicles = parkedVehicles;
            this.capacity = capacity;
            this.saturationIndex = saturationIndex;
        }

        public int getParkedVehicles() {
            return parkedVehicles;
        }

        public void setParkedVehicles(int parkedVehicles) {
            this.parkedVehicles = parkedVehicles;
        }

        public int getCapacity() {
            return capacity;
        }

        public void setCapacity(int capacity) {
            this.capacity = capacity;
        }

        public double getSaturationIndex() {
            return saturationIndex;
        }

        public void setSaturationIndex(double saturationIndex) {
            this.saturationIndex = saturationIndex;
        }
    }

    public static class MostFilledDTO {
        private String parkingId;
        private String parkingName;
        private int used;
        private int capacity;
        private double fillPercent;

        public MostFilledDTO() {
        }

        public MostFilledDTO(String parkingId, String parkingName, int used, int capacity, double fillPercent) {
            this.parkingId = parkingId;
            this.parkingName = parkingName;
            this.used = used;
            this.capacity = capacity;
            this.fillPercent = fillPercent;
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
        }

        public int getCapacity() {
            return capacity;
        }

        public void setCapacity(int capacity) {
            this.capacity = capacity;
        }

        public double getFillPercent() {
            return fillPercent;
        }

        public void setFillPercent(double fillPercent) {
            this.fillPercent = fillPercent;
        }
    }

    public static class DistributionDTO {
        private double stddevPercent;
        private String label;

        public DistributionDTO() {
        }

        public DistributionDTO(double stddevPercent, String label) {
            this.stddevPercent = stddevPercent;
            this.label = label;
        }

        public double getStddevPercent() {
            return stddevPercent;
        }

        public void setStddevPercent(double stddevPercent) {
            this.stddevPercent = stddevPercent;
        }

        public String getLabel() {
            return label;
        }

        public void setLabel(String label) {
            this.label = label;
        }
    }

    public static class OverstayStatsDTO {
        private int nowExceeded;
        private int alreadyReported;
        private int regularized;
        private int avgExcessMinutes;
        private int totalExcessMinutes;
        private List<VehicleTypeCountDTO> byType;
        private List<ZoneCountDTO> topExcessZones;

        public OverstayStatsDTO() {
        }

        public int getNowExceeded() {
            return nowExceeded;
        }

        public void setNowExceeded(int nowExceeded) {
            this.nowExceeded = nowExceeded;
        }

        public int getAlreadyReported() {
            return alreadyReported;
        }

        public void setAlreadyReported(int alreadyReported) {
            this.alreadyReported = alreadyReported;
        }

        public int getRegularized() {
            return regularized;
        }

        public void setRegularized(int regularized) {
            this.regularized = regularized;
        }

        public int getAvgExcessMinutes() {
            return avgExcessMinutes;
        }

        public void setAvgExcessMinutes(int avgExcessMinutes) {
            this.avgExcessMinutes = avgExcessMinutes;
        }

        public int getTotalExcessMinutes() {
            return totalExcessMinutes;
        }

        public void setTotalExcessMinutes(int totalExcessMinutes) {
            this.totalExcessMinutes = totalExcessMinutes;
        }

        public List<VehicleTypeCountDTO> getByType() {
            return byType;
        }

        public void setByType(List<VehicleTypeCountDTO> byType) {
            this.byType = byType;
        }

        public List<ZoneCountDTO> getTopExcessZones() {
            return topExcessZones;
        }

        public void setTopExcessZones(List<ZoneCountDTO> topExcessZones) {
            this.topExcessZones = topExcessZones;
        }
    }

    public static class VehicleTypeCountDTO {
        private String type;
        private int count;

        public VehicleTypeCountDTO() {
        }

        public VehicleTypeCountDTO(String type, int count) {
            this.type = type;
            this.count = count;
        }

        public String getType() {
            return type;
        }

        public void setType(String type) {
            this.type = type;
        }

        public int getCount() {
            return count;
        }

        public void setCount(int count) {
            this.count = count;
        }
    }

    public static class ZoneCountDTO {
        private String parkingName;
        private int count;

        public ZoneCountDTO() {
        }

        public ZoneCountDTO(String parkingName, int count) {
            this.parkingName = parkingName;
            this.count = count;
        }

        public String getParkingName() {
            return parkingName;
        }

        public void setParkingName(String parkingName) {
            this.parkingName = parkingName;
        }

        public int getCount() {
            return count;
        }

        public void setCount(int count) {
            this.count = count;
        }
    }
}
