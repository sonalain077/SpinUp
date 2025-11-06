package com.parkandsee.backend.service;

import com.parkandsee.backend.dto.AgentOverviewDTO;
import com.parkandsee.backend.entity.Parking;
import com.parkandsee.backend.entity.PaymentMethod;
import com.parkandsee.backend.entity.Reservation;
import com.parkandsee.backend.entity.Vehicle;
import com.parkandsee.backend.repository.NewReservationRepository;
import com.parkandsee.backend.repository.ParkingRepository;
import com.parkandsee.backend.repository.VehicleRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Tests pour AgentDashboardService
 * Vérifie le calcul des occupations, infractions, sévérités
 */
@SpringBootTest
@ActiveProfiles("test")
@Transactional
class AgentDashboardServiceTest {

    @Autowired
    private AgentDashboardService dashboardService;

    @Autowired
    private VehicleRepository vehicleRepository;

    @Autowired
    private ParkingRepository parkingRepository;

    @Autowired
    private NewReservationRepository reservationRepository;

    private Parking testParking;

    @BeforeEach
    void setUp() {
        // Créer un parking de test
        testParking = new Parking();
        testParking.setName("Test Parking");
        testParking.setCapacity(10);
        testParking = parkingRepository.save(testParking);
    }

    @Test
    void getOverview_noReservations_returnsEmptyOverview() {
        // When
        AgentOverviewDTO overview = dashboardService.getOverview();

        // Then
        assertThat(overview.getTotals().getTotalParked()).isZero();
        assertThat(overview.getTotals().getTotalInfringements()).isZero();
        assertThat(overview.getInfringements()).isEmpty();
    }

    @Test
    void getOverview_withActiveReservation_countsCorrectly() {
        // Given - Réservation active (non expirée)
        Vehicle vehicle = createVehicle("AB123CD", "CAR");
        Instant now = Instant.now();
        Reservation activeRes = createReservation(vehicle, testParking, now, 60); // Expire dans 1h

        // When
        AgentOverviewDTO overview = dashboardService.getOverview();

        // Then
        assertThat(overview.getTotals().getTotalParked()).isEqualTo(1);
        assertThat(overview.getTotals().getTotalInfringements()).isZero();
        assertThat(overview.getInfringements()).isEmpty();
    }

    @Test
    void getOverview_withExpiredReservation_detectsInfringement() {
        // Given - Réservation expirée depuis 15 minutes
        Vehicle vehicle = createVehicle("XY789ZZ", "MOTORCYCLE");
        Instant start = Instant.now().minus(Duration.ofMinutes(45)); // Début il y a 45 min
        Reservation expiredRes = createReservation(vehicle, testParking, start, 30); // Durée 30 min → Expiré depuis 15 min

        // When
        AgentOverviewDTO overview = dashboardService.getOverview();

        // Then
        assertThat(overview.getTotals().getTotalParked()).isEqualTo(1);
        assertThat(overview.getTotals().getTotalInfringements()).isEqualTo(1);
        
        assertThat(overview.getInfringements()).hasSize(1);
        AgentOverviewDTO.InfringementDTO infringement = overview.getInfringements().get(0);
        assertThat(infringement.getPlate()).isEqualTo("XY789ZZ");
        assertThat(infringement.getExceededMinutes()).isGreaterThanOrEqualTo(14).isLessThanOrEqualTo(16); // ~15 min
        assertThat(infringement.getSeverity()).isEqualTo("LEGER"); // < 30 min
    }

    @Test
    void getOverview_withGraveInfringement_assignsCorrectSeverity() {
        // Given - Réservation expirée depuis 45 minutes (infraction grave)
        Vehicle vehicle = createVehicle("CD456EF", "CAR");
        Instant start = Instant.now().minus(Duration.ofMinutes(75)); // Début il y a 75 min
        Reservation expiredRes = createReservation(vehicle, testParking, start, 30); // Durée 30 min → Expiré depuis 45 min

        // When
        AgentOverviewDTO overview = dashboardService.getOverview();

        // Then
        assertThat(overview.getTotals().getTotalInfringements()).isEqualTo(1);
        
        AgentOverviewDTO.InfringementDTO infringement = overview.getInfringements().get(0);
        assertThat(infringement.getExceededMinutes()).isGreaterThanOrEqualTo(44).isLessThanOrEqualTo(46); // ~45 min
        assertThat(infringement.getSeverity()).isEqualTo("GRAVE"); // >= 30 min
    }

    @Test
    void getOverview_multipleReservations_calculatesCorrectly() {
        // Given
        Vehicle car1 = createVehicle("CAR1", "CAR");
        Vehicle car2 = createVehicle("CAR2", "CAR");
        Vehicle moto = createVehicle("MOTO1", "MOTORCYCLE");

        Instant now = Instant.now();
        
        // 1 active
        createReservation(car1, testParking, now, 60);
        
        // 1 infraction légère (10 min excès)
        createReservation(car2, testParking, now.minus(Duration.ofMinutes(40)), 30);
        
        // 1 infraction grave (50 min excès)
        createReservation(moto, testParking, now.minus(Duration.ofMinutes(80)), 30);

        // When
        AgentOverviewDTO overview = dashboardService.getOverview();

        // Then
        assertThat(overview.getTotals().getTotalParked()).isEqualTo(3);
        assertThat(overview.getTotals().getTotalInfringements()).isEqualTo(2);
        
        assertThat(overview.getInfringements()).hasSize(2);
        assertThat(overview.getInfringements())
            .extracting(AgentOverviewDTO.InfringementDTO::getSeverity)
            .containsExactlyInAnyOrder("LEGER", "GRAVE");
    }

    @Test
    void getOverview_perParking_groupsCorrectly() {
        // Given - 2 parkings avec réservations
        Parking parking2 = new Parking();
        parking2.setName("Parking 2");
        parking2.setCapacity(5);
        parking2 = parkingRepository.save(parking2);

        Vehicle v1 = createVehicle("V1", "CAR");
        Vehicle v2 = createVehicle("V2", "CAR");
        Vehicle v3 = createVehicle("V3", "MOTORCYCLE");

        Instant now = Instant.now();
        createReservation(v1, testParking, now, 60);
        createReservation(v2, testParking, now, 60);
        createReservation(v3, parking2, now, 60);

        // When
        AgentOverviewDTO overview = dashboardService.getOverview();

        // Then
        assertThat(overview.getPerParking()).hasSize(2);
        
        AgentOverviewDTO.ParkingOccupationDTO testParkingOcc = overview.getPerParking().stream()
            .filter(p -> p.getParkingName().equals("Test Parking"))
            .findFirst()
            .orElseThrow();
        assertThat(testParkingOcc.getCurrentlyParked()).isEqualTo(2);
        assertThat(testParkingOcc.getCapacity()).isEqualTo(10);
        
        AgentOverviewDTO.ParkingOccupationDTO parking2Occ = overview.getPerParking().stream()
            .filter(p -> p.getParkingName().equals("Parking 2"))
            .findFirst()
            .orElseThrow();
        assertThat(parking2Occ.getCurrentlyParked()).isEqualTo(1);
        assertThat(parking2Occ.getCapacity()).isEqualTo(5);
    }

    // === Helper Methods ===

    private Vehicle createVehicle(String plate, String type) {
        Vehicle vehicle = new Vehicle();
        vehicle.setPlate(Vehicle.normalizePlate(plate));
        vehicle.setType(type);
        return vehicleRepository.save(vehicle);
    }

    private Reservation createReservation(Vehicle vehicle, Parking parking, Instant startAt, int durationMinutes) {
        Reservation reservation = new Reservation();
        reservation.setVehicle(vehicle);
        reservation.setParking(parking);
        reservation.setStartAt(startAt);
        reservation.setDurationMinutes(durationMinutes);
        reservation.setEndAt(startAt.plus(Duration.ofMinutes(durationMinutes)));
        reservation.setPriceCents(150 * (int) Math.ceil(durationMinutes / 30.0));
        reservation.setPaymentMethod(PaymentMethod.CARD);
        reservation.setStatus("ACTIVE");
        return reservationRepository.save(reservation);
    }
}
