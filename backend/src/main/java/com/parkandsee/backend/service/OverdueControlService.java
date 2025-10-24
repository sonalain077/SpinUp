package com.parkandsee.backend.service;

import com.parkandsee.backend.entity.ReservationEntity;
import com.parkandsee.backend.entity.ReservationStatus;
import com.parkandsee.backend.repository.ReservationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Service pour la gestion des excès de durée de stationnement
 * Utilisé par les agents pour contrôler les dépassements
 */
@Service
@Transactional
public class OverdueControlService {

    @Autowired
    private ReservationRepository reservationRepository;

    /**
     * Trouve toutes les réservations en excès de temps
     * @return Liste des réservations qui ont dépassé leur durée autorisée
     */
    public List<ReservationEntity> findAllOverdueReservations() {
        System.out.println("\n🔍 ===== findAllOverdueReservations() =====");
        
        List<ReservationEntity> activeReservations = reservationRepository.findByStatus(ReservationStatus.ACTIVE);
        System.out.println("📊 Total réservations ACTIVE: " + activeReservations.size());
        
        List<ReservationEntity> activeOverdue = activeReservations.stream()
                .filter(res -> {
                    boolean isOverdue = res.isOverdue();
                    if (isOverdue) {
                        System.out.println("  ✅ ACTIVE en excès: " + res.getLicencePlate() + " @ " + res.getAddress());
                    } else {
                        System.out.println("  ❌ ACTIVE OK (pas en excès): " + res.getLicencePlate());
                    }
                    return isOverdue;
                })
                .toList();
        
        System.out.println("📊 ACTIVE en excès: " + activeOverdue.size());
        
        List<ReservationEntity> signaledReservations = reservationRepository.findByStatus(ReservationStatus.SIGNALE);
        System.out.println("📊 Réservations SIGNALE: " + signaledReservations.size());
        signaledReservations.forEach(res -> 
            System.out.println("  🚨 SIGNALE: " + res.getLicencePlate() + " @ " + res.getAddress())
        );
        
        List<ReservationEntity> allOverdue = new java.util.ArrayList<>();
        allOverdue.addAll(activeOverdue);
        allOverdue.addAll(signaledReservations);
        
        System.out.println("✅ Total tickets retournés: " + allOverdue.size());
        System.out.println("=========================================\n");
        
        return allOverdue;
    }

    /**
     * Trouve TOUTES les réservations actives (ACTIVE + SIGNALE)
     * Pour le Dashboard Agent : affiche tous les véhicules présents
     * @return Liste complète des réservations actives
     */
    public List<ReservationEntity> findAllActiveReservations() {
        System.out.println("\n🔍 ========== findAllActiveReservations() ==========");
        
        List<ReservationEntity> activeReservations = reservationRepository.findByStatus(ReservationStatus.ACTIVE);
        List<ReservationEntity> signaledReservations = reservationRepository.findByStatus(ReservationStatus.SIGNALE);
        
        List<ReservationEntity> allActive = new java.util.ArrayList<>();
        allActive.addAll(activeReservations);
        allActive.addAll(signaledReservations);
        
        System.out.println("📊 ACTIVE: " + activeReservations.size());
        System.out.println("📊 SIGNALE: " + signaledReservations.size());
        System.out.println("✅ Total véhicules présents: " + allActive.size());
        
        // Afficher chaque véhicule avec son parking
        System.out.println("\n📋 Liste complète des véhicules:");
        allActive.forEach(res -> 
            System.out.println("  🚗 " + res.getLicencePlate() + " @ \"" + res.getAddress() + "\" (" + res.getStatus() + ")")
        );
        
        System.out.println("========== FIN findAllActiveReservations ==========\n");
        
        return allActive;
    }

    /**
     * Trouve les réservations en excès pour une plaque d'immatriculation
     * @param licencePlate Plaque d'immatriculation à vérifier
     * @return Liste des réservations en excès pour cette plaque
     */
    public List<ReservationEntity> findOverdueByLicencePlate(String licencePlate) {
        List<ReservationEntity> reservations = reservationRepository.findByLicencePlateAndStatus(
                licencePlate, ReservationStatus.ACTIVE);
        return reservations.stream()
                .filter(ReservationEntity::isOverdue)
                .toList();
    }

    /**
     * Marque une réservation comme étant en dépassement
     * @param reservationId ID de la réservation
     * @return La réservation mise à jour, ou null si non trouvée
     */
    public ReservationEntity markAsOverdue(String reservationId) {
        return reservationRepository.findById(reservationId)
                .map(reservation -> {
                    reservation.setStatus(ReservationStatus.OVERDUE);
                    return reservationRepository.save(reservation);
                })
                .orElse(null);
    }

    /**
     * Met à jour automatiquement le statut de toutes les réservations en excès
     * @return Nombre de réservations mises à jour
     */
    public int updateOverdueReservations() {
        List<ReservationEntity> overdueReservations = findAllOverdueReservations();
        
        for (ReservationEntity reservation : overdueReservations) {
            reservation.setStatus(ReservationStatus.OVERDUE);
            reservationRepository.save(reservation);
        }
        
        return overdueReservations.size();
    }

    /**
     * Signale une réservation comme infraction
     * @param reservationId ID de la réservation
     * @return La réservation mise à jour, ou null si non trouvée
     */
    public ReservationEntity signalInfraction(String reservationId) {
        return reservationRepository.findById(reservationId)
                .map(reservation -> {
                    reservation.setStatus(ReservationStatus.SIGNALE);
                    ReservationEntity saved = reservationRepository.save(reservation);
                    System.out.println("🚨 Infraction signalée: " + saved.getLicencePlate());
                    return saved;
                })
                .orElse(null);
    }

    /**
     * Régularise une infraction en excès (véhicule quitte le parking)
     * Change le statut vers COMPLETED (qu'il soit ACTIVE en excès ou SIGNALE)
     * @param reservationId ID de la réservation
     * @return La réservation mise à jour, ou null si non trouvée
     */
    public ReservationEntity regularizeInfraction(String reservationId) {
        return reservationRepository.findById(reservationId)
                .map(reservation -> {
                    String previousStatus = reservation.getStatus().toString();
                    reservation.setStatus(ReservationStatus.COMPLETED);
                    reservation.setUpdatedAt(LocalDateTime.now());
                    ReservationEntity saved = reservationRepository.save(reservation);
                    System.out.println("✅ Infraction régularisée: " + saved.getLicencePlate() + " (" + previousStatus + " → COMPLETED)");
                    return saved;
                })
                .orElse(null);
    }

    /**
     * Récupère l'historique des véhicules partis/régularisés
     * @return Liste des réservations COMPLETED uniquement
     */
    public List<ReservationEntity> getRegularizedHistory() {
        List<ReservationEntity> history = reservationRepository.findByStatus(ReservationStatus.COMPLETED);
        
        System.out.println("📚 Historique (véhicules partis): " + history.size() + " entrées");
        
        return history;
    }

    /**
     * Obtient les statistiques des excès de temps
     * @return Informations sur les excès actuels
     */
    public OverdueStats getOverdueStats() {
        // Récupérer toutes les réservations actives qui sont en excès (non encore signalées)
        List<ReservationEntity> activeReservations = reservationRepository.findByStatus(ReservationStatus.ACTIVE);
        System.out.println("🔍 [Stats] Total réservations ACTIVE: " + activeReservations.size());
        
        List<ReservationEntity> activeOverdue = activeReservations.stream()
                .filter(res -> {
                    boolean isOverdue = res.isOverdue();
                    if (isOverdue) {
                        System.out.println("  ⏰ ACTIVE en excès: " + res.getLicencePlate() + " @ " + res.getAddress());
                    }
                    return isOverdue;
                })
                .toList();
        long currentOverdue = activeOverdue.size();
        System.out.println("✅ [Stats] En excès maintenant (ACTIVE): " + currentOverdue);
        
        // Récupérer les réservations signalées (SIGNALE)
        List<ReservationEntity> signaledList = reservationRepository.findByStatus(ReservationStatus.SIGNALE);
        long markedOverdue = signaledList.size();
        System.out.println("✅ [Stats] Déjà signalés (SIGNALE): " + markedOverdue);
        signaledList.forEach(res -> 
            System.out.println("  🚨 SIGNALE: " + res.getLicencePlate() + " @ " + res.getAddress())
        );
        
        // Récupérer les véhicules partis (COMPLETED = stationnement terminé OU infraction régularisée)
        long regularized = reservationRepository.findByStatus(ReservationStatus.COMPLETED).size();
        System.out.println("✅ [Stats] Régularisés/Partis (COMPLETED): " + regularized);
        
        // Calculer toutes les réservations en excès (actives en excès + signalées)
        List<ReservationEntity> allOverdue = new java.util.ArrayList<>();
        allOverdue.addAll(activeOverdue);
        allOverdue.addAll(signaledList);
        System.out.println("✅ [Stats] Total en excès (ACTIVE + SIGNALE): " + allOverdue.size());
        
        // Calculer la moyenne d'excès en minutes
        double averageOverdueMinutes = allOverdue.stream()
                .mapToLong(res -> {
                    LocalDateTime endTime = res.getStartAt().plusMinutes(res.getDurationMinutes());
                    LocalDateTime now = LocalDateTime.now();
                    return java.time.Duration.between(endTime, now).toMinutes();
                })
                .average()
                .orElse(0.0);
        System.out.println("✅ [Stats] Moyenne excès: " + Math.round(averageOverdueMinutes) + " min");
        
        // Calculer la somme totale du temps d'excès en minutes
        // Formule pour chaque véhicule: (Maintenant - Heure de fin théorique)
        // Où Heure de fin théorique = Heure de début + Durée payée
        System.out.println("\n⏱️ [Stats] CALCUL TEMPS TOTAL EXCÈS:");
        long totalOverdueMinutes = allOverdue.stream()
                .mapToLong(res -> {
                    LocalDateTime endTime = res.getStartAt().plusMinutes(res.getDurationMinutes());
                    LocalDateTime now = LocalDateTime.now();
                    long minutes = java.time.Duration.between(endTime, now).toMinutes();
                    long overdueMinutes = Math.max(0, minutes);
                    System.out.println("  " + res.getLicencePlate() + ": " + overdueMinutes + " min d'excès");
                    return overdueMinutes;
                })
                .sum();
        System.out.println("✅ [Stats] SOMME TOTALE: " + totalOverdueMinutes + " minutes d'excès cumulés");
        System.out.println("=====================================");
        
        return new OverdueStats(
            activeReservations.size(),
            currentOverdue,
            markedOverdue,
            regularized,
            totalOverdueMinutes,
            Math.round(averageOverdueMinutes),
            LocalDateTime.now()
        );
    }

    /**
     * Récupère les statistiques d'occupation en temps réel
     */
    public OccupationStats getOccupationStats() {
        // Capacité totale de tous les parkings (somme des capacités individuelles)
        final int TOTAL_CAPACITY = 180; // 40+50+30+25+35
        
        // Compter uniquement les réservations présentes dans les parkings
        // ACTIVE = véhicules stationnés normalement
        // SIGNALE = véhicules en infraction signalée, toujours présents
        // COMPLETED = véhicules partis (exclus du comptage)
        long totalActive = reservationRepository.countByStatus(ReservationStatus.ACTIVE) +
                          reservationRepository.countByStatus(ReservationStatus.SIGNALE);
        
        System.out.println("📊 [Occupation] Total actif: " + totalActive + " / " + TOTAL_CAPACITY + " places");
        
        return new OccupationStats((int) totalActive, TOTAL_CAPACITY);
    }

    /**
     * Récupère les statistiques d'occupation par parking
     */
    public List<ParkingZoneStats> getOccupationByZone() {
        System.out.println("\n📊 ========== CALCUL OCCUPATION PAR ZONE ==========");
        
        // Capacités par parking (alignées avec data.sql)
        java.util.Map<String, Integer> parkingCapacities = new java.util.HashMap<>();
        parkingCapacities.put("Parking Centre Ville", 40);
        parkingCapacities.put("Parking Gare", 50);
        parkingCapacities.put("Parking République", 30);
        parkingCapacities.put("Parking Liberté", 25);
        parkingCapacities.put("Parking Mairie", 35);
        
        System.out.println("🏗️ Parkings configurés: " + parkingCapacities.keySet());
        
        // Compter uniquement les véhicules présents (ACTIVE + SIGNALE)
        // Exclut COMPLETED (partis) et OVERDUE (statut obsolète)
        List<ReservationEntity> activeReservations = reservationRepository.findByStatus(ReservationStatus.ACTIVE);
        activeReservations.addAll(reservationRepository.findByStatus(ReservationStatus.SIGNALE));
        
        System.out.println("📊 Total réservations actives (ACTIVE + SIGNALE): " + activeReservations.size());
        
        // Afficher TOUS les véhicules avec leur parking
        activeReservations.forEach(res -> 
            System.out.println("  🚗 " + res.getLicencePlate() + " @ \"" + res.getAddress() + "\" (" + res.getStatus() + ")")
        );
        
        java.util.Map<String, Long> occupationByAddress = activeReservations.stream()
            .collect(java.util.stream.Collectors.groupingBy(
                ReservationEntity::getAddress,
                java.util.stream.Collectors.counting()
            ));
        
        System.out.println("\n📍 Comptage par adresse (address field):");
        occupationByAddress.forEach((parking, count) -> 
            System.out.println("   \"" + parking + "\" : " + count + " véhicule(s)")
        );
        
        // Créer les stats pour chaque parking
        List<ParkingZoneStats> stats = parkingCapacities.entrySet().stream()
            .map(entry -> {
                String address = entry.getKey();
                int capacity = entry.getValue();
                int occupied = occupationByAddress.getOrDefault(address, 0L).intValue();
                
                System.out.println("🅿️ Création stats pour \"" + address + "\": " + occupied + "/" + capacity);
                
                return new ParkingZoneStats(address, occupied, capacity);
            })
            .sorted((a, b) -> Double.compare(b.getOccupationRate(), a.getOccupationRate()))
            .collect(java.util.stream.Collectors.toList());
        
        System.out.println("\n✅ Stats finales:");
        stats.forEach(s -> 
            System.out.println("   " + s.getParkingName() + ": " + s.getOccupiedPlaces() + "/" + s.getTotalCapacity() + " (" + s.getOccupationRate() + "%)")
        );
        System.out.println("========== FIN CALCUL OCCUPATION ==========\n");
        
        return stats;
    }

    /**
     * Récupère tous les véhicules encore présents dans un parking spécifique
     * Exclut COMPLETED (véhicules partis)
     */
    public List<ReservationEntity> findVehiclesByParking(String parkingName) {
        // Récupérer uniquement les véhicules présents (ACTIVE + SIGNALE)
        List<ReservationEntity> activeReservations = reservationRepository.findByStatus(ReservationStatus.ACTIVE);
        activeReservations.addAll(reservationRepository.findByStatus(ReservationStatus.SIGNALE));
        // Note: COMPLETED n'est PAS inclus car ces véhicules sont partis
        
        System.out.println("🔍 Recherche véhicules PRESENTS pour parking: '" + parkingName + "'");
        System.out.println("📊 Total véhicules présents (ACTIVE/OVERDUE/SIGNALE): " + activeReservations.size());
        
        List<ReservationEntity> filtered = activeReservations.stream()
            .filter(res -> {
                boolean matches = parkingName.equals(res.getAddress());
                if (!matches) {
                    System.out.println("  ❌ '" + res.getAddress() + "' != '" + parkingName + "'");
                } else {
                    System.out.println("  ✅ Match: " + res.getLicencePlate() + " @ " + res.getAddress());
                }
                return matches;
            })
            .sorted((a, b) -> a.getStartAt().compareTo(b.getStartAt()))
            .collect(java.util.stream.Collectors.toList());
        
        System.out.println("✅ Résultat: " + filtered.size() + " véhicule(s)");
        return filtered;
    }

    /**
     * Classe pour les statistiques d'occupation globale
     */
    public static class OccupationStats {
        private final int totalActive;
        private final int totalCapacity;
        private final double occupationRate;
        private final int availablePlaces;

        public OccupationStats(int totalActive, int totalCapacity) {
            this.totalActive = totalActive;
            this.totalCapacity = totalCapacity;
            this.availablePlaces = totalCapacity - totalActive;
            this.occupationRate = totalCapacity > 0 ? 
                (double) totalActive / totalCapacity * 100 : 0;
        }

        public int getTotalActive() {
            return totalActive;
        }

        public int getTotalCapacity() {
            return totalCapacity;
        }

        public double getOccupationRate() {
            return occupationRate;
        }

        public int getAvailablePlaces() {
            return availablePlaces;
        }
    }

    /**
     * Classe pour les statistiques d'occupation par zone/parking
     */
    public static class ParkingZoneStats {
        private final String parkingName;
        private final int occupiedPlaces;
        private final int totalCapacity;
        private final int availablePlaces;
        private final double occupationRate;

        public ParkingZoneStats(String parkingName, int occupiedPlaces, int totalCapacity) {
            this.parkingName = parkingName;
            this.occupiedPlaces = occupiedPlaces;
            this.totalCapacity = totalCapacity;
            this.availablePlaces = totalCapacity - occupiedPlaces;
            this.occupationRate = totalCapacity > 0 ? 
                (double) occupiedPlaces / totalCapacity * 100 : 0;
        }

        public String getParkingName() {
            return parkingName;
        }

        public int getOccupiedPlaces() {
            return occupiedPlaces;
        }

        public int getTotalCapacity() {
            return totalCapacity;
        }

        public int getAvailablePlaces() {
            return availablePlaces;
        }

        public double getOccupationRate() {
            return occupationRate;
        }
    }

    /**
     * Classe pour les statistiques des excès de temps
     */
    public static class OverdueStats {
        private final long totalActive;
        private final long currentOverdue;
        private final long markedOverdue;
        private final long regularized;
        private final long totalOverdueMinutes;
        private final long averageOverdueMinutes;
        private final LocalDateTime timestamp;

        public OverdueStats(long totalActive, long currentOverdue, long markedOverdue, 
                           long regularized, long totalOverdueMinutes, long averageOverdueMinutes,
                           LocalDateTime timestamp) {
            this.totalActive = totalActive;
            this.currentOverdue = currentOverdue;
            this.markedOverdue = markedOverdue;
            this.regularized = regularized;
            this.totalOverdueMinutes = totalOverdueMinutes;
            this.averageOverdueMinutes = averageOverdueMinutes;
            this.timestamp = timestamp;
        }

        public long getTotalActive() { return totalActive; }
        public long getCurrentOverdue() { return currentOverdue; }
        public long getMarkedOverdue() { return markedOverdue; }
        public long getRegularized() { return regularized; }
        public long getTotalOverdueMinutes() { return totalOverdueMinutes; }
        public long getAverageOverdueMinutes() { return averageOverdueMinutes; }
        public LocalDateTime getTimestamp() { return timestamp; }
    }
}