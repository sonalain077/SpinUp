package com.parkandsee.backend.dto;

/**
 * Réponse après paiement de dépassement (régularisation)
 */
public class OverduePaymentResponse {
    private boolean success;
    private String message;
    private String reservationId;
    private Double overdueAmount;
    private Long overdueMinutes;
    private String newStatus;

    public OverduePaymentResponse() {}

    public OverduePaymentResponse(boolean success, String message, String reservationId, Double overdueAmount, Long overdueMinutes, String newStatus) {
        this.success = success;
        this.message = message;
        this.reservationId = reservationId;
        this.overdueAmount = overdueAmount;
        this.overdueMinutes = overdueMinutes;
        this.newStatus = newStatus;
    }

    public static OverduePaymentResponse success(String reservationId, Double overdueAmount, Long overdueMinutes) {
        return new OverduePaymentResponse(true,
            String.format("Infraction régularisée. Paiement de %.2f€ confirmé (%d minute(s) de dépassement).", overdueAmount, overdueMinutes),
            reservationId,
            overdueAmount,
            overdueMinutes,
            "REGULARISE");
    }

    public static OverduePaymentResponse failure(String message) {
        return new OverduePaymentResponse(false, message, null, 0.0, 0L, null);
    }

    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public String getReservationId() { return reservationId; }
    public void setReservationId(String reservationId) { this.reservationId = reservationId; }
    public Double getOverdueAmount() { return overdueAmount; }
    public void setOverdueAmount(Double overdueAmount) { this.overdueAmount = overdueAmount; }
    public Long getOverdueMinutes() { return overdueMinutes; }
    public void setOverdueMinutes(Long overdueMinutes) { this.overdueMinutes = overdueMinutes; }
    public String getNewStatus() { return newStatus; }
    public void setNewStatus(String newStatus) { this.newStatus = newStatus; }
}