package com.parkandsee.backend.dto;

public class PaymentResponse {
    private boolean success;
    private String message;
    private String reservationId;

    public PaymentResponse() {}

    public PaymentResponse(boolean success, String message, String reservationId) {
        this.success = success;
        this.message = message;
        this.reservationId = reservationId;
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
}
