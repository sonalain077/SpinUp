package com.parkandsee.backend.entity;

/**
 * Méthodes de paiement supportées par le système Park & See.
 */
public enum PaymentMethod {
    CARD("Carte bancaire"),
    LYDIA("Lydia"),
    PAYPAL("PayPal"),
    APPLE_PAY("Apple Pay"),
    GOOGLE_PAY("Google Pay");

    private final String displayName;

    PaymentMethod(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
