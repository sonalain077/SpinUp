package com.parkandsee.backend.repository;

import com.parkandsee.backend.entity.Parking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository pour l'entité Parking.
 */
@Repository
public interface ParkingRepository extends JpaRepository<Parking, UUID> {
    
    /**
     * Trouve un parking par son nom.
     * @param name nom du parking
     * @return Optional contenant le parking si trouvé
     */
    Optional<Parking> findByName(String name);
}
