package com.parkandsee.backend.entity;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;

class ReservationEntityBusinessLogicTest {

    private Validator validator;
    private ReservationEntity reservation;

    @BeforeEach
    void setUp() {
        ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
        
        LocalDateTime now = LocalDateTime.now();
        reservation = new ReservationEntity();
        reservation.setId("test-id");
        reservation.setLicencePlate("AB-123-CD");
        reservation.setVehicleType(VehicleType.CAR);
        reservation.setStartAt(now);
        reservation.setDurationMinutes(60);
        reservation.setAddress("Place du Marché");
        reservation.setStatus(ReservationStatus.ACTIVE);
    }

    @Test
    void validReservation_passesValidation() {
        // When
        Set<ConstraintViolation<ReservationEntity>> violations = validator.validate(reservation);

        // Then
        assertThat(violations).isEmpty();
    }

    @Test
    void reservationWithNullLicencePlate_failsValidation() {
        // Given
        reservation.setLicencePlate(null);

        // When
        Set<ConstraintViolation<ReservationEntity>> violations = validator.validate(reservation);

        // Then
        assertThat(violations).hasSize(1);
        assertThat(violations.iterator().next().getMessage())
                .isEqualTo("La plaque d'immatriculation est obligatoire");
    }

    @Test
    void reservationWithInvalidLicencePlatePattern_failsValidation() {
        // Given
        reservation.setLicencePlate("INVALID");

        // When
        Set<ConstraintViolation<ReservationEntity>> violations = validator.validate(reservation);

        // Then
        assertThat(violations).hasSize(1);
        assertThat(violations.iterator().next().getMessage())
                .contains("Format de plaque invalide");
    }

    @Test
    void reservationWithNullVehicleType_failsValidation() {
        // Given
        reservation.setVehicleType(null);

        // When
        Set<ConstraintViolation<ReservationEntity>> violations = validator.validate(reservation);

        // Then
        assertThat(violations).hasSize(1);
        assertThat(violations.iterator().next().getMessage())
                .isEqualTo("Le type de véhicule est obligatoire");
    }

    @Test
    void reservationWithNullStartAt_failsValidation() {
        // Given
        reservation.setStartAt(null);

        // When
        Set<ConstraintViolation<ReservationEntity>> violations = validator.validate(reservation);

        // Then
        assertThat(violations).hasSize(1);
        assertThat(violations.iterator().next().getMessage())
                .isEqualTo("L'heure de début est obligatoire");
    }

    @Test
    void reservationWithNullDurationMinutes_failsValidation() {
        // Given
        reservation.setDurationMinutes(null);

        // When
        Set<ConstraintViolation<ReservationEntity>> violations = validator.validate(reservation);

        // Then
        assertThat(violations).hasSize(1);
        assertThat(violations.iterator().next().getMessage())
                .isEqualTo("La durée en minutes est obligatoire");
    }

    @Test
    void reservationWithNegativeDuration_failsValidation() {
        // Given
        reservation.setDurationMinutes(-10);

        // When
        Set<ConstraintViolation<ReservationEntity>> violations = validator.validate(reservation);

        // Then
        assertThat(violations).hasSize(1);
        assertThat(violations.iterator().next().getMessage())
                .isEqualTo("La durée doit être positive");
    }

    @Test
    void getEndAt_withValidStartAndDuration_returnsCorrectEndTime() {
        // Given
        LocalDateTime start = LocalDateTime.of(2024, 1, 1, 10, 0);
        reservation.setStartAt(start);
        reservation.setDurationMinutes(90);

        // When
        LocalDateTime endAt = reservation.getEndAt();

        // Then
        assertThat(endAt).isEqualTo(LocalDateTime.of(2024, 1, 1, 11, 30));
    }

    @Test
    void getEndAt_withNullStart_returnsNull() {
        // Given
        reservation.setStartAt(null);
        reservation.setDurationMinutes(60);

        // When
        LocalDateTime endAt = reservation.getEndAt();

        // Then
        assertThat(endAt).isNull();
    }

    @Test
    void getEndAt_withNullDuration_returnsNull() {
        // Given
        reservation.setStartAt(LocalDateTime.now());
        reservation.setDurationMinutes(null);

        // When
        LocalDateTime endAt = reservation.getEndAt();

        // Then
        assertThat(endAt).isNull();
    }

