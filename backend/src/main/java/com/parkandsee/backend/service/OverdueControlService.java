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
        List<ReservationEntity> activeReservations = reservationRepository.findByStatus(ReservationStatus.ACTIVE);
        return activeReservations.stream()
                .filter(ReservationEntity::isOverdue)
                .toList();
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
     * @return La réservation mise à jour
     */
    public ReservationEntity markAsOverdue(String reservationId) {
        ReservationEntity reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new RuntimeException("Réservation non trouvée: " + reservationId));
        
        if (reservation.isOverdue()) {
            reservation.setStatus(ReservationStatus.OVERDUE);
            return reservationRepository.save(reservation);
        }
        
        throw new RuntimeException("La réservation n'est pas en excès de temps");
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
     * Obtient les statistiques des excès de temps
     * @return Informations sur les excès actuels
     */
    public OverdueStats getOverdueStats() {
        List<ReservationEntity> overdueReservations = findAllOverdueReservations();
        
        long totalOverdue = overdueReservations.size();
        double averageOverdueMinutes = overdueReservations.stream()
                .mapToLong(ReservationEntity::getOverdueMinutes)
                .average()
                .orElse(0.0);
        
        return new OverdueStats(totalOverdue, averageOverdueMinutes, LocalDateTime.now());
    }

    /**
     * Classe pour les statistiques des excès de temps
     */
    public static class OverdueStats {
        private final long totalOverdueReservations;
        private final double averageOverdueMinutes;
        private final LocalDateTime calculatedAt;

        public OverdueStats(long totalOverdueReservations, double averageOverdueMinutes, LocalDateTime calculatedAt) {
            this.totalOverdueReservations = totalOverdueReservations;
            this.averageOverdueMinutes = averageOverdueMinutes;
            this.calculatedAt = calculatedAt;
        }

        public long getTotalOverdueReservations() { return totalOverdueReservations; }
        public double getAverageOverdueMinutes() { return averageOverdueMinutes; }
        public LocalDateTime getCalculatedAt() { return calculatedAt; }
    }
}