package com.parkandsee.backend.dto;

import java.time.Instant;
import java.util.List;

/**
 * DTO pour les infractions groupées par parking
 */
public class ParkingInfringementsDTO {
    private String parkingId;
    private String parkingName;
    private List<InfringementItemDTO> items;

    public ParkingInfringementsDTO() {
    }

    public ParkingInfringementsDTO(String parkingId, String parkingName, List<InfringementItemDTO> items) {
        this.parkingId = parkingId;
        this.parkingName = parkingName;
        this.items = items;
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

    public List<InfringementItemDTO> getItems() {
        return items;
    }

    public void setItems(List<InfringementItemDTO> items) {
        this.items = items;
    }

    /**
     * Détail d'une infraction
     */
    public static class InfringementItemDTO {
        private String reservationId;
        private String plate;
        private String vehicleType;
        private int paidMinutes;
        private Instant startAt;
        private Instant endAt;
        private int exceededMinutes;
        private String severity;  // "LEGER" ou "GRAVE"
        private boolean reported;
        private boolean regularized;

        public InfringementItemDTO() {
        }

        public String getReservationId() {
            return reservationId;
        }

        public void setReservationId(String reservationId) {
            this.reservationId = reservationId;
        }

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

        public int getPaidMinutes() {
            return paidMinutes;
        }

        public void setPaidMinutes(int paidMinutes) {
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

        public int getExceededMinutes() {
            return exceededMinutes;
        }

        public void setExceededMinutes(int exceededMinutes) {
            this.exceededMinutes = exceededMinutes;
        }

        public String getSeverity() {
            return severity;
        }

        public void setSeverity(String severity) {
            this.severity = severity;
        }

        public boolean isReported() {
            return reported;
        }

        public void setReported(boolean reported) {
            this.reported = reported;
        }

        public boolean isRegularized() {
            return regularized;
        }

        public void setRegularized(boolean regularized) {
            this.regularized = regularized;
        }
    }
}
