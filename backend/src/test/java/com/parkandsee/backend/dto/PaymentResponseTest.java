package com.parkandsee.backend.dto;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class PaymentResponseTest {

    private PaymentResponse paymentResponse;

    @BeforeEach
    void setUp() {
        paymentResponse = new PaymentResponse();
    }

    @Test
    void defaultConstructor_ShouldCreateObjectWithDefaultValues() {
        // Given & When
        PaymentResponse response = new PaymentResponse();

        // Then
        assertFalse(response.isSuccess()); // boolean default is false
        assertNull(response.getMessage());
        assertNull(response.getReservationId());
    }

    @Test
    void parameterizedConstructor_ShouldSetAllFields() {
        // Given
        boolean success = true;
        String message = "Test message";
        String reservationId = "test-reservation-123";

        // When
        PaymentResponse response = new PaymentResponse(success, message, reservationId);

        // Then
        assertTrue(response.isSuccess());
        assertEquals(message, response.getMessage());
        assertEquals(reservationId, response.getReservationId());
    }

    @Test
    void parameterizedConstructor_WithFalseSuccess_ShouldWork() {
        // Given
        boolean success = false;
        String message = "Payment failed";
        String reservationId = null;

        // When
        PaymentResponse response = new PaymentResponse(success, message, reservationId);

        // Then
        assertFalse(response.isSuccess());
        assertEquals(message, response.getMessage());
        assertNull(response.getReservationId());
    }

    @Test
    void setAndIsSuccess_ShouldWorkCorrectly() {
        // When
        paymentResponse.setSuccess(true);

        // Then
        assertTrue(paymentResponse.isSuccess());

        // When
        paymentResponse.setSuccess(false);

        // Then
        assertFalse(paymentResponse.isSuccess());
    }

    @Test
    void setAndGetMessage_ShouldWorkCorrectly() {
        // Given
        String message = "Reservation confirmed successfully";

        // When
        paymentResponse.setMessage(message);

        // Then
        assertEquals(message, paymentResponse.getMessage());
    }

    @Test
    void setAndGetReservationId_ShouldWorkCorrectly() {
        // Given
        String reservationId = "uuid-reservation-12345";

        // When
        paymentResponse.setReservationId(reservationId);

        // Then
        assertEquals(reservationId, paymentResponse.getReservationId());
    }

    @Test
    void setMessage_ShouldAcceptNullValue() {
        // When
        paymentResponse.setMessage(null);

        // Then
        assertNull(paymentResponse.getMessage());
    }

    @Test
    void setMessage_ShouldAcceptEmptyString() {
        // Given
        String emptyMessage = "";

        // When
        paymentResponse.setMessage(emptyMessage);

        // Then
        assertEquals(emptyMessage, paymentResponse.getMessage());
    }

    @Test
    void setReservationId_ShouldAcceptNullValue() {
        // When
        paymentResponse.setReservationId(null);

        // Then
        assertNull(paymentResponse.getReservationId());
    }

    @Test
    void setReservationId_ShouldAcceptEmptyString() {
        // Given
        String emptyId = "";

        // When
        paymentResponse.setReservationId(emptyId);

        // Then
        assertEquals(emptyId, paymentResponse.getReservationId());
    }

    @Test
    void paymentResponse_ShouldHandleAllFieldsTogether() {
        // Given
        boolean success = true;
        String message = "Complete success message";
        String reservationId = "complete-reservation-id-123";

        // When
        paymentResponse.setSuccess(success);
        paymentResponse.setMessage(message);
        paymentResponse.setReservationId(reservationId);

        // Then
        assertTrue(paymentResponse.isSuccess());
        assertEquals(message, paymentResponse.getMessage());
        assertEquals(reservationId, paymentResponse.getReservationId());
    }

    @Test
    void paymentResponse_SuccessfulScenario() {
        // Given
        PaymentResponse successResponse = new PaymentResponse(
            true, 
            "Reservation confirmed", 
            "res-12345-uuid"
        );

        // Then
        assertTrue(successResponse.isSuccess());
        assertEquals("Reservation confirmed", successResponse.getMessage());
        assertEquals("res-12345-uuid", successResponse.getReservationId());
    }

    @Test
    void paymentResponse_FailureScenario() {
        // Given
        PaymentResponse failureResponse = new PaymentResponse(
            false, 
            "Payment processing failed", 
            null
        );

        // Then
        assertFalse(failureResponse.isSuccess());
        assertEquals("Payment processing failed", failureResponse.getMessage());
        assertNull(failureResponse.getReservationId());
    }

    @Test
    void paymentResponse_ShouldHandleLongMessages() {
        // Given
        String longMessage = "This is a very long error message that might occur when there are detailed " +
                           "validation errors or complex business logic failures that need to be communicated " +
                           "back to the client application for proper error handling.";

        // When
        paymentResponse.setMessage(longMessage);

        // Then
        assertEquals(longMessage, paymentResponse.getMessage());
    }

    @Test
    void paymentResponse_ShouldHandleSpecialCharactersInMessage() {
        // Given
        String specialMessage = "Échec du paiement: caractères spéciaux àéèùç!@#$%^&*()";

        // When
        paymentResponse.setMessage(specialMessage);

        // Then
        assertEquals(specialMessage, paymentResponse.getMessage());
    }

    @Test
    void paymentResponse_ShouldHandleDifferentReservationIdFormats() {
        // Given
        String[] reservationIds = {
            "uuid-format-12345",
            "12345",
            "RES-2024-001",
            "booking_2024_10_13_001",
            "simple-id"
        };

        for (String id : reservationIds) {
            // When
            paymentResponse.setReservationId(id);

            // Then
            assertEquals(id, paymentResponse.getReservationId());
        }
    }
}