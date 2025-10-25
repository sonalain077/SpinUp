package com.parkandsee.backend.dto;

public class PaymentResponse {
    private boolean success;
    private String message;
    private String reservationId;
    private Double paymentAmount;
    private Double hourlyRate;

    public PaymentResponse() {}

    public PaymentResponse(boolean success, String message, String reservationId) {
        this.success = success;
        this.message = message;
        this.reservationId = reservationId;
    }

    public PaymentResponse(boolean success, String message, String reservationId, Double paymentAmount, Double hourlyRate) {
        this.success = success;
        this.message = message;
        this.reservationId = reservationId;
        this.paymentAmount = paymentAmount;
        this.hourlyRate = hourlyRate;
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getReservationId() {
        return reservationId;
    }

    public void setReservationId(String reservationId) {
        this.reservationId = reservationId;
    }

    public Double getPaymentAmount() {
        return paymentAmount;
    }

    public void setPaymentAmount(Double paymentAmount) {
        this.paymentAmount = paymentAmount;
    }

    public Double getHourlyRate() {
        return hourlyRate;
    }

    public void setHourlyRate(Double hourlyRate) {
        this.hourlyRate = hourlyRate;
    }
}
