package com.parkandsee.backend.service;

import com.parkandsee.backend.entity.ReservationEntity;
import com.parkandsee.backend.entity.ReservationStatus;
import com.parkandsee.backend.entity.VehicleType;
import com.parkandsee.backend.repository.ReservationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OverdueControlServiceTest {

    @Mock
    private ReservationRepository reservationRepository;

    @InjectMocks
    private OverdueControlService overdueControlService;

    private ReservationEntity activeReservation;
    private ReservationEntity overdueReservation;
    private ReservationEntity completedReservation;

    @BeforeEach
    void setUp() {
        LocalDateTime now = LocalDateTime.now();
        
        // Réservation active non expirée
        activeReservation = new ReservationEntity();
        activeReservation.setId("reservation-1");
        activeReservation.setLicencePlate("AB-123-CD");
        activeReservation.setVehicleType(VehicleType.CAR);
        activeReservation.setStartAt(now.minusMinutes(30));
        activeReservation.setDurationMinutes(60);
        activeReservation.setAddress("Place du Marché");
        activeReservation.setStatus(ReservationStatus.ACTIVE);

        // Réservation expirée
        overdueReservation = new ReservationEntity();
        overdueReservation.setId("reservation-2");
        overdueReservation.setLicencePlate("EF-456-GH");
        overdueReservation.setVehicleType(VehicleType.MOTORCYCLE);
        overdueReservation.setStartAt(now.minusMinutes(90));
        overdueReservation.setDurationMinutes(60);
        overdueReservation.setAddress("Rue de la Paix");
        overdueReservation.setStatus(ReservationStatus.ACTIVE);

        // Réservation terminée
        completedReservation = new ReservationEntity();
        completedReservation.setId("reservation-3");
        completedReservation.setLicencePlate("IJ-789-KL");
        completedReservation.setVehicleType(VehicleType.CAR);
        completedReservation.setStartAt(now.minusMinutes(120));
        completedReservation.setDurationMinutes(60);
        completedReservation.setAddress("Avenue des Champs");
        completedReservation.setStatus(ReservationStatus.COMPLETED);
    }

    @Test
    void findAllOverdueReservations_withActiveOverdueReservations_returnsOverdueOnly() {
        // Given
        when(reservationRepository.findByStatus(ReservationStatus.ACTIVE))
                .thenReturn(Arrays.asList(activeReservation, overdueReservation));

        // When
        List<ReservationEntity> result = overdueControlService.findAllOverdueReservations();

        // Then
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getId()).isEqualTo("reservation-2");
        assertThat(result.get(0).isOverdue()).isTrue();
        verify(reservationRepository).findByStatus(ReservationStatus.ACTIVE);
    }

    @Test
    void findAllOverdueReservations_withNoActiveReservations_returnsEmptyList() {
        // Given
        when(reservationRepository.findByStatus(ReservationStatus.ACTIVE))
                .thenReturn(Arrays.asList());

        // When
        List<ReservationEntity> result = overdueControlService.findAllOverdueReservations();

        // Then
        assertThat(result).isEmpty();
        verify(reservationRepository).findByStatus(ReservationStatus.ACTIVE);
    }

    @Test
    void findAllOverdueReservations_withOnlyNonOverdueReservations_returnsEmptyList() {
        // Given
        when(reservationRepository.findByStatus(ReservationStatus.ACTIVE))
                .thenReturn(Arrays.asList(activeReservation));

        // When
        List<ReservationEntity> result = overdueControlService.findAllOverdueReservations();

        // Then
        assertThat(result).isEmpty();
        verify(reservationRepository).findByStatus(ReservationStatus.ACTIVE);
    }

    @Test
    void markAsOverdue_withExistingReservation_updatesStatusAndSaves() {
        // Given
        when(reservationRepository.findById("reservation-2"))
                .thenReturn(Optional.of(overdueReservation));
        when(reservationRepository.save(any(ReservationEntity.class)))
                .thenReturn(overdueReservation);

        // When
        boolean result = overdueControlService.markAsOverdue("reservation-2");

        // Then
        assertThat(result).isTrue();
        assertThat(overdueReservation.getStatus()).isEqualTo(ReservationStatus.OVERDUE);
        verify(reservationRepository).findById("reservation-2");
        verify(reservationRepository).save(overdueReservation);
    }

    @Test
    void markAsOverdue_withNonExistingReservation_returnsFalse() {
        // Given
        when(reservationRepository.findById("nonexistent"))
                .thenReturn(Optional.empty());

        // When
        boolean result = overdueControlService.markAsOverdue("nonexistent");

        // Then
        assertThat(result).isFalse();
        verify(reservationRepository).findById("nonexistent");
        verify(reservationRepository, never()).save(any(ReservationEntity.class));
    }

    @Test
    void getOverdueStats_withMixedReservations_returnsCorrectCounts() {
        // Given
        when(reservationRepository.findByStatus(ReservationStatus.ACTIVE))
                .thenReturn(Arrays.asList(activeReservation, overdueReservation));
        when(reservationRepository.findByStatus(ReservationStatus.OVERDUE))
                .thenReturn(Arrays.asList(completedReservation));

        // When
        Map<String, Object> stats = overdueControlService.getOverdueStats();

        // Then
        assertThat(stats).containsEntry("totalActive", 2);
        assertThat(stats).containsEntry("currentOverdue", 1);
        assertThat(stats).containsEntry("markedOverdue", 1);
        assertThat(stats).containsKey("timestamp");
        
        verify(reservationRepository).findByStatus(ReservationStatus.ACTIVE);
        verify(reservationRepository).findByStatus(ReservationStatus.OVERDUE);
    }

    @Test
    void getOverdueStats_withNoReservations_returnsZeroCounts() {
        // Given
        when(reservationRepository.findByStatus(ReservationStatus.ACTIVE))
                .thenReturn(Arrays.asList());
        when(reservationRepository.findByStatus(ReservationStatus.OVERDUE))
                .thenReturn(Arrays.asList());

        // When
        Map<String, Object> stats = overdueControlService.getOverdueStats();

        // Then
        assertThat(stats).containsEntry("totalActive", 0);
        assertThat(stats).containsEntry("currentOverdue", 0);
        assertThat(stats).containsEntry("markedOverdue", 0);
        assertThat(stats).containsKey("timestamp");
    }
}