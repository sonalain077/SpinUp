package com.parkandsee.backend.service;

import com.parkandsee.backend.dto.AgentOverviewDTO;
import com.parkandsee.backend.dto.InfringementDTO;
import com.parkandsee.backend.dto.ParkedVehicleDTO;
import com.parkandsee.backend.entity.Parking;
import com.parkandsee.backend.entity.Reservation;
import com.parkandsee.backend.repository.ParkingRepository;
import com.parkandsee.backend.repository.NewReservationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service métier pour le Dashboard Agent.
 * Fournit les statistiques d'occupation et la liste des infractions.
 */
@Service
@Transactional(readOnly = true)
public class AgentDashboardService {

    private final NewReservationRepository reservationRepository;
    private final ParkingRepository parkingRepository;

    public AgentDashboardService(NewReservationRepository reservationRepository,
                                ParkingRepository parkingRepository) {
        this.reservationRepository = reservationRepository;
        this.parkingRepository = parkingRepository;
    }

    /**
     * Récupère la liste des véhicules actuellement garés.
     * Status = ACTIVE ET endAt > now (véhicules dans leur période payée).
     * 
     * @return Liste des véhicules garés avec temps restant
     */
    public List<ParkedVehicleDTO> getParkedVehicles() {
        Instant now = Instant.now();
        List<Reservation> parkedReservations = reservationRepository.findCurrentlyParkedVehicles(now);

        return parkedReservations.stream()
                .map(r -> new ParkedVehicleDTO(
                        r.getVehicle().getPlate(),
                        r.getVehicle().getType().name(),
                        r.getParking().getName(),
                        r.getStartAt(),
                        r.getEndAt(),
                        r.getRemainingMinutes()
                ))
                .collect(Collectors.toList());
    }

    /**
     * Récupère la vue d'ensemble complète pour le Dashboard Agent.
     * Contient:
     * - totals: véhicules garés, capacité totale, indice de saturation
     * - perParking: occupation par parking (requête optimisée)
     * - infringements: liste des infractions avec sévérité
     * 
     * @return Vue d'ensemble complète
     */
    public AgentOverviewDTO getOverview() {
        Instant now = Instant.now();

        // 1. Calculer les totaux
        long totalParkedVehicles = reservationRepository.countTotalParkedVehicles(now);
        List<Parking> allParkings = parkingRepository.findAll();
        int totalCapacity = allParkings.stream()
                .mapToInt(Parking::getCapacity)
                .sum();
        
        double saturationIndex = totalCapacity > 0 
                ? (double) totalParkedVehicles / totalCapacity 
                : 0.0;

        AgentOverviewDTO.TotalsDTO totals = new AgentOverviewDTO.TotalsDTO(
                totalParkedVehicles,
                totalCapacity,
                saturationIndex
        );

        // 2. Calculer l'occupation par parking (requête optimisée pour éviter N+1)
        List<AgentOverviewDTO.ParkingOccupationDTO> perParking = allParkings.stream()
                .map(parking -> {
                    long used = reservationRepository.countCurrentlyParkedInParking(
                            parking.getId(), now);
                    return new AgentOverviewDTO.ParkingOccupationDTO(
                            parking.getId(),
                            parking.getName(),
                            used,
                            parking.getCapacity()
                    );
                })
                .collect(Collectors.toList());

        // 3. Récupérer les infractions (véhicules en dépassement)
        List<Reservation> infringementReservations = reservationRepository.findInfringements(now);
        List<InfringementDTO> infringements = infringementReservations.stream()
                .map(r -> new InfringementDTO(
                        r.getVehicle().getPlate(),
                        r.getVehicle().getType().name(),
                        r.getParking().getName(),
                        r.getDurationMinutes(),
                        r.getStartAt(),
                        r.getEndAt(),
                        r.getExceededMinutes(),
                        r.getSeverity()
                ))
                .collect(Collectors.toList());

        return new AgentOverviewDTO(totals, perParking, infringements);
    }
}
