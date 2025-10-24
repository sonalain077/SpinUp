package com.parkandsee.backend.repository;

import com.parkandsee.backend.entity.ReservationEntity;
import com.parkandsee.backend.entity.ReservationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ReservationRepository extends JpaRepository<ReservationEntity, String> {
    
    /**
     * Trouve les réservations par statut
     */
    List<ReservationEntity> findByStatus(ReservationStatus status);
    
    /**
     * Compte le nombre de réservations par statut
     */
    long countByStatus(ReservationStatus status);
    
    /**
     * Trouve les réservations par plaque d'immatriculation et statut
     */
    List<ReservationEntity> findByLicencePlateAndStatus(String licencePlate, ReservationStatus status);
    
    /**
     * Trouve les réservations actives par plaque d'immatriculation
     */
    List<ReservationEntity> findByLicencePlate(String licencePlate);
}
