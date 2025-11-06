package com.parkandsee.backend.service;

import com.parkandsee.backend.dto.ParkingOccupancyDTO;
import com.parkandsee.backend.entity.ParkingEntity;
import com.parkandsee.backend.entity.ReservationEntity;
import com.parkandsee.backend.entity.ReservationStatus;
import com.parkandsee.backend.entity.VehicleType;
import com.parkandsee.backend.repository.ParkingRepository;
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
class ParkingOccupancyServiceTest {

    @Mock
    private ParkingRepository parkingRepository;

    @Mock
    private ReservationRepository reservationRepository;

    @InjectMocks
    private ParkingOccupancyService parkingOccupancyService;

    private ParkingEntity parking1;
    private ParkingEntity parking2;
    private ReservationEntity reservation1;
    private ReservationEntity reservation2;
    private ReservationEntity reservation3;

    @BeforeEach
    void setUp() {
        // Parking 1 - Centre-Ville
        parking1 = new ParkingEntity();
        parking1.setId("park-001");
        parking1.setName("Parking Centre-Ville");
        parking1.setAddress("10 Rue de la République");
        parking1.setTotalSpots(100);

        // Parking 2 - Gare Nord
        parking2 = new ParkingEntity();
        parking2.setId("park-002");
        parking2.setName("Parking Gare Nord");
        parking2.setAddress("25 Avenue de la Gare");
        parking2.setTotalSpots(150);

        // Réservations
        reservation1 = createReservation("res-001", "AB-123-CD", "10 Rue de la République", 30, 60);
        reservation2 = createReservation("res-002", "EF-456-GH", "10 Rue de la République", 90, 60);
        reservation3 = createReservation("res-003", "IJ-789-KL", "25 Avenue de la Gare", 20, 120);
    }

    private ReservationEntity createReservation(String id, String plate, String address, int minutesAgo, int duration) {
        ReservationEntity reservation = new ReservationEntity();
        reservation.setId(id);
        reservation.setLicencePlate(plate);
        reservation.setVehicleType(VehicleType.CAR);
        reservation.setAddress(address);
        reservation.setStartAt(LocalDateTime.now().minusMinutes(minutesAgo));
        reservation.setDurationMinutes(duration);
        reservation.setStatus(ReservationStatus.ACTIVE);
        return reservation;
    }

    @Test
    void getAllParkingOccupancy_ShouldReturnAllParkings() {
        // Given
        when(parkingRepository.findAll()).thenReturn(Arrays.asList(parking1, parking2));
        when(reservationRepository.findByStatus(ReservationStatus.ACTIVE))
                .thenReturn(Arrays.asList(reservation1, reservation2, reservation3));

        // When
        List<ParkingOccupancyDTO> result = parkingOccupancyService.getAllParkingOccupancy();

        // Then
        assertThat(result).hasSize(2);
        verify(parkingRepository, times(1)).findAll();
        verify(reservationRepository, times(1)).findByStatus(ReservationStatus.ACTIVE);
    }

    @Test
    void getAllParkingOccupancy_ShouldCalculateCorrectOccupancy() {
        // Given
        when(parkingRepository.findAll()).thenReturn(Arrays.asList(parking1));
        when(reservationRepository.findByStatus(ReservationStatus.ACTIVE))
                .thenReturn(Arrays.asList(reservation1, reservation2));

        // When
        List<ParkingOccupancyDTO> result = parkingOccupancyService.getAllParkingOccupancy();

        // Then
        ParkingOccupancyDTO dto = result.get(0);
        assertThat(dto.getParkingName()).isEqualTo("Parking Centre-Ville");
        assertThat(dto.getTotalSpots()).isEqualTo(100);
        assertThat(dto.getOccupiedSpots()).isEqualTo(2);
        assertThat(dto.getAvailableSpots()).isEqualTo(98);
        assertThat(dto.getOccupancyRate()).isEqualTo(2.0);
    }

    @Test
    void getAllParkingOccupancy_ShouldCountOverdueVehicles() {
        // Given
        when(parkingRepository.findAll()).thenReturn(Arrays.asList(parking1));
        when(reservationRepository.findByStatus(ReservationStatus.ACTIVE))
                .thenReturn(Arrays.asList(reservation1, reservation2)); // reservation2 is overdue

        // When
        List<ParkingOccupancyDTO> result = parkingOccupancyService.getAllParkingOccupancy();

        // Then
        assertThat(result.get(0).getOverdueCount()).isEqualTo(1);
    }

    @Test
    void getAllParkingOccupancy_WithNoParkings_ShouldReturnEmptyList() {
        // Given
        when(parkingRepository.findAll()).thenReturn(Arrays.asList());
        when(reservationRepository.findByStatus(ReservationStatus.ACTIVE))
                .thenReturn(Arrays.asList());

        // When
        List<ParkingOccupancyDTO> result = parkingOccupancyService.getAllParkingOccupancy();

        // Then
        assertThat(result).isEmpty();
    }

    @Test
    void getAllParkingOccupancy_WithNoReservations_ShouldReturnZeroOccupancy() {
        // Given
        when(parkingRepository.findAll()).thenReturn(Arrays.asList(parking1));
        when(reservationRepository.findByStatus(ReservationStatus.ACTIVE))
                .thenReturn(Arrays.asList());

        // When
        List<ParkingOccupancyDTO> result = parkingOccupancyService.getAllParkingOccupancy();

        // Then
        ParkingOccupancyDTO dto = result.get(0);
        assertThat(dto.getOccupiedSpots()).isEqualTo(0);
        assertThat(dto.getAvailableSpots()).isEqualTo(100);
        assertThat(dto.getOccupancyRate()).isEqualTo(0.0);
        assertThat(dto.getOverdueCount()).isEqualTo(0);
    }

    @Test
    void getAllParkingOccupancy_ShouldHandleFullParking() {
        // Given
        ParkingEntity smallParking = new ParkingEntity();
        smallParking.setId("park-003");
        smallParking.setName("Parking Petit");
        smallParking.setAddress("5 Rue Courte");
        smallParking.setTotalSpots(2);

        ReservationEntity res1 = createReservation("res-001", "AB-123-CD", "5 Rue Courte", 10, 60);
        ReservationEntity res2 = createReservation("res-002", "EF-456-GH", "5 Rue Courte", 15, 60);

        when(parkingRepository.findAll()).thenReturn(Arrays.asList(smallParking));
        when(reservationRepository.findByStatus(ReservationStatus.ACTIVE))
                .thenReturn(Arrays.asList(res1, res2));

        // When
        List<ParkingOccupancyDTO> result = parkingOccupancyService.getAllParkingOccupancy();

        // Then
        ParkingOccupancyDTO dto = result.get(0);
        assertThat(dto.getOccupiedSpots()).isEqualTo(2);
        assertThat(dto.getAvailableSpots()).isEqualTo(0);
        assertThat(dto.getOccupancyRate()).isEqualTo(100.0);
    }
}
