package com.parkandsee.backend.repository;

import com.parkandsee.backend.entity.ParkingEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repository pour l'entité Parking
 */
@Repository
public interface ParkingRepository extends JpaRepository<ParkingEntity, String> {
}
