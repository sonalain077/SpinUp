package com.parkandsee.backend.service;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.parkandsee.backend.dto.ExtensionRequest;
import com.parkandsee.backend.dto.PaymentResponse;
import com.parkandsee.backend.entity.ReservationEntity;
import com.parkandsee.backend.entity.ReservationStatus;
import com.parkandsee.backend.entity.VehicleType;
import com.parkandsee.backend.repository.ReservationRepository;

@ExtendWith(MockitoExtension.class)
class ParkingServiceExtensionTest {

    @Mock
    private ReservationRepository reservationRepository;

    @InjectMocks
    private ParkingService parkingService;

    private ReservationEntity activeReservation;
    private ExtensionRequest extensionRequest;

    @BeforeEach
    void setUp() {
        // Setup active reservation
        activeReservation = new ReservationEntity();
        activeReservation.setId("R-12345");
        activeReservation.setLicencePlate("AB-123-CD");
        activeReservation.setVehicleType(VehicleType.CAR);
        activeReservation.setStartAt(LocalDateTime.now().minusHours(1));
        activeReservation.setDurationMinutes(120); // 2 heures
        activeReservation.setAddress("Test Parking");
        activeReservation.setPaymentAmount(3.0); // 2 heures = 3€
        activeReservation.setStatus(ReservationStatus.ACTIVE);

        // Setup extension request
        extensionRequest = new ExtensionRequest();
        extensionRequest.setReservationId("R-12345");
        extensionRequest.setLicencePlate("AB-123-CD");
        extensionRequest.setExtensionMinutes(60); // 1 heure
        extensionRequest.setPaymentToken("ext-token-123");
    }

    @Test
    void testFindActiveReservationByLicencePlate_Success() {
        // Given
        when(reservationRepository.findByLicencePlateAndStatus("AB-123-CD", ReservationStatus.ACTIVE))
            .thenReturn(Arrays.asList(activeReservation));

        // When
        Optional<ReservationEntity> result = parkingService.findActiveReservationByLicencePlate("AB-123-CD");

        // Then
        assertTrue(result.isPresent());
        assertEquals("R-12345", result.get().getId());
        assertEquals("AB-123-CD", result.get().getLicencePlate());
    }

    @Test
    void testFindActiveReservationByLicencePlate_NotFound() {
        // Given
        when(reservationRepository.findByLicencePlateAndStatus("ZZ-999-ZZ", ReservationStatus.ACTIVE))
            .thenReturn(Arrays.asList());

        // When
        Optional<ReservationEntity> result = parkingService.findActiveReservationByLicencePlate("ZZ-999-ZZ");

        // Then
        assertFalse(result.isPresent());
    }

    @Test
    void testFindActiveReservationByLicencePlate_ExpiredReservation() {
        // Given - reservation expired 1 hour ago
        ReservationEntity expiredReservation = new ReservationEntity();
        expiredReservation.setId("R-EXPIRED");
        expiredReservation.setLicencePlate("AB-123-CD");
        expiredReservation.setVehicleType(VehicleType.CAR);
        expiredReservation.setStartAt(LocalDateTime.now().minusHours(3));
        expiredReservation.setDurationMinutes(60); // 1 heure, donc finie il y a 2 heures
        expiredReservation.setStatus(ReservationStatus.ACTIVE);

        when(reservationRepository.findByLicencePlateAndStatus("AB-123-CD", ReservationStatus.ACTIVE))
            .thenReturn(Arrays.asList(expiredReservation));

        // When
        Optional<ReservationEntity> result = parkingService.findActiveReservationByLicencePlate("AB-123-CD");

        // Then
        assertFalse(result.isPresent(), "Expired reservations should not be returned");
    }

    @Test
    void testFindActiveReservationById_Success() {
        // Given
        when(reservationRepository.findById("R-12345"))
            .thenReturn(Optional.of(activeReservation));

        // When
        Optional<ReservationEntity> result = parkingService.findActiveReservationById("R-12345");

        // Then
        assertTrue(result.isPresent());
        assertEquals("R-12345", result.get().getId());
    }

    @Test
    void testFindActiveReservationById_NotFound() {
        // Given
        when(reservationRepository.findById("R-99999"))
            .thenReturn(Optional.empty());

        // When
        Optional<ReservationEntity> result = parkingService.findActiveReservationById("R-99999");

        // Then
        assertFalse(result.isPresent());
    }

    @Test
    void testFindActiveReservationById_ExpiredReservation() {
        // Given - reservation expired
        ReservationEntity expiredReservation = new ReservationEntity();
        expiredReservation.setId("R-EXPIRED");
        expiredReservation.setLicencePlate("AB-123-CD");
        expiredReservation.setVehicleType(VehicleType.CAR);
        expiredReservation.setStartAt(LocalDateTime.now().minusHours(3));
        expiredReservation.setDurationMinutes(60); // Expired 2 hours ago
        expiredReservation.setStatus(ReservationStatus.ACTIVE);

        when(reservationRepository.findById("R-EXPIRED"))
            .thenReturn(Optional.of(expiredReservation));

        // When
        Optional<ReservationEntity> result = parkingService.findActiveReservationById("R-EXPIRED");

        // Then
        assertFalse(result.isPresent(), "Expired reservations should not be returned");
    }

    @Test
    void testExtendReservation_Success() {
        // Given
        when(reservationRepository.findById("R-12345"))
            .thenReturn(Optional.of(activeReservation));
        when(reservationRepository.save(any(ReservationEntity.class)))
            .thenReturn(activeReservation);

        // When
        PaymentResponse result = parkingService.extendReservation(extensionRequest);

        // Then
        assertTrue(result.isSuccess());
        assertEquals("R-12345", result.getReservationId());
        assertEquals(3.0, result.getPaymentAmount()); // 60 min = 2 tranches de 30 min = 3.0€
        assertTrue(result.getMessage().contains("rallongé de 60 minutes"));
        
        // Verify reservation was updated
        assertEquals(180, activeReservation.getDurationMinutes()); // 120 + 60
        assertEquals(6.0, activeReservation.getPaymentAmount()); // 3.0 + 3.0
    }

    @Test
    void testExtendReservation_ReservationNotFound() {
        // Given
        when(reservationRepository.findById("R-99999"))
            .thenReturn(Optional.empty());

        extensionRequest.setReservationId("R-99999");

        // When
        PaymentResponse result = parkingService.extendReservation(extensionRequest);

        // Then
        assertFalse(result.isSuccess());
        assertTrue(result.getMessage().contains("non trouvée"));
    }

    @Test
    void testExtendReservation_IncorrectLicencePlate() {
        // Given
        when(reservationRepository.findById("R-12345"))
            .thenReturn(Optional.of(activeReservation));

        extensionRequest.setLicencePlate("ZZ-999-ZZ"); // Different from reservation

        // When
        PaymentResponse result = parkingService.extendReservation(extensionRequest);

        // Then
        assertFalse(result.isSuccess());
        assertTrue(result.getMessage().contains("immatriculation incorrecte"));
    }

    @Test
    void testExtendReservation_ExpiredReservation() {
        // Given - expired reservation
        ReservationEntity expiredReservation = new ReservationEntity();
        expiredReservation.setId("R-EXPIRED");
        expiredReservation.setLicencePlate("AB-123-CD");
        expiredReservation.setVehicleType(VehicleType.CAR);
        expiredReservation.setStartAt(LocalDateTime.now().minusHours(3));
        expiredReservation.setDurationMinutes(60); // Expired 2 hours ago
        expiredReservation.setStatus(ReservationStatus.ACTIVE);

        when(reservationRepository.findById("R-EXPIRED"))
            .thenReturn(Optional.of(expiredReservation));

        extensionRequest.setReservationId("R-EXPIRED");

        // When
        PaymentResponse result = parkingService.extendReservation(extensionRequest);

        // Then
        assertFalse(result.isSuccess());
        assertTrue(result.getMessage().contains("non trouvée ou expirée"));
    }

    @Test
    void testExtendReservation_DifferentExtensionDurations() {
        // Given
        when(reservationRepository.findById("R-12345"))
            .thenReturn(Optional.of(activeReservation));
        when(reservationRepository.save(any(ReservationEntity.class)))
            .thenReturn(activeReservation);

        // Test 30 minutes extension
        extensionRequest.setExtensionMinutes(30);
        PaymentResponse result30 = parkingService.extendReservation(extensionRequest);
        assertTrue(result30.isSuccess());
        assertEquals(1.50, result30.getPaymentAmount()); // 30 min = 1 tranche de 30 min = 1.50€

        // Reset reservation
        activeReservation.setDurationMinutes(120);
        activeReservation.setPaymentAmount(3.0);

        // Test 90 minutes extension
        extensionRequest.setExtensionMinutes(90);
        PaymentResponse result90 = parkingService.extendReservation(extensionRequest);
        assertTrue(result90.isSuccess());
        assertEquals(4.5, result90.getPaymentAmount()); // 90 min = 3 tranches de 30 min = 4.50€
    }

    @Test
    void testExtendReservation_WithoutLicencePlateVerification() {
        // Given
        when(reservationRepository.findById("R-12345"))
            .thenReturn(Optional.of(activeReservation));
        when(reservationRepository.save(any(ReservationEntity.class)))
            .thenReturn(activeReservation);

        extensionRequest.setLicencePlate(null); // No licence plate verification

        // When
        PaymentResponse result = parkingService.extendReservation(extensionRequest);

        // Then
        assertTrue(result.isSuccess());
        assertEquals("R-12345", result.getReservationId());
    }
}