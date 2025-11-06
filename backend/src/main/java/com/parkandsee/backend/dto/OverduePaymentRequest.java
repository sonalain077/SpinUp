package com.parkandsee.backend.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * Requête de régularisation d'une infraction (dépassement de temps)
 */
public class OverduePaymentRequest {

    @NotBlank
    private String reservationId;

    // Token ou identifiant de moyen de paiement (placeholder pour démo)
    private String paymentToken;

    public OverduePaymentRequest() {}

    public OverduePaymentRequest(String reservationId, String paymentToken) {
        this.reservationId = reservationId;
        this.paymentToken = paymentToken;
    }

    public String getReservationId() {
        return reservationId;
    }

    public void setReservationId(String reservationId) {
        this.reservationId = reservationId;
    }

    public String getPaymentToken() {
        return paymentToken;
    }

    public void setPaymentToken(String paymentToken) {
        this.paymentToken = paymentToken;
    }
}