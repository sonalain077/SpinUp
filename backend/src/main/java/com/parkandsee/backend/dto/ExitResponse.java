package com.parkandsee.backend.dto;

/**
 * DTO pour la réponse de sortie du parking
 */
public class ExitResponse {
    
    private boolean canExit;
    private String message;
    private boolean hasOverdue;
    private Long overdueMinutes;
    private Double overdueAmount;
    private String reservationId;

    public ExitResponse() {}

    public ExitResponse(boolean canExit, String message, boolean hasOverdue, 
                       Long overdueMinutes, Double overdueAmount, String reservationId) {
        this.canExit = canExit;
        this.message = message;
        this.hasOverdue = hasOverdue;
        this.overdueMinutes = overdueMinutes;
        this.overdueAmount = overdueAmount;
        this.reservationId = reservationId;
    }

    // Constructeur simplifié pour sortie autorisée
    public static ExitResponse allowed(String message, String reservationId) {
        return new ExitResponse(true, message, false, 0L, 0.0, reservationId);
    }

    // Constructeur pour infraction
    public static ExitResponse denied(String message, Long overdueMinutes, 
                                     Double overdueAmount, String reservationId) {
        return new ExitResponse(false, message, true, overdueMinutes, 
                               overdueAmount, reservationId);
    }

    // Getters et setters
    public boolean isCanExit() {
        return canExit;
    }

    public void setCanExit(boolean canExit) {
        this.canExit = canExit;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public boolean isHasOverdue() {
        return hasOverdue;
    }

    public void setHasOverdue(boolean hasOverdue) {
        this.hasOverdue = hasOverdue;
    }

    public Long getOverdueMinutes() {
        return overdueMinutes;
    }

    public void setOverdueMinutes(Long overdueMinutes) {
        this.overdueMinutes = overdueMinutes;
    }

    public Double getOverdueAmount() {
        return overdueAmount;
    }

    public void setOverdueAmount(Double overdueAmount) {
        this.overdueAmount = overdueAmount;
    }

    public String getReservationId() {
        return reservationId;
    }

    public void setReservationId(String reservationId) {
        this.reservationId = reservationId;
    }

    @Override
    public String toString() {
        return "ExitResponse{" +
                "canExit=" + canExit +
                ", message='" + message + '\'' +
                ", hasOverdue=" + hasOverdue +
                ", overdueMinutes=" + overdueMinutes +
                ", overdueAmount=" + overdueAmount +
                ", reservationId='" + reservationId + '\'' +
                '}';
    }
}
