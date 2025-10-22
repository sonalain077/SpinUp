package com.parkandsee.backend.entity;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class ReservationEntityTest {

    private ReservationEntity reservationEntity;
    private LocalDateTime testDateTime;

    @BeforeEach
    void setUp() {
        reservationEntity = new ReservationEntity();
        testDateTime = LocalDateTime.of(2024, 10, 13, 14, 30, 0);
    }

    @Test
    void defaultConstructor_ShouldCreateObjectWithNullValues() {
        // Given & When
        ReservationEntity entity = new ReservationEntity();

        // Then
        assertNull(entity.getId());
        assertNull(entity.getLicencePlate());
        assertNull(entity.getVehicleType());
        assertNull(entity.getStartAt());
        assertNull(entity.getDurationMinutes());
        assertNull(entity.getAddress());
        assertNull(entity.getCreatedAt());
    }

    @Test
    void setAndGetId_ShouldWorkCorrectly() {
        // Given
        String id = "test-uuid-12345";

        // When
        reservationEntity.setId(id);

        // Then
        assertEquals(id, reservationEntity.getId());
    }

    @Test
    void setAndGetLicencePlate_ShouldWorkCorrectly() {
        // Given
        String licencePlate = "AB-123-CD";

        // When
        reservationEntity.setLicencePlate(licencePlate);

        // Then
        assertEquals(licencePlate, reservationEntity.getLicencePlate());
    }

    @Test
    void setAndGetVehicleType_ShouldWorkCorrectly() {
        // Given
        String vehicleType = "voiture";

        // When
        reservationEntity.setVehicleType(vehicleType);

        // Then
        assertEquals(vehicleType, reservationEntity.getVehicleType());
    }

    @Test
    void setAndGetStartAt_ShouldWorkCorrectly() {
        // When
        reservationEntity.setStartAt(testDateTime);

        // Then
        assertEquals(testDateTime, reservationEntity.getStartAt());
    }

    @Test
    void setAndGetDurationMinutes_ShouldWorkCorrectly() {
        // Given
        Integer duration = 120;

        // When
        reservationEntity.setDurationMinutes(duration);

        // Then
        assertEquals(duration, reservationEntity.getDurationMinutes());
    }

    @Test
    void setAndGetAddress_ShouldWorkCorrectly() {
        // Given
        String address = "123 Test Street, Test City";

        // When
        reservationEntity.setAddress(address);

        // Then
        assertEquals(address, reservationEntity.getAddress());
    }

    @Test
    void setAndGetCreatedAt_ShouldWorkCorrectly() {
        // When
        reservationEntity.setCreatedAt(testDateTime);

        // Then
        assertEquals(testDateTime, reservationEntity.getCreatedAt());
    }

    @Test
    void reservationEntity_ShouldHandleAllFieldsTogether() {
        // Given
        String id = "complete-test-id";
        String licencePlate = "XY-789-ZW";
        String vehicleType = "moto";
        LocalDateTime startAt = LocalDateTime.now().plusHours(2);
        Integer duration = 180;
        String address = "456 Complete Street";
        LocalDateTime createdAt = LocalDateTime.now();

        // When
        reservationEntity.setId(id);
        reservationEntity.setLicencePlate(licencePlate);
        reservationEntity.setVehicleType(vehicleType);
        reservationEntity.setStartAt(startAt);
        reservationEntity.setDurationMinutes(duration);
        reservationEntity.setAddress(address);
        reservationEntity.setCreatedAt(createdAt);

        // Then
        assertEquals(id, reservationEntity.getId());
        assertEquals(licencePlate, reservationEntity.getLicencePlate());
        assertEquals(vehicleType, reservationEntity.getVehicleType());
        assertEquals(startAt, reservationEntity.getStartAt());
        assertEquals(duration, reservationEntity.getDurationMinutes());
        assertEquals(address, reservationEntity.getAddress());
        assertEquals(createdAt, reservationEntity.getCreatedAt());
    }

    @Test
    void setId_ShouldAcceptUUIDFormats() {
        // Given
        String[] uuids = {
            "123e4567-e89b-12d3-a456-426614174000",
            "simple-id",
            "12345",
            "res-2024-001"
        };

        for (String uuid : uuids) {
            // When
            reservationEntity.setId(uuid);

            // Then
            assertEquals(uuid, reservationEntity.getId());
        }
    }

    @Test
    void setLicencePlate_ShouldAcceptDifferentFormats() {
        // Given
        String[] plates = {
            "AB-123-CD",
            "12-ABC-34",
            "TEST001",
            "A1B2C3",
            "FR-123-AB"
        };

        for (String plate : plates) {
            // When
            reservationEntity.setLicencePlate(plate);

            // Then
            assertEquals(plate, reservationEntity.getLicencePlate());
        }
    }

    @Test
    void setVehicleType_ShouldAcceptDifferentTypes() {
        // Given
        String[] types = {
            "voiture",
            "moto",
            "camion",
            "vélo électrique",
            "scooter",
            "bus"
        };

        for (String type : types) {
            // When
            reservationEntity.setVehicleType(type);

            // Then
            assertEquals(type, reservationEntity.getVehicleType());
        }
    }

    @Test
    void setDurationMinutes_ShouldAcceptVariousDurations() {
        // Given
        Integer[] durations = {15, 30, 60, 120, 240, 480, 1440, 2880};

        for (Integer duration : durations) {
            // When
            reservationEntity.setDurationMinutes(duration);

            // Then
            assertEquals(duration, reservationEntity.getDurationMinutes());
        }
    }

    @Test
    void setAddress_ShouldAcceptLongAddresses() {
        // Given
        String longAddress = "123 Very Long Street Name That Includes Multiple Words " +
                           "And Might Even Include Apartment Numbers, Building Names, " +
                           "City Names, Postal Codes, and Country Information";

        // When
        reservationEntity.setAddress(longAddress);

        // Then
        assertEquals(longAddress, reservationEntity.getAddress());
    }

    @Test
    void setAddress_ShouldAcceptSpecialCharacters() {
        // Given
        String specialAddress = "123 Rue de l'Étoile, Bâtiment A, 75008 Paris, France";

        // When
        reservationEntity.setAddress(specialAddress);

        // Then
        assertEquals(specialAddress, reservationEntity.getAddress());
    }

    @Test
    void setStartAt_ShouldAcceptFutureDates() {
        // Given
        LocalDateTime[] futureDates = {
            LocalDateTime.now().plusMinutes(30),
            LocalDateTime.now().plusHours(2),
            LocalDateTime.now().plusDays(1),
            LocalDateTime.now().plusWeeks(1),
            LocalDateTime.now().plusMonths(1)
        };

        for (LocalDateTime date : futureDates) {
            // When
            reservationEntity.setStartAt(date);

            // Then
            assertEquals(date, reservationEntity.getStartAt());
        }
    }

    @Test
    void setCreatedAt_ShouldAcceptPastAndCurrentDates() {
        // Given
        LocalDateTime[] dates = {
            LocalDateTime.now(),
            LocalDateTime.now().minusMinutes(5),
            LocalDateTime.now().minusHours(1),
            LocalDateTime.now().minusDays(1)
        };

        for (LocalDateTime date : dates) {
            // When
            reservationEntity.setCreatedAt(date);

            // Then
            assertEquals(date, reservationEntity.getCreatedAt());
        }
    }

    @Test
    void reservationEntity_ShouldAllowNullValues() {
        // When
        reservationEntity.setId(null);
        reservationEntity.setLicencePlate(null);
        reservationEntity.setVehicleType(null);
        reservationEntity.setStartAt(null);
        reservationEntity.setDurationMinutes(null);
        reservationEntity.setAddress(null);
        reservationEntity.setCreatedAt(null);

        // Then
        assertNull(reservationEntity.getId());
        assertNull(reservationEntity.getLicencePlate());
        assertNull(reservationEntity.getVehicleType());
        assertNull(reservationEntity.getStartAt());
        assertNull(reservationEntity.getDurationMinutes());
        assertNull(reservationEntity.getAddress());
        assertNull(reservationEntity.getCreatedAt());
    }

    @Test
    void reservationEntity_ShouldHandleRealisticScenario() {
        // Given - Simulate a real parking reservation
        String id = "550e8400-e29b-41d4-a716-446655440000";
        String licencePlate = "AB-123-CD";
        String vehicleType = "voiture";
        LocalDateTime startAt = LocalDateTime.of(2024, 10, 13, 16, 0, 0);
        Integer duration = 120; // 2 hours
        String address = "Place de la République, 75011 Paris";
        LocalDateTime createdAt = LocalDateTime.of(2024, 10, 13, 15, 30, 0);

        // When
        reservationEntity.setId(id);
        reservationEntity.setLicencePlate(licencePlate);
        reservationEntity.setVehicleType(vehicleType);
        reservationEntity.setStartAt(startAt);
        reservationEntity.setDurationMinutes(duration);
        reservationEntity.setAddress(address);
        reservationEntity.setCreatedAt(createdAt);

        // Then - Verify all data is stored correctly
        assertEquals(id, reservationEntity.getId());
        assertEquals(licencePlate, reservationEntity.getLicencePlate());
        assertEquals(vehicleType, reservationEntity.getVehicleType());
        assertEquals(startAt, reservationEntity.getStartAt());
        assertEquals(duration, reservationEntity.getDurationMinutes());
        assertEquals(address, reservationEntity.getAddress());
        assertEquals(createdAt, reservationEntity.getCreatedAt());
    }
}