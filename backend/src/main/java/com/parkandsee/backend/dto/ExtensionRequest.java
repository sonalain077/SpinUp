package com.parkandsee.backend.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * DTO pour les demandes d'extension de stationnement
 */
public class ExtensionRequest {
    
    @NotBlank(message = "L'ID de réservation est obligatoire")
    private String reservationId;
    
    private String licencePlate; // Optionnel pour double vérification
    
    @NotNull(message = "La durée d'extension est obligatoire")
    @Min(value = 1, message = "La durée d'extension doit être d'au moins 1 minute")
    private Integer extensionMinutes;
    
    @NotBlank(message = "Le token de paiement est obligatoire")
    private String paymentToken;
    
    private String paymentMethod; // carte-bleue, lydia, paypal
    
    // Constructeurs
    public ExtensionRequest() {}
    
    public ExtensionRequest(String reservationId, Integer extensionMinutes, String paymentToken) {
        this.reservationId = reservationId;
        this.extensionMinutes = extensionMinutes;
        this.paymentToken = paymentToken;
    }
    
    // Getters et Setters
    public String getReservationId() {
        return reservationId;
    }
    
    public void setReservationId(String reservationId) {
        this.reservationId = reservationId;
    }
    
    public String getLicencePlate() {
        return licencePlate;
    }
    
    public void setLicencePlate(String licencePlate) {
        this.licencePlate = licencePlate;
    }
    
    public Integer getExtensionMinutes() {
        return extensionMinutes;
    }
    
    public void setExtensionMinutes(Integer extensionMinutes) {
        this.extensionMinutes = extensionMinutes;
    }
    
    public String getPaymentToken() {
        return paymentToken;
    }
    
    public void setPaymentToken(String paymentToken) {
        this.paymentToken = paymentToken;
    }
    
    public String getPaymentMethod() {
        return paymentMethod;
    }
    
    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }
    
    @Override
    public String toString() {
        return "ExtensionRequest{" +
                "reservationId='" + reservationId + '\'' +
                ", licencePlate='" + licencePlate + '\'' +
                ", extensionMinutes=" + extensionMinutes +
                ", paymentMethod='" + paymentMethod + '\'' +
                '}';
    }
}