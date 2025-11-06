package com.parkandsee.backend.repository;

import com.parkandsee.backend.entity.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository pour l'entité Vehicle.
 */
@Repository
public interface VehicleRepository extends JpaRepository<Vehicle, UUID> {
    
    /**
     * Trouve un véhicule par sa plaque d'immatriculation.
     * @param plate plaque normalisée (format XX-123-XX)
     * @return Optional contenant le véhicule si trouvé
     */
    Optional<Vehicle> findByPlate(String plate);
    
    /**
     * Vérifie si un véhicule existe avec cette plaque.
     * @param plate plaque normalisée
     * @return true si le véhicule existe
     */
    boolean existsByPlate(String plate);
}
