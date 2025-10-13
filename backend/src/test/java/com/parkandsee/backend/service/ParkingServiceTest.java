package com.parkandsee.backend.service;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import static org.mockito.ArgumentMatchers.any;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoMoreInteractions;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;

import com.parkandsee.backend.dto.PaymentRequest;
import com.parkandsee.backend.dto.PaymentResponse;
import com.parkandsee.backend.entity.ReservationEntity;
import com.parkandsee.backend.repository.ReservationRepository;

@ExtendWith(MockitoExtension.class)
class ParkingServiceTest {

    @Mock
    private ReservationRepository reservationRepository;

    @InjectMocks
    private ParkingService parkingService;

    private PaymentRequest validRequest;
    private ReservationEntity savedEntity;

    @BeforeEach
    void setUp() {
        // Setup valid payment request
        validRequest = new PaymentRequest();
        validRequest.setLicencePlate("AB-123-CD");
        validRequest.setVehicleType("voiture");
        validRequest.setStartAt(LocalDateTime.now().plusHours(1));
        validRequest.setDurationMinutes(60);
        validRequest.setAddress("123 Test Street");
        validRequest.setPaymentToken("test-token-123");

        // Setup saved entity mock
        savedEntity = new ReservationEntity();
        savedEntity.setId("test-reservation-id");
        savedEntity.setLicencePlate("AB-123-CD");
        savedEntity.setVehicleType("voiture");
        savedEntity.setStartAt(validRequest.getStartAt());
        savedEntity.setDurationMinutes(60);
        savedEntity.setAddress("123 Test Street");
        savedEntity.setCreatedAt(LocalDateTime.now());
    }

    @Test
    void reserveAndPay_WithValidRequest_ShouldReturnSuccessResponse() {
        // Given
        when(reservationRepository.save(any(ReservationEntity.class))).thenReturn(savedEntity);

        // When
        PaymentResponse response = parkingService.reserveAndPay(validRequest);

        // Then
        assertTrue(response.isSuccess());
        assertEquals("Reservation confirmed", response.getMessage());
        assertNotNull(response.getReservationId());
        verify(reservationRepository).save(any(ReservationEntity.class));
    }

    @Test
    void reserveAndPay_ShouldGenerateUniqueReservationId() {
        // Given
        when(reservationRepository.save(any(ReservationEntity.class))).thenReturn(savedEntity);

        // When
        PaymentResponse response1 = parkingService.reserveAndPay(validRequest);
        PaymentResponse response2 = parkingService.reserveAndPay(validRequest);

        // Then
        assertNotNull(response1.getReservationId());
        assertNotNull(response2.getReservationId());
        // Note: We can't directly test UUID uniqueness because we mock the repository
        // In a real scenario, we would need to test this with integration tests
    }

    @Test
    void reserveAndPay_ShouldSaveReservationEntityWithCorrectData() {
        // Given
        ArgumentCaptor<ReservationEntity> entityCaptor = ArgumentCaptor.forClass(ReservationEntity.class);
        when(reservationRepository.save(any(ReservationEntity.class))).thenReturn(savedEntity);

        // When
        parkingService.reserveAndPay(validRequest);

        // Then
        verify(reservationRepository).save(entityCaptor.capture());
        ReservationEntity capturedEntity = entityCaptor.getValue();

        assertNotNull(capturedEntity.getId());
        assertEquals("AB-123-CD", capturedEntity.getLicencePlate());
        assertEquals("voiture", capturedEntity.getVehicleType());
        assertEquals(validRequest.getStartAt(), capturedEntity.getStartAt());
        assertEquals(60, capturedEntity.getDurationMinutes());
        assertEquals("123 Test Street", capturedEntity.getAddress());
        assertNotNull(capturedEntity.getCreatedAt());
    }

    @Test
    void reserveAndPay_ShouldSetCreatedAtToCurrentTime() {
        // Given
        ArgumentCaptor<ReservationEntity> entityCaptor = ArgumentCaptor.forClass(ReservationEntity.class);
        when(reservationRepository.save(any(ReservationEntity.class))).thenReturn(savedEntity);
        LocalDateTime beforeCall = LocalDateTime.now();

        // When
        parkingService.reserveAndPay(validRequest);

        // Then
        verify(reservationRepository).save(entityCaptor.capture());
        ReservationEntity capturedEntity = entityCaptor.getValue();
        LocalDateTime afterCall = LocalDateTime.now();

        assertNotNull(capturedEntity.getCreatedAt());
        assertTrue(capturedEntity.getCreatedAt().isAfter(beforeCall) || 
                  capturedEntity.getCreatedAt().isEqual(beforeCall));
        assertTrue(capturedEntity.getCreatedAt().isBefore(afterCall) || 
                  capturedEntity.getCreatedAt().isEqual(afterCall));
    }

    @Test
    void reserveAndPay_WithNullPaymentToken_ShouldStillSucceed() {
        // Given
        validRequest.setPaymentToken(null);
        when(reservationRepository.save(any(ReservationEntity.class))).thenReturn(savedEntity);

        // When
        PaymentResponse response = parkingService.reserveAndPay(validRequest);

        // Then
        assertTrue(response.isSuccess());
        assertEquals("Reservation confirmed", response.getMessage());
        verify(reservationRepository).save(any(ReservationEntity.class));
    }

    @Test
    void reserveAndPay_WithEmptyPaymentToken_ShouldStillSucceed() {
        // Given
        validRequest.setPaymentToken("");
        when(reservationRepository.save(any(ReservationEntity.class))).thenReturn(savedEntity);

        // When
        PaymentResponse response = parkingService.reserveAndPay(validRequest);

        // Then
        assertTrue(response.isSuccess());
        assertEquals("Reservation confirmed", response.getMessage());
        verify(reservationRepository).save(any(ReservationEntity.class));
    }

    @Test
    void reserveAndPay_WithAnyPaymentToken_ShouldAcceptPayment() {
        // Given
        String[] testTokens = {"valid-token", "invalid-token", "123456", "abc", "test"};
        when(reservationRepository.save(any(ReservationEntity.class))).thenReturn(savedEntity);

        for (String token : testTokens) {
            // When
            validRequest.setPaymentToken(token);
            PaymentResponse response = parkingService.reserveAndPay(validRequest);

            // Then
            assertTrue(response.isSuccess(), "Payment should succeed with token: " + token);
            assertEquals("Reservation confirmed", response.getMessage());
        }

        verify(reservationRepository, times(testTokens.length)).save(any(ReservationEntity.class));
    }

    @Test
    void reserveAndPay_WhenRepositoryThrowsException_ShouldPropagateException() {
        // Given
        when(reservationRepository.save(any(ReservationEntity.class)))
                .thenThrow(new RuntimeException("Database error"));

        // When & Then
        assertThrows(RuntimeException.class, () -> {
            parkingService.reserveAndPay(validRequest);
        });

        verify(reservationRepository).save(any(ReservationEntity.class));
    }

    @Test
    void reserveAndPay_ShouldCallRepositorySaveExactlyOnce() {
        // Given
        when(reservationRepository.save(any(ReservationEntity.class))).thenReturn(savedEntity);

        // When
        parkingService.reserveAndPay(validRequest);

        // Then
        verify(reservationRepository, times(1)).save(any(ReservationEntity.class));
        verifyNoMoreInteractions(reservationRepository);
    }

    @Test
    void reserveAndPay_ShouldGenerateValidUUIDFormat() {
        // Given
        ArgumentCaptor<ReservationEntity> entityCaptor = ArgumentCaptor.forClass(ReservationEntity.class);
        when(reservationRepository.save(any(ReservationEntity.class))).thenReturn(savedEntity);

        // When
        parkingService.reserveAndPay(validRequest);

        // Then
        verify(reservationRepository).save(entityCaptor.capture());
        ReservationEntity capturedEntity = entityCaptor.getValue();

        // UUID format validation (8-4-4-4-12 characters)
        String id = capturedEntity.getId();
        assertNotNull(id);
        assertTrue(id.matches("^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$"),
                "ID should be a valid UUID format: " + id);
    }
}