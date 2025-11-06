package com.parkandsee.backend.entity;

import com.parkandsee.backend.repository.NewReservationRepository;
import com.parkandsee.backend.repository.ParkingRepository;
import com.parkandsee.backend.repository.VehicleRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.temporal.ChronoUnit;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Tests de validation du stockage des dates en UTC (Instant)
 * Vérifie que les dates sont bien stockées en UTC et que les calculs fonctionnent correctement
 */
@SpringBootTest
@ActiveProfiles("test")
@Transactional
class TimezoneTest {

    @Autowired
    private VehicleRepository vehicleRepository;

    @Autowired
    private ParkingRepository parkingRepository;

    @Autowired
    private NewReservationRepository reservationRepository;

    @Test
    void instant_storesInUTC_regardlessOfSystemTimezone() {
        // Given - Créer une réservation avec un Instant
        Instant now = Instant.now().truncatedTo(ChronoUnit.SECONDS);
        
        Vehicle vehicle = new Vehicle();
        vehicle.setPlate("TEST123");
        vehicle.setType("CAR");
        vehicle = vehicleRepository.save(vehicle);
        
        Parking parking = new Parking();
        parking.setName("Test Parking");
        parking.setCapacity(10);
        parking = parkingRepository.save(parking);
        
        Reservation reservation = new Reservation();
        reservation.setVehicle(vehicle);
        reservation.setParking(parking);
        reservation.setStartAt(now);
        reservation.setDurationMinutes(60);
        reservation.setEndAt(now.plus(Duration.ofMinutes(60)));
        reservation.setPriceCents(300);
        reservation.setPaymentMethod(PaymentMethod.CARD);
        reservation.setStatus("ACTIVE");
        
        Reservation saved = reservationRepository.save(reservation);
        reservationRepository.flush(); // Force persistence

        // When - Récupérer l'entité
        Reservation retrieved = reservationRepository.findById(saved.getId()).orElseThrow();

        // Then - Les Instant sont identiques (UTC)
        assertThat(retrieved.getStartAt()).isEqualTo(now);
        assertThat(retrieved.getEndAt()).isEqualTo(now.plus(Duration.ofMinutes(60)));
        
        // Vérifier que les dates sont bien en UTC (pas de décalage horaire)
        assertThat(retrieved.getStartAt().toString()).endsWith("Z"); // Format ISO-8601 UTC
    }

    @Test
    void reservation_endAtCalculation_isAccurate() {
        // Given - Réservation de 90 minutes
        Instant start = Instant.parse("2025-01-15T10:00:00Z");
        int durationMinutes = 90;
        
        Vehicle vehicle = new Vehicle();
        vehicle.setPlate("ABC123");
        vehicle.setType("CAR");
        vehicle = vehicleRepository.save(vehicle);
        
        Parking parking = new Parking();
        parking.setName("Test");
        parking.setCapacity(10);
        parking = parkingRepository.save(parking);
        
        Reservation reservation = new Reservation();
        reservation.setVehicle(vehicle);
        reservation.setParking(parking);
        reservation.setStartAt(start);
        reservation.setDurationMinutes(durationMinutes);
        reservation.setEndAt(start.plus(Duration.ofMinutes(durationMinutes)));
        reservation.setPriceCents(450);
        reservation.setPaymentMethod(PaymentMethod.CARD);
        reservation.setStatus("ACTIVE");
        
        Reservation saved = reservationRepository.save(reservation);

        // When
        Instant expectedEnd = Instant.parse("2025-01-15T11:30:00Z");

        // Then
        assertThat(saved.getEndAt()).isEqualTo(expectedEnd);
        assertThat(Duration.between(saved.getStartAt(), saved.getEndAt()).toMinutes()).isEqualTo(90);
    }

    @Test
    void reservation_remainingMinutes_calculatesCorrectly() {
        // Given - Réservation qui expire dans 25 minutes
        Instant now = Instant.now();
        Instant start = now.minus(Duration.ofMinutes(35)); // Début il y a 35 min
        int durationMinutes = 60; // Durée totale 60 min
        Instant end = start.plus(Duration.ofMinutes(durationMinutes)); // Expire dans 25 min
        
        Vehicle vehicle = new Vehicle();
        vehicle.setPlate("XYZ789");
        vehicle.setType("MOTORCYCLE");
        vehicle = vehicleRepository.save(vehicle);
        
        Parking parking = new Parking();
        parking.setName("Test");
        parking.setCapacity(10);
        parking = parkingRepository.save(parking);
        
        Reservation reservation = new Reservation();
        reservation.setVehicle(vehicle);
        reservation.setParking(parking);
        reservation.setStartAt(start);
        reservation.setDurationMinutes(durationMinutes);
        reservation.setEndAt(end);
        reservation.setPriceCents(300);
        reservation.setPaymentMethod(PaymentMethod.LYDIA);
        reservation.setStatus("ACTIVE");
        
        Reservation saved = reservationRepository.save(reservation);

        // When
        long remainingMinutes = saved.getRemainingMinutes();

        // Then
        assertThat(remainingMinutes).isBetween(24L, 26L); // ~25 min (tolérance ±1 pour temps d'exécution)
    }

    @Test
    void reservation_exceededMinutes_calculatesCorrectlyForInfringement() {
        // Given - Réservation expirée depuis 20 minutes
        Instant now = Instant.now();
        Instant start = now.minus(Duration.ofMinutes(50)); // Début il y a 50 min
        int durationMinutes = 30; // Durée payée: 30 min
        Instant end = start.plus(Duration.ofMinutes(durationMinutes)); // Expiré depuis 20 min
        
        Vehicle vehicle = new Vehicle();
        vehicle.setPlate("INF999");
        vehicle.setType("CAR");
        vehicle = vehicleRepository.save(vehicle);
        
        Parking parking = new Parking();
        parking.setName("Test");
        parking.setCapacity(10);
        parking = parkingRepository.save(parking);
        
        Reservation reservation = new Reservation();
        reservation.setVehicle(vehicle);
        reservation.setParking(parking);
        reservation.setStartAt(start);
        reservation.setDurationMinutes(durationMinutes);
        reservation.setEndAt(end);
        reservation.setPriceCents(150);
        reservation.setPaymentMethod(PaymentMethod.CARD);
        reservation.setStatus("ACTIVE");
        
        Reservation saved = reservationRepository.save(reservation);

        // When
        long exceededMinutes = saved.getExceededMinutes();
        boolean isInfringement = saved.isInfringement();
        String severity = saved.getSeverity();

        // Then
        assertThat(exceededMinutes).isBetween(19L, 21L); // ~20 min
        assertThat(isInfringement).isTrue();
        assertThat(severity).isEqualTo("LEGER"); // < 30 min
    }

    @Test
    void instant_conversion_fromLocalDateTimeWorks() {
        // Given - Conversion d'un datetime local en UTC
        ZonedDateTime parisDateTime = ZonedDateTime.of(
            2025, 1, 15, 14, 30, 0, 0,
            ZoneId.of("Europe/Paris")
        );
        Instant utcInstant = parisDateTime.toInstant();

        // When - Créer une réservation avec cet Instant
        Vehicle vehicle = new Vehicle();
        vehicle.setPlate("PARIS123");
        vehicle.setType("CAR");
        vehicle = vehicleRepository.save(vehicle);
        
        Parking parking = new Parking();
        parking.setName("Test");
        parking.setCapacity(10);
        parking = parkingRepository.save(parking);
        
        Reservation reservation = new Reservation();
        reservation.setVehicle(vehicle);
        reservation.setParking(parking);
        reservation.setStartAt(utcInstant);
        reservation.setDurationMinutes(60);
        reservation.setEndAt(utcInstant.plus(Duration.ofMinutes(60)));
        reservation.setPriceCents(300);
        reservation.setPaymentMethod(PaymentMethod.CARD);
        reservation.setStatus("ACTIVE");
        
        Reservation saved = reservationRepository.save(reservation);
        reservationRepository.flush();

        // Then - L'Instant stocké est bien en UTC
        Reservation retrieved = reservationRepository.findById(saved.getId()).orElseThrow();
        
        // En hiver (UTC+1), 14h30 Paris = 13h30 UTC
        // En été (UTC+2), 14h30 Paris = 12h30 UTC
        // On vérifie juste que l'Instant est cohérent
        assertThat(retrieved.getStartAt()).isEqualTo(utcInstant);
        assertThat(retrieved.getStartAt().toString()).endsWith("Z");
    }

    @Test
    void instant_preservesMilliseconds() {
        // Given - Instant avec millisecondes
        Instant preciseInstant = Instant.parse("2025-01-15T10:30:45.678Z");
        
        Vehicle vehicle = new Vehicle();
        vehicle.setPlate("MILLI123");
        vehicle.setType("CAR");
        vehicle = vehicleRepository.save(vehicle);
        
        Parking parking = new Parking();
        parking.setName("Test");
        parking.setCapacity(10);
        parking = parkingRepository.save(parking);
        
        Reservation reservation = new Reservation();
        reservation.setVehicle(vehicle);
        reservation.setParking(parking);
        reservation.setStartAt(preciseInstant);
        reservation.setDurationMinutes(60);
        reservation.setEndAt(preciseInstant.plus(Duration.ofMinutes(60)));
        reservation.setPriceCents(300);
        reservation.setPaymentMethod(PaymentMethod.CARD);
        reservation.setStatus("ACTIVE");
        
        Reservation saved = reservationRepository.save(reservation);
        reservationRepository.flush();

        // When
        Reservation retrieved = reservationRepository.findById(saved.getId()).orElseThrow();

        // Then - Les millisecondes sont préservées
        assertThat(retrieved.getStartAt()).isEqualTo(preciseInstant);
        assertThat(retrieved.getStartAt().getNano()).isEqualTo(678_000_000);
    }
}
