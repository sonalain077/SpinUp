package com.parkandsee.backend.service;

import com.parkandsee.backend.dto.ParkingOccupancyDTO;
import com.parkandsee.backend.entity.ParkingEntity;
import com.parkandsee.backend.entity.ReservationEntity;
import com.parkandsee.backend.entity.ReservationStatus;
import com.parkandsee.backend.repository.ParkingRepository;
import com.parkandsee.backend.repository.ReservationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Service pour gérer l'occupation des parkings
 */
@Service
@RequiredArgsConstructor
public class ParkingOccupancyService {
    
    private final ParkingRepository parkingRepository;
    private final ReservationRepository reservationRepository;
    
    /**
     * Récupère l'occupation en temps réel de tous les parkings
     */
    public List<ParkingOccupancyDTO> getAllParkingOccupancy() {
        List<ParkingEntity> parkings = parkingRepository.findAll();
        List<ReservationEntity> activeReservations = 
            reservationRepository.findByStatus(ReservationStatus.ACTIVE);
        
        // Grouper les réservations par adresse (parking)
        Map<String, List<ReservationEntity>> reservationsByParking = 
            activeReservations.stream()
                .collect(Collectors.groupingBy(ReservationEntity::getAddress));
        
        return parkings.stream()
                .map(parking -> {
                    List<ReservationEntity> parkingReservations = 
                        reservationsByParking.getOrDefault(parking.getAddress(), List.of());
                    
                    int occupiedSpots = parkingReservations.size();
                    int availableSpots = parking.getTotalSpots() - occupiedSpots;
                    double occupancyRate = parking.getTotalSpots() > 0 
                        ? (occupiedSpots * 100.0) / parking.getTotalSpots() 
                        : 0.0;
                    
                    // Compter les véhicules en retard dans ce parking
                    int overdueCount = (int) parkingReservations.stream()
                        .filter(this::isOverdue)
                        .count();
                    
                    return new ParkingOccupancyDTO(
                        parking.getId(),
                        parking.getName(),
                        parking.getAddress(),
                        parking.getTotalSpots(),
                        occupiedSpots,
                        availableSpots,
                        occupancyRate,
                        overdueCount
                    );
                })
                .collect(Collectors.toList());
    }
    
    /**
     * Vérifie si une réservation est en retard
     */
    private boolean isOverdue(ReservationEntity reservation) {
        LocalDateTime endTime = reservation.getStartAt()
            .plusMinutes(reservation.getDurationMinutes());
        return LocalDateTime.now().isAfter(endTime);
    }
}
