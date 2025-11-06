package com.parkandsee.backend.repository;

import com.parkandsee.backend.entity.Reservation;
import com.parkandsee.backend.entity.ReservationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * Repository pour l'entité Reservation (nouvelle architecture avec Vehicle/Parking).
 */
@Repository
public interface NewReservationRepository extends JpaRepository<Reservation, UUID> {
    
    /**
     * Trouve toutes les réservations avec un statut donné.
     */
    List<Reservation> findByStatus(ReservationStatus status);
    
    /**
     * Trouve toutes les réservations actives (véhicules garés actuellement).
     * Status = ACTIVE ET endAt > now
     */
    @Query("SELECT r FROM Reservation r " +
           "WHERE r.status = 'ACTIVE' AND r.endAt > :now")
    List<Reservation> findCurrentlyParkedVehicles(@Param("now") Instant now);
    
    /**
     * Trouve toutes les réservations en infraction (dépassement de durée).
     * Status = ACTIVE ET endAt < now
     */
    @Query("SELECT r FROM Reservation r " +
           "WHERE r.status = 'ACTIVE' AND r.endAt < :now")
    List<Reservation> findInfringements(@Param("now") Instant now);
    
    /**
     * Compte le nombre de véhicules garés dans un parking spécifique.
     * Status = ACTIVE ET endAt > now
     */
    @Query("SELECT COUNT(r) FROM Reservation r " +
           "WHERE r.parking.id = :parkingId " +
           "AND r.status = 'ACTIVE' AND r.endAt > :now")
    long countCurrentlyParkedInParking(@Param("parkingId") UUID parkingId, @Param("now") Instant now);
    
    /**
     * Compte le total de véhicules garés (toutes zones).
     */
    @Query("SELECT COUNT(r) FROM Reservation r " +
           "WHERE r.status = 'ACTIVE' AND r.endAt > :now")
    long countTotalParkedVehicles(@Param("now") Instant now);
}
