package com.parkandsee.backend.service;

import com.parkandsee.backend.dto.AgentOverviewDTO;
import com.parkandsee.backend.dto.ParkingInfringementsDTO;
import com.parkandsee.backend.dto.ParkingStatsDTO;
import com.parkandsee.backend.dto.RegularizedHistoryDTO;
import com.parkandsee.backend.dto.VehicleDetailDTO;
import com.parkandsee.backend.entity.ParkingEntity;
import com.parkandsee.backend.entity.ReservationEntity;
import com.parkandsee.backend.entity.ReservationStatus;
import com.parkandsee.backend.repository.ParkingRepository;
import com.parkandsee.backend.repository.ReservationRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AgentService {

    private final ReservationRepository reservationRepository;
    private final ParkingRepository parkingRepository;

    public AgentService(ReservationRepository reservationRepository, ParkingRepository parkingRepository) {
        this.reservationRepository = reservationRepository;
        this.parkingRepository = parkingRepository;
    }

    /**
     * Calcule la vue d'ensemble pour le dashboard agent
     */
    public AgentOverviewDTO calculateOverview() {
        Instant now = Instant.now();
        LocalDateTime nowLocal = LocalDateTime.now();
        
        // Récupérer TOUS les parkings de la BDD
        List<ParkingEntity> allParkings = parkingRepository.findAll();
        List<ReservationEntity> allReservations = reservationRepository.findAll();
        
        // Filtrer les véhicules ACTUELLEMENT garés (ACTIVE, n'ont PAS dépassé)
        List<ReservationEntity> parkedVehicles = allReservations.stream()
            .filter(r -> r.getStatus() == ReservationStatus.ACTIVE)
            .filter(r -> {
                LocalDateTime endAt = r.getEndAt();
                return endAt != null && endAt.isAfter(nowLocal);
            })
            .collect(Collectors.toList());
        
        // Filtrer les véhicules EN EXCÈS (ACTIVE et endAt < now)
        List<ReservationEntity> exceededVehicles = allReservations.stream()
            .filter(r -> r.getStatus() == ReservationStatus.ACTIVE)
            .filter(r -> {
                LocalDateTime endAt = r.getEndAt();
                return endAt != null && endAt.isBefore(nowLocal);
            })
            .collect(Collectors.toList());
        
        // Calcul des totaux
        int totalCapacity = allParkings.stream()
            .mapToInt(ParkingEntity::getTotalSpots)
            .sum();
        
        // TOUS les véhicules actifs = garés en règle + en excès
        int totalParked = parkedVehicles.size() + exceededVehicles.size();
        double saturationIndex = totalCapacity > 0 ? (double) totalParked / totalCapacity : 0.0;
        
        AgentOverviewDTO.TotalsDTO totals = new AgentOverviewDTO.TotalsDTO(
            totalParked, totalCapacity, saturationIndex
        );
        
        // Statistiques par parking
        List<ParkingStatsDTO> perParking = calculateParkingStats(allParkings, allReservations, nowLocal);
        
        // Parking le plus rempli
        AgentOverviewDTO.MostFilledDTO mostFilled = perParking.stream()
            .max(Comparator.comparingDouble(ParkingStatsDTO::getFillPercent))
            .map(p -> new AgentOverviewDTO.MostFilledDTO(
                p.getParkingId(), p.getParkingName(), p.getUsed(), 
                p.getCapacity(), p.getFillPercent()
            ))
            .orElse(new AgentOverviewDTO.MostFilledDTO(
                null, "Aucun parking", 0, 0, 0.0
            ));
        
        // Indice de répartition (écart-type des ratios d'occupation)
        AgentOverviewDTO.DistributionDTO distribution = calculateDistribution(perParking);
        
        // Statistiques sur les excès
        AgentOverviewDTO.OverstayStatsDTO overstayStats = calculateOverstayStats(
            allReservations, exceededVehicles, nowLocal
        );
        
        return new AgentOverviewDTO(
            now,
            "UP",
            totals,
            mostFilled,
            distribution,
            perParking,
            overstayStats
        );
    }

    /**
     * Récupère les infractions groupées par parking
     */
    public List<ParkingInfringementsDTO> getInfringements() {
        LocalDateTime now = LocalDateTime.now();
        
        List<ReservationEntity> exceededReservations = reservationRepository.findAll().stream()
            .filter(r -> r.getStatus() == ReservationStatus.ACTIVE || r.getStatus() == ReservationStatus.SIGNALE)
            .filter(r -> {
                LocalDateTime endAt = r.getEndAt();
                return endAt != null && endAt.isBefore(now);
            })
            .collect(Collectors.toList());
        
        // Grouper par parking
        Map<String, List<ReservationEntity>> byParking = exceededReservations.stream()
            .collect(Collectors.groupingBy(ReservationEntity::getAddress));
        
        return byParking.entrySet().stream()
            .map(entry -> {
                String parkingName = entry.getKey();
                List<ParkingInfringementsDTO.InfringementItemDTO> items = entry.getValue().stream()
                    .map(r -> {
                        int exceededMinutes = calculateExceededMinutes(r, now);
                        String severity = exceededMinutes < 30 ? "LEGER" : "GRAVE";
                        
                        ParkingInfringementsDTO.InfringementItemDTO item = 
                            new ParkingInfringementsDTO.InfringementItemDTO();
                        item.setReservationId(r.getId());
                        item.setPlate(r.getLicencePlate());
                        item.setVehicleType(r.getVehicleType().name());
                        item.setPaidMinutes(r.getDurationMinutes());
                        item.setStartAt(toInstant(r.getStartAt()));
                        item.setEndAt(toInstant(r.getEndAt()));
                        item.setExceededMinutes(exceededMinutes);
                        item.setSeverity(severity);
                        item.setReported(r.getStatus() == ReservationStatus.SIGNALE);
                        item.setRegularized(r.getStatus() == ReservationStatus.COMPLETED || 
                                          r.getStatus() == ReservationStatus.REGULARISE);
                        
                        return item;
                    })
                    // Tri par exceededMinutes décroissant
                    .sorted(Comparator.comparingInt(
                        ParkingInfringementsDTO.InfringementItemDTO::getExceededMinutes
                    ).reversed())
                    .collect(Collectors.toList());
                
                return new ParkingInfringementsDTO(null, parkingName, items);
            })
            .sorted(Comparator.comparing(ParkingInfringementsDTO::getParkingName))
            .collect(Collectors.toList());
    }

    /**
     * Calcule les statistiques par parking
     */
    private List<ParkingStatsDTO> calculateParkingStats(
            List<ParkingEntity> allParkings,
            List<ReservationEntity> allReservations,
            LocalDateTime now) {
        
        // Compter les véhicules ACTIFS (en règle + en excès) par parking
        Map<String, Long> countByParking = allReservations.stream()
            .filter(r -> r.getStatus() == ReservationStatus.ACTIVE)
            .collect(Collectors.groupingBy(
                ReservationEntity::getAddress,
                Collectors.counting()
            ));
        
        // Créer les stats pour TOUS les parkings de la BDD
        return allParkings.stream()
            .map(parking -> {
                String parkingName = parking.getName();
                int capacity = parking.getTotalSpots();
                int used = countByParking.getOrDefault(parkingName, 0L).intValue();
                
                return new ParkingStatsDTO(parking.getId(), parkingName, used, capacity);
            })
            .sorted(Comparator.comparing(ParkingStatsDTO::getParkingName))
            .collect(Collectors.toList());
    }

    /**
     * Calcule l'indice de répartition (écart-type des taux d'occupation)
     */
    private AgentOverviewDTO.DistributionDTO calculateDistribution(List<ParkingStatsDTO> parkingStats) {
        if (parkingStats.isEmpty()) {
            return new AgentOverviewDTO.DistributionDTO(0.0, "Équilibrée");
        }
        
        // Calculer la moyenne des taux d'occupation
        double avgFillPercent = parkingStats.stream()
            .mapToDouble(ParkingStatsDTO::getFillPercent)
            .average()
            .orElse(0.0);
        
        // Calculer l'écart-type
        double variance = parkingStats.stream()
            .mapToDouble(p -> Math.pow(p.getFillPercent() - avgFillPercent, 2))
            .average()
            .orElse(0.0);
        
        double stddev = Math.sqrt(variance);
        double stddevPercent = stddev * 100.0; // Convertir en pourcentage
        
        // Déterminer le label
        String label;
        if (stddevPercent < 5.0) {
            label = "Très équilibrée";
        } else if (stddevPercent < 10.0) {
            label = "Équilibrée";
        } else if (stddevPercent < 15.0) {
            label = "Moyennement équilibrée";
        } else {
            label = "Déséquilibrée";
        }
        
        return new AgentOverviewDTO.DistributionDTO(stddevPercent, label);
    }

    /**
     * Calcule les statistiques sur les dépassements
     */
    private AgentOverviewDTO.OverstayStatsDTO calculateOverstayStats(
            List<ReservationEntity> allReservations,
            List<ReservationEntity> exceededVehicles,
            LocalDateTime now) {
        
        AgentOverviewDTO.OverstayStatsDTO stats = new AgentOverviewDTO.OverstayStatsDTO();
        
        // Compteurs de base
        stats.setNowExceeded(exceededVehicles.size());
        
        long alreadyReported = allReservations.stream()
            .filter(r -> r.getStatus() == ReservationStatus.SIGNALE)
            .count();
        stats.setAlreadyReported((int) alreadyReported);
        
        // Ne compter que les réservations effectivement régularisées (status REGULARISE)
        long regularized = allReservations.stream()
            .filter(r -> r.getStatus() == ReservationStatus.REGULARISE)
            .count();
        stats.setRegularized((int) regularized);
        
        // Calcul des minutes d'excès
        if (!exceededVehicles.isEmpty()) {
            int totalExcessMinutes = exceededVehicles.stream()
                .mapToInt(r -> calculateExceededMinutes(r, now))
                .sum();
            stats.setTotalExcessMinutes(totalExcessMinutes);
            stats.setAvgExcessMinutes(totalExcessMinutes / exceededVehicles.size());
        } else {
            stats.setTotalExcessMinutes(0);
            stats.setAvgExcessMinutes(0);
        }
        
        // Répartition par type de véhicule
        Map<String, Long> byType = exceededVehicles.stream()
            .collect(Collectors.groupingBy(
                r -> r.getVehicleType().name(),
                Collectors.counting()
            ));
        
        List<AgentOverviewDTO.VehicleTypeCountDTO> byTypeList = byType.entrySet().stream()
            .map(e -> new AgentOverviewDTO.VehicleTypeCountDTO(e.getKey(), e.getValue().intValue()))
            .sorted(Comparator.comparing(AgentOverviewDTO.VehicleTypeCountDTO::getCount).reversed())
            .collect(Collectors.toList());
        stats.setByType(byTypeList);
        
        // Top des zones avec le plus d'excès
        Map<String, Long> byZone = exceededVehicles.stream()
            .collect(Collectors.groupingBy(
                ReservationEntity::getAddress,
                Collectors.counting()
            ));
        
        List<AgentOverviewDTO.ZoneCountDTO> topZones = byZone.entrySet().stream()
            .map(e -> new AgentOverviewDTO.ZoneCountDTO(e.getKey(), e.getValue().intValue()))
            .sorted(Comparator.comparing(AgentOverviewDTO.ZoneCountDTO::getCount).reversed())
            .limit(3)
            .collect(Collectors.toList());
        stats.setTopExcessZones(topZones);
        
        return stats;
    }

    /**
     * Calcule le nombre de minutes d'excès
     */
    private int calculateExceededMinutes(ReservationEntity reservation, LocalDateTime now) {
        LocalDateTime endAt = reservation.getEndAt();
        if (endAt == null || !endAt.isBefore(now)) {
            return 0;
        }
        
        long minutes = ChronoUnit.MINUTES.between(endAt, now);
        return Math.max(0, (int) minutes);
    }

    /**
     * Récupère l'historique des véhicules régularisés
     * @return Liste des véhicules régularisés triée par date de régularisation (plus récent en premier)
     */
    public List<RegularizedHistoryDTO> getRegularizedHistory() {
        List<ReservationEntity> regularizedReservations = reservationRepository.findAll().stream()
            .filter(r -> r.getStatus() == ReservationStatus.REGULARISE)
            .sorted((r1, r2) -> {
                // Trier par updatedAt décroissant (plus récent en premier)
                if (r1.getUpdatedAt() == null && r2.getUpdatedAt() == null) return 0;
                if (r1.getUpdatedAt() == null) return 1;
                if (r2.getUpdatedAt() == null) return -1;
                return r2.getUpdatedAt().compareTo(r1.getUpdatedAt());
            })
            .collect(Collectors.toList());
        
        return regularizedReservations.stream().map(r -> {
            RegularizedHistoryDTO dto = new RegularizedHistoryDTO();
            dto.setReservationId(r.getId());
            dto.setLicencePlate(r.getLicencePlate());
            dto.setVehicleType(r.getVehicleType() != null ? r.getVehicleType().toString() : "UNKNOWN");
            dto.setParkingName(r.getAddress() != null ? r.getAddress() : "Inconnu");
            dto.setStartAt(toInstant(r.getStartAt()));
            dto.setEndAt(toInstant(r.getEndAt()));
            dto.setRegularizedAt(r.getUpdatedAt() != null ? toInstant(r.getUpdatedAt()) : null);
            
            // Calculer les minutes d'excès au moment de la régularisation
            if (r.getEndAt() != null && r.getUpdatedAt() != null) {
                long exceededMinutes = ChronoUnit.MINUTES.between(r.getEndAt(), r.getUpdatedAt());
                dto.setExceededMinutes((int) Math.max(0, exceededMinutes));
            } else {
                dto.setExceededMinutes(0);
            }
            
            // Durée payée en minutes
            if (r.getStartAt() != null && r.getEndAt() != null) {
                long paidMinutes = ChronoUnit.MINUTES.between(r.getStartAt(), r.getEndAt());
                dto.setPaidMinutes((int) paidMinutes);
            } else {
                dto.setPaidMinutes(0);
            }
            
            return dto;
        }).collect(Collectors.toList());
    }

    /**
     * Convertit LocalDateTime en Instant (UTC)
     */
    private Instant toInstant(LocalDateTime localDateTime) {
        if (localDateTime == null) {
            return null;
        }
        return localDateTime.atZone(ZoneId.systemDefault()).toInstant();
    }

    /**
     * Récupère les détails de tous les véhicules d'un parking spécifique
     */
    public List<VehicleDetailDTO> getVehiclesByParking(String parkingName) {
        Instant now = Instant.now();
        
        return reservationRepository.findAll().stream()
            .filter(r -> r.getStatus() == ReservationStatus.ACTIVE || r.getStatus() == ReservationStatus.SIGNALE)
            .filter(r -> r.getAddress() != null && r.getAddress().equals(parkingName))
            .map(r -> {
                Instant startInstant = toInstant(r.getStartAt());
                Instant endAt = startInstant.plus(r.getDurationMinutes(), ChronoUnit.MINUTES);
                boolean isOverdue = now.isAfter(endAt);
                Integer exceededMinutes = null;
                
                if (isOverdue) {
                    exceededMinutes = (int) ChronoUnit.MINUTES.between(endAt, now);
                }
                
                VehicleDetailDTO dto = new VehicleDetailDTO();
                dto.setReservationId(r.getId());
                dto.setLicencePlate(r.getLicencePlate());
                dto.setVehicleType(r.getVehicleType().name());
                dto.setStartAt(startInstant);
                dto.setEndAt(endAt);
                dto.setStatus(r.getStatus().name());
                dto.setDurationMinutes(r.getDurationMinutes());
                dto.setOverdue(isOverdue);
                dto.setExceededMinutes(exceededMinutes);
                
                return dto;
            })
            .sorted((a, b) -> {
                // Trier par excès d'abord (plus grave en premier), puis par heure de début
                if (a.isOverdue() && !b.isOverdue()) return -1;
                if (!a.isOverdue() && b.isOverdue()) return 1;
                if (a.isOverdue() && b.isOverdue()) {
                    return b.getExceededMinutes().compareTo(a.getExceededMinutes());
                }
                return a.getStartAt().compareTo(b.getStartAt());
            })
            .collect(Collectors.toList());
    }
}
