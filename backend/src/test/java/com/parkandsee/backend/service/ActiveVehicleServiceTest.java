package com.parkandsee.backend.service;

import com.parkandsee.backend.dto.ActiveVehicleDTO;
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

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ActiveVehicleServiceTest {

    @Mock
    private ReservationRepository reservationRepository;

    @InjectMocks
    private ActiveVehicleService activeVehicleService;

    private ReservationEntity activeReservation;
    private ReservationEntity overdueReservation;

    @BeforeEach
    void setUp() {
        // Réservation active (pas encore expirée)
        activeReservation = new ReservationEntity();
        activeReservation.setId("res-001");
        activeReservation.setLicencePlate("AB-123-CD");
        activeReservation.setVehicleType(VehicleType.CAR);
        activeReservation.setAddress("10 Rue de la République");
        activeReservation.setStartAt(LocalDateTime.now().minusMinutes(30));
        activeReservation.setDurationMinutes(60);
        activeReservation.setStatus(ReservationStatus.ACTIVE);

        // Réservation en retard
        overdueReservation = new ReservationEntity();
        overdueReservation.setId("res-002");
        overdueReservation.setLicencePlate("EF-456-GH");
        overdueReservation.setVehicleType(VehicleType.MOTORCYCLE);
        overdueReservation.setAddress("25 Avenue de la Gare");
        overdueReservation.setStartAt(LocalDateTime.now().minusMinutes(90));
        overdueReservation.setDurationMinutes(60);
        overdueReservation.setStatus(ReservationStatus.ACTIVE);
    }

    @Test
    void getAllActiveVehicles_ShouldReturnAllVehicles() {
        // Given
        when(reservationRepository.findByStatus(ReservationStatus.ACTIVE))
                .thenReturn(Arrays.asList(activeReservation, overdueReservation));

        // When
        List<ActiveVehicleDTO> result = activeVehicleService.getAllActiveVehicles();

        // Then
        assertThat(result).hasSize(2);
        assertThat(result.get(0).getLicencePlate()).isEqualTo("AB-123-CD");
        assertThat(result.get(1).getLicencePlate()).isEqualTo("EF-456-GH");
        verify(reservationRepository, times(1)).findByStatus(ReservationStatus.ACTIVE);
    }

    @Test
    void getAllActiveVehicles_ShouldCalculateCorrectStatus() {
        // Given
        when(reservationRepository.findByStatus(ReservationStatus.ACTIVE))
                .thenReturn(Arrays.asList(activeReservation, overdueReservation));

        // When
        List<ActiveVehicleDTO> result = activeVehicleService.getAllActiveVehicles();

        // Then
        assertThat(result.get(0).getStatus()).isEqualTo("ACTIVE");
        assertThat(result.get(1).getStatus()).isEqualTo("OVERDUE");
    }

    @Test
    void getOverdueVehicles_ShouldReturnOnlyOverdueVehicles() {
        // Given
        when(reservationRepository.findByStatus(ReservationStatus.ACTIVE))
                .thenReturn(Arrays.asList(activeReservation, overdueReservation));

        // When
        List<ActiveVehicleDTO> result = activeVehicleService.getOverdueVehicles();

        // Then
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getLicencePlate()).isEqualTo("EF-456-GH");
        assertThat(result.get(0).getStatus()).isEqualTo("OVERDUE");
    }

    @Test
    void getAllActiveVehicles_ShouldCalculateCorrectAmount() {
        // Given
        when(reservationRepository.findByStatus(ReservationStatus.ACTIVE))
                .thenReturn(Arrays.asList(activeReservation));

        // When
        List<ActiveVehicleDTO> result = activeVehicleService.getAllActiveVehicles();

        // Then
        assertThat(result.get(0).getAmountPaid()).isEqualTo(3.0); // 60 minutes * 0.05€
    }

    @Test
    void getAllActiveVehicles_WithEmptyList_ShouldReturnEmptyList() {
        // Given
        when(reservationRepository.findByStatus(ReservationStatus.ACTIVE))
                .thenReturn(Arrays.asList());

        // When
        List<ActiveVehicleDTO> result = activeVehicleService.getAllActiveVehicles();

        // Then
        assertThat(result).isEmpty();
        verify(reservationRepository, times(1)).findByStatus(ReservationStatus.ACTIVE);
    }

    @Test
    void getOverdueVehicles_WithNoOverdueVehicles_ShouldReturnEmptyList() {
        // Given
        when(reservationRepository.findByStatus(ReservationStatus.ACTIVE))
                .thenReturn(Arrays.asList(activeReservation));

        // When
        List<ActiveVehicleDTO> result = activeVehicleService.getOverdueVehicles();

        // Then
        assertThat(result).isEmpty();
    }
}
