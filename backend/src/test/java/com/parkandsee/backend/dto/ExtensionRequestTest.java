package com.parkandsee.backend.dto;

import java.util.Set;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class ExtensionRequestTest {

    private Validator validator;

    @BeforeEach
    void setUp() {
        ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
    }

    @Test
    void testValidExtensionRequest() {
        // Given
        ExtensionRequest request = new ExtensionRequest();
        request.setReservationId("R-12345");
        request.setLicencePlate("AB-123-CD");
        request.setExtensionMinutes(60);
        request.setPaymentToken("token-123");
        request.setPaymentMethod("carte-bleue");

        // When
        Set<ConstraintViolation<ExtensionRequest>> violations = validator.validate(request);

        // Then
        assertTrue(violations.isEmpty(), "Valid request should have no violations");
    }

    @Test
    void testExtensionRequest_MissingReservationId() {
        // Given
        ExtensionRequest request = new ExtensionRequest();
        request.setExtensionMinutes(60);
        request.setPaymentToken("token-123");

        // When
        Set<ConstraintViolation<ExtensionRequest>> violations = validator.validate(request);

        // Then
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream()
                .anyMatch(v -> v.getMessage().contains("ID de réservation est obligatoire")));
    }

    @Test
    void testExtensionRequest_BlankReservationId() {
        // Given
        ExtensionRequest request = new ExtensionRequest();
        request.setReservationId("");
        request.setExtensionMinutes(60);
        request.setPaymentToken("token-123");

        // When
        Set<ConstraintViolation<ExtensionRequest>> violations = validator.validate(request);

        // Then
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream()
                .anyMatch(v -> v.getMessage().contains("ID de réservation est obligatoire")));
    }

    @Test
    void testExtensionRequest_MissingExtensionMinutes() {
        // Given
        ExtensionRequest request = new ExtensionRequest();
        request.setReservationId("R-12345");
        request.setPaymentToken("token-123");

        // When
        Set<ConstraintViolation<ExtensionRequest>> violations = validator.validate(request);

        // Then
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream()
                .anyMatch(v -> v.getMessage().contains("durée d'extension est obligatoire")));
    }

    @Test
    void testExtensionRequest_ZeroExtensionMinutes() {
        // Given
        ExtensionRequest request = new ExtensionRequest();
        request.setReservationId("R-12345");
        request.setExtensionMinutes(0);
        request.setPaymentToken("token-123");

        // When
        Set<ConstraintViolation<ExtensionRequest>> violations = validator.validate(request);

        // Then
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream()
                .anyMatch(v -> v.getMessage().contains("au moins 1 minute")));
    }

    @Test
    void testExtensionRequest_NegativeExtensionMinutes() {
        // Given
        ExtensionRequest request = new ExtensionRequest();
        request.setReservationId("R-12345");
        request.setExtensionMinutes(-30);
        request.setPaymentToken("token-123");

        // When
        Set<ConstraintViolation<ExtensionRequest>> violations = validator.validate(request);

        // Then
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream()
                .anyMatch(v -> v.getMessage().contains("au moins 1 minute")));
    }

    @Test
    void testExtensionRequest_MissingPaymentToken() {
        // Given
        ExtensionRequest request = new ExtensionRequest();
        request.setReservationId("R-12345");
        request.setExtensionMinutes(60);

        // When
        Set<ConstraintViolation<ExtensionRequest>> violations = validator.validate(request);

        // Then
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream()
                .anyMatch(v -> v.getMessage().contains("token de paiement est obligatoire")));
    }

    @Test
    void testExtensionRequest_BlankPaymentToken() {
        // Given
        ExtensionRequest request = new ExtensionRequest();
        request.setReservationId("R-12345");
        request.setExtensionMinutes(60);
        request.setPaymentToken("   ");

        // When
        Set<ConstraintViolation<ExtensionRequest>> violations = validator.validate(request);

        // Then
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream()
                .anyMatch(v -> v.getMessage().contains("token de paiement est obligatoire")));
    }

    @Test
    void testExtensionRequest_Constructor() {
        // Given & When
        ExtensionRequest request = new ExtensionRequest("R-12345", 60, "token-123");

        // Then
        assertEquals("R-12345", request.getReservationId());
        assertEquals(60, request.getExtensionMinutes());
        assertEquals("token-123", request.getPaymentToken());
    }

    @Test
    void testExtensionRequest_ToString() {
        // Given
        ExtensionRequest request = new ExtensionRequest();
        request.setReservationId("R-12345");
        request.setLicencePlate("AB-123-CD");
        request.setExtensionMinutes(60);
        request.setPaymentMethod("carte-bleue");

        // When
        String toString = request.toString();

        // Then
        assertTrue(toString.contains("R-12345"));
        assertTrue(toString.contains("AB-123-CD"));
        assertTrue(toString.contains("60"));
        assertTrue(toString.contains("carte-bleue"));
    }

    @Test
    void testExtensionRequest_AllGettersAndSetters() {
        // Given
        ExtensionRequest request = new ExtensionRequest();

        // When & Then
        request.setReservationId("R-12345");
        assertEquals("R-12345", request.getReservationId());

        request.setLicencePlate("AB-123-CD");
        assertEquals("AB-123-CD", request.getLicencePlate());

        request.setExtensionMinutes(90);
        assertEquals(90, request.getExtensionMinutes());

        request.setPaymentToken("token-456");
        assertEquals("token-456", request.getPaymentToken());

        request.setPaymentMethod("lydia");
        assertEquals("lydia", request.getPaymentMethod());
    }
}