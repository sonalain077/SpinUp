package com.parkandsee.backend.repository;

import com.parkandsee.backend.entity.ReservationEntity;
import com.parkandsee.backend.entity.ReservationStatus;
import com.parkandsee.backend.entity.VehicleType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;

import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
class ReservationRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private ReservationRepository reservationRepository;

    private ReservationEntity activeReservation;
    private ReservationEntity overdueReservation;
    private ReservationEntity completedReservation;

    @BeforeEach
    void setUp() {
        LocalDateTime now = LocalDateTime.now();

        // Réservation active
        activeReservation = new ReservationEntity();
        activeReservation.setId("active-1");
        activeReservation.setLicencePlate("AB-123-CD");
        activeReservation.setVehicleType(VehicleType.CAR);
        activeReservation.setStartAt(now.minusMinutes(30));
        activeReservation.setDurationMinutes(60);
        activeReservation.setAddress("Place du Marché");
        activeReservation.setStatus(ReservationStatus.ACTIVE);

        // Réservation en excès
        overdueReservation = new ReservationEntity();
        overdueReservation.setId("overdue-1");
        overdueReservation.setLicencePlate("EF-456-GH");
        overdueReservation.setVehicleType(VehicleType.MOTORCYCLE);
        overdueReservation.setStartAt(now.minusMinutes(90));
        overdueReservation.setDurationMinutes(60);
        overdueReservation.setAddress("Rue de la Paix");
        overdueReservation.setStatus(ReservationStatus.OVERDUE);

        // Réservation terminée
        completedReservation = new ReservationEntity();
        completedReservation.setId("completed-1");
        completedReservation.setLicencePlate("AB-123-CD");
        completedReservation.setVehicleType(VehicleType.CAR);
        completedReservation.setStartAt(now.minusMinutes(120));
        completedReservation.setDurationMinutes(60);
        completedReservation.setAddress("Avenue des Champs");
        completedReservation.setStatus(ReservationStatus.COMPLETED);

        entityManager.persistAndFlush(activeReservation);
        entityManager.persistAndFlush(overdueReservation);
        entityManager.persistAndFlush(completedReservation);
    }

    @Test
    void findByStatus_withActiveStatus_returnsActiveReservationsOnly() {
        // When
        List<ReservationEntity> result = reservationRepository.findByStatus(ReservationStatus.ACTIVE);

        // Then
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getId()).isEqualTo("active-1");
        assertThat(result.get(0).getStatus()).isEqualTo(ReservationStatus.ACTIVE);
    }

    @Test
    void findByStatus_withOverdueStatus_returnsOverdueReservationsOnly() {
        // When
        List<ReservationEntity> result = reservationRepository.findByStatus(ReservationStatus.OVERDUE);

        // Then
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getId()).isEqualTo("overdue-1");
        assertThat(result.get(0).getStatus()).isEqualTo(ReservationStatus.OVERDUE);
    }

    @Test
    void findByStatus_withCompletedStatus_returnsCompletedReservationsOnly() {
        // When
        List<ReservationEntity> result = reservationRepository.findByStatus(ReservationStatus.COMPLETED);

        // Then
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getId()).isEqualTo("completed-1");
        assertThat(result.get(0).getStatus()).isEqualTo(ReservationStatus.COMPLETED);
    }

    @Test
    void findByStatus_withNonExistentStatus_returnsEmptyList() {
        // Given - Aucune réservation avec le statut CANCELLED n'existe
        
        // When
        List<ReservationEntity> result = reservationRepository.findByStatus(ReservationStatus.CANCELLED);

        // Then
        assertThat(result).isEmpty();
    }

    @Test
    void findByLicencePlateAndStatus_withExistingPlateAndStatus_returnsMatchingReservations() {
        // When
        List<ReservationEntity> result = reservationRepository
                .findByLicencePlateAndStatus("AB-123-CD", ReservationStatus.ACTIVE);

        // Then
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getId()).isEqualTo("active-1");
        assertThat(result.get(0).getLicencePlate()).isEqualTo("AB-123-CD");
        assertThat(result.get(0).getStatus()).isEqualTo(ReservationStatus.ACTIVE);
    }

    @Test
    void findByLicencePlateAndStatus_withExistingPlateButDifferentStatus_returnsEmptyList() {
        // When
        List<ReservationEntity> result = reservationRepository
                .findByLicencePlateAndStatus("AB-123-CD", ReservationStatus.OVERDUE);

        // Then
        assertThat(result).isEmpty();
    }

    @Test
    void findByLicencePlateAndStatus_withNonExistentPlate_returnsEmptyList() {
        // When
        List<ReservationEntity> result = reservationRepository
                .findByLicencePlateAndStatus("XX-999-XX", ReservationStatus.ACTIVE);

        // Then
        assertThat(result).isEmpty();
    }

    @Test
    void findByLicencePlate_withExistingPlate_returnsAllReservationsForPlate() {
        // When
        List<ReservationEntity> result = reservationRepository.findByLicencePlate("AB-123-CD");

        // Then
        assertThat(result).hasSize(2);
        assertThat(result)
                .extracting(ReservationEntity::getLicencePlate)
                .containsOnly("AB-123-CD");
        assertThat(result)
                .extracting(ReservationEntity::getStatus)
                .containsExactlyInAnyOrder(ReservationStatus.ACTIVE, ReservationStatus.COMPLETED);
    }

    @Test
    void findByLicencePlate_withNonExistentPlate_returnsEmptyList() {
        // When
        List<ReservationEntity> result = reservationRepository.findByLicencePlate("XX-999-XX");

        // Then
        assertThat(result).isEmpty();
    }

    @Test
    void findByLicencePlate_withMultipleDifferentPlates_returnsOnlyMatchingPlate() {
        // When
        List<ReservationEntity> result = reservationRepository.findByLicencePlate("EF-456-GH");

        // Then
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getLicencePlate()).isEqualTo("EF-456-GH");
        assertThat(result.get(0).getStatus()).isEqualTo(ReservationStatus.OVERDUE);
    }

    @Test
    void repository_persistsAndRetrievesCorrectData() {
        // Given
        ReservationEntity newReservation = new ReservationEntity();
        newReservation.setId("test-persist");
        newReservation.setLicencePlate("TT-888-TT");
        newReservation.setVehicleType(VehicleType.ELECTRIC_SCOOTER);
        newReservation.setStartAt(LocalDateTime.now());
        newReservation.setDurationMinutes(45);
        newReservation.setAddress("Boulevard Test");
        newReservation.setStatus(ReservationStatus.ACTIVE);

        // When
        ReservationEntity saved = reservationRepository.save(newReservation);
        ReservationEntity found = reservationRepository.findById("test-persist").orElse(null);

        // Then
        assertThat(saved).isNotNull();
        assertThat(found).isNotNull();
        assertThat(found.getLicencePlate()).isEqualTo("TT-888-TT");
        assertThat(found.getVehicleType()).isEqualTo(VehicleType.ELECTRIC_SCOOTER);
        assertThat(found.getDurationMinutes()).isEqualTo(45);
    }
}