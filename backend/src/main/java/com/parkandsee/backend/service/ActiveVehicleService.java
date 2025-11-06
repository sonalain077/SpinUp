package com.parkandsee.backend.service;

import com.parkandsee.backend.dto.ActiveVehicleDTO;
import com.parkandsee.backend.entity.ReservationEntity;
import com.parkandsee.backend.entity.ReservationStatus;
import com.parkandsee.backend.repository.ReservationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service pour gérer les véhicules actuellement stationnés
 */
@Service
@RequiredArgsConstructor
public class ActiveVehicleService {
    
    private final ReservationRepository reservationRepository;
    private static final double PRICE_PER_MINUTE = 0.05; // 5 centimes par minute
    
    /**
     * Récupère tous les véhicules actuellement stationnés (ACTIVE)
     */
    public List<ActiveVehicleDTO> getAllActiveVehicles() {
        List<ReservationEntity> activeReservations = 
            reservationRepository.findByStatus(ReservationStatus.ACTIVE);
        
        return activeReservations.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    /**
     * Récupère uniquement les véhicules en retard
     */
    public List<ActiveVehicleDTO> getOverdueVehicles() {
        return getAllActiveVehicles().stream()
                .filter(vehicle -> "OVERDUE".equals(vehicle.getStatus()))
                .collect(Collectors.toList());
    }
    
    /**
     * Convertit une réservation en DTO avec calcul du statut
     */
    private ActiveVehicleDTO convertToDTO(ReservationEntity reservation) {
        ActiveVehicleDTO dto = new ActiveVehicleDTO();
        
        dto.setLicencePlate(reservation.getLicencePlate());
        dto.setVehicleType(reservation.getVehicleType().name());
        dto.setParkingName(reservation.getAddress()); // Utilise l'adresse comme nom du parking
        dto.setStartTime(reservation.getStartAt());
        dto.setDurationMinutes(reservation.getDurationMinutes());
        dto.setAmountPaid(reservation.getDurationMinutes() * PRICE_PER_MINUTE);
        
        // Calculer l'heure de fin prévue
        LocalDateTime endTime = reservation.getStartAt().plusMinutes(reservation.getDurationMinutes());
        dto.setEndTime(endTime);
        
        // Calculer le temps restant
        LocalDateTime now = LocalDateTime.now();
        int remainingMinutes = (int) ChronoUnit.MINUTES.between(now, endTime);
        dto.setRemainingMinutes(remainingMinutes);
        
        // Déterminer le statut
        if (remainingMinutes < 0) {
            dto.setStatus("OVERDUE");
        } else {
            dto.setStatus("ACTIVE");
        }
        
        return dto;
    }
}