    @Test
    void isOverdue_withExpiredReservation_returnsTrue() {
        // Given
        LocalDateTime pastTime = LocalDateTime.now().minusMinutes(90);
        reservation.setStartAt(pastTime);
        reservation.setDurationMinutes(60);

        // When
        boolean isOverdue = reservation.isOverdue();

        // Then
        assertThat(isOverdue).isTrue();
    }

    @Test
    void isOverdue_withActiveReservation_returnsFalse() {
        // Given
        LocalDateTime recentTime = LocalDateTime.now().minusMinutes(30);
        reservation.setStartAt(recentTime);
        reservation.setDurationMinutes(60);

        // When
        boolean isOverdue = reservation.isOverdue();

        // Then
        assertThat(isOverdue).isFalse();
    }

    @Test
    void isOverdue_withNullEndAt_returnsFalse() {
        // Given
        reservation.setStartAt(null);
        reservation.setDurationMinutes(60);

        // When
        boolean isOverdue = reservation.isOverdue();

        // Then
        assertThat(isOverdue).isFalse();
    }

    @Test
    void getOverdueMinutes_withExpiredReservation_returnsCorrectOverdueTime() {
        // Given
        LocalDateTime pastTime = LocalDateTime.now().minusMinutes(90);
        reservation.setStartAt(pastTime);
        reservation.setDurationMinutes(60);

        // When
        long overdueMinutes = reservation.getOverdueMinutes();

        // Then
        assertThat(overdueMinutes).isEqualTo(30);
    }

    @Test
    void getOverdueMinutes_withActiveReservation_returnsZero() {
        // Given
        LocalDateTime recentTime = LocalDateTime.now().minusMinutes(30);
        reservation.setStartAt(recentTime);
        reservation.setDurationMinutes(60);

        // When
        long overdueMinutes = reservation.getOverdueMinutes();

        // Then
        assertThat(overdueMinutes).isEqualTo(0);
    }

    @Test
    void isActiveNow_withCurrentActiveReservation_returnsTrue() {
        // Given
        LocalDateTime recentTime = LocalDateTime.now().minusMinutes(30);
        reservation.setStartAt(recentTime);
        reservation.setDurationMinutes(60);
        reservation.setStatus(ReservationStatus.ACTIVE);

        // When
        boolean isActiveNow = reservation.isActiveNow();

        // Then
        assertThat(isActiveNow).isTrue();
    }

    @Test
    void isActiveNow_withFutureReservation_returnsFalse() {
        // Given
        LocalDateTime futureTime = LocalDateTime.now().plusMinutes(30);
        reservation.setStartAt(futureTime);
        reservation.setDurationMinutes(60);
        reservation.setStatus(ReservationStatus.ACTIVE);

        // When
        boolean isActiveNow = reservation.isActiveNow();

        // Then
        assertThat(isActiveNow).isFalse();
    }

    @Test
    void isActiveNow_withCompletedReservation_returnsFalse() {
        // Given
        LocalDateTime recentTime = LocalDateTime.now().minusMinutes(30);
        reservation.setStartAt(recentTime);
        reservation.setDurationMinutes(60);
        reservation.setStatus(ReservationStatus.COMPLETED);

        // When
        boolean isActiveNow = reservation.isActiveNow();

        // Then
        assertThat(isActiveNow).isFalse();
    }

    @Test
    void constructor_withAllParameters_setsCorrectValues() {
        // Given
        LocalDateTime startTime = LocalDateTime.now();
        
        // When
        ReservationEntity newReservation = new ReservationEntity(
            "XY-789-ZZ", VehicleType.MOTORCYCLE, startTime, 120, "Avenue de la République", 3.00
        );

        // Then
        assertThat(newReservation.getLicencePlate()).isEqualTo("XY-789-ZZ");
        assertThat(newReservation.getVehicleType()).isEqualTo(VehicleType.MOTORCYCLE);
        assertThat(newReservation.getStartAt()).isEqualTo(startTime);
        assertThat(newReservation.getDurationMinutes()).isEqualTo(120);
        assertThat(newReservation.getAddress()).isEqualTo("Avenue de la République");
    }
}