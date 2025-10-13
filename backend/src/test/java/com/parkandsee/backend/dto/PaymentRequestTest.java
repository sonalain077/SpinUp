package com.parkandsee.backend.dto;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class PaymentRequestTest {

    private PaymentRequest paymentRequest;
    private LocalDateTime futureDateTime;

    @BeforeEach
    void setUp() {
        paymentRequest = new PaymentRequest();
        futureDateTime = LocalDateTime.now().plusHours(2);
    }

    @Test
    void setAndGetLicencePlate_ShouldWorkCorrectly() {
        // Given
        String licencePlate = "AB-123-CD";

        // When
        paymentRequest.setLicencePlate(licencePlate);

        // Then
        assertEquals(licencePlate, paymentRequest.getLicencePlate());
    }

    @Test
    void setAndGetVehicleType_ShouldWorkCorrectly() {
        // Given
        String vehicleType = "voiture";

        // When
        paymentRequest.setVehicleType(vehicleType);

        // Then
        assertEquals(vehicleType, paymentRequest.getVehicleType());
    }

    @Test
    void setAndGetStartAt_ShouldWorkCorrectly() {
        // When
        paymentRequest.setStartAt(futureDateTime);

        // Then
        assertEquals(futureDateTime, paymentRequest.getStartAt());
    }

    @Test
    void setAndGetDurationMinutes_ShouldWorkCorrectly() {
        // Given
        Integer duration = 120;

        // When
        paymentRequest.setDurationMinutes(duration);

        // Then
        assertEquals(duration, paymentRequest.getDurationMinutes());
    }

    @Test
    void setAndGetAddress_ShouldWorkCorrectly() {
        // Given
        String address = "123 Test Street, Test City";

        // When
        paymentRequest.setAddress(address);

        // Then
        assertEquals(address, paymentRequest.getAddress());
    }

    @Test
    void setAndGetPaymentToken_ShouldWorkCorrectly() {
        // Given
        String paymentToken = "test-token-12345";

        // When
        paymentRequest.setPaymentToken(paymentToken);

        // Then
        assertEquals(paymentToken, paymentRequest.getPaymentToken());
    }

    @Test
    void paymentRequest_ShouldAllowNullPaymentToken() {
        // When
        paymentRequest.setPaymentToken(null);

        // Then
        assertNull(paymentRequest.getPaymentToken());
    }

    @Test
    void paymentRequest_ShouldAllowEmptyPaymentToken() {
        // Given
        String emptyToken = "";

        // When
        paymentRequest.setPaymentToken(emptyToken);

        // Then
        assertEquals(emptyToken, paymentRequest.getPaymentToken());
    }

    @Test
    void paymentRequest_ShouldHandleAllFieldsTogether() {
        // Given
        String licencePlate = "XY-789-ZW";
        String vehicleType = "moto";
        LocalDateTime startAt = LocalDateTime.now().plusDays(1);
        Integer duration = 180;
        String address = "456 Another Street";
        String paymentToken = "full-test-token";

        // When
        paymentRequest.setLicencePlate(licencePlate);
        paymentRequest.setVehicleType(vehicleType);
        paymentRequest.setStartAt(startAt);
        paymentRequest.setDurationMinutes(duration);
        paymentRequest.setAddress(address);
        paymentRequest.setPaymentToken(paymentToken);

        // Then
        assertEquals(licencePlate, paymentRequest.getLicencePlate());
        assertEquals(vehicleType, paymentRequest.getVehicleType());
        assertEquals(startAt, paymentRequest.getStartAt());
        assertEquals(duration, paymentRequest.getDurationMinutes());
        assertEquals(address, paymentRequest.getAddress());
        assertEquals(paymentToken, paymentRequest.getPaymentToken());
    }

    @Test
    void newPaymentRequest_ShouldHaveNullDefaultValues() {
        // Given & When
        PaymentRequest newRequest = new PaymentRequest();

        // Then
        assertNull(newRequest.getLicencePlate());
        assertNull(newRequest.getVehicleType());
        assertNull(newRequest.getStartAt());
        assertNull(newRequest.getDurationMinutes());
        assertNull(newRequest.getAddress());
        assertNull(newRequest.getPaymentToken());
    }

    @Test
    void setLicencePlate_ShouldAcceptSpecialCharacters() {
        // Given
        String[] specialPlates = {"AB-123-CD", "12-ABC-34", "TEST-001", "A1-B2-C3"};

        for (String plate : specialPlates) {
            // When
            paymentRequest.setLicencePlate(plate);

            // Then
            assertEquals(plate, paymentRequest.getLicencePlate());
        }
    }

    @Test
    void setVehicleType_ShouldAcceptDifferentTypes() {
        // Given
        String[] vehicleTypes = {"voiture", "moto", "camion", "vélo", "scooter"};

        for (String type : vehicleTypes) {
            // When
            paymentRequest.setVehicleType(type);

            // Then
            assertEquals(type, paymentRequest.getVehicleType());
        }
    }

    @Test
    void setDurationMinutes_ShouldAcceptPositiveValues() {
        // Given
        Integer[] durations = {15, 30, 60, 120, 240, 480, 1440};

        for (Integer duration : durations) {
            // When
            paymentRequest.setDurationMinutes(duration);

            // Then
            assertEquals(duration, paymentRequest.getDurationMinutes());
        }
    }
}