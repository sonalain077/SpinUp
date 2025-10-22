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
     * Obtient les statistiques des excès de temps
     * @return Informations sur les excès actuels
     */
    public OverdueStats getOverdueStats() {
        // Récupérer toutes les réservations actives
        List<ReservationEntity> activeReservations = reservationRepository.findByStatus(ReservationStatus.ACTIVE);
        
        // Compter celles qui sont en dépassement
        long currentOverdue = activeReservations.stream()
                .filter(ReservationEntity::isOverdue)
                .count();
        
        // Récupérer les réservations déjà marquées comme OVERDUE
        long markedOverdue = reservationRepository.findByStatus(ReservationStatus.OVERDUE).size();
        
        return new OverdueStats(
            activeReservations.size(),
            currentOverdue,
            markedOverdue,
            LocalDateTime.now()
        );
    }

    /**
     * Classe pour les statistiques des excès de temps
     */
    public static class OverdueStats {
        private final long totalActive;
        private final long currentOverdue;
        private final long markedOverdue;
        private final LocalDateTime timestamp;

        public OverdueStats(long totalActive, long currentOverdue, long markedOverdue, LocalDateTime timestamp) {
            this.totalActive = totalActive;
            this.currentOverdue = currentOverdue;
            this.markedOverdue = markedOverdue;
            this.timestamp = timestamp;
        }

        public long getTotalActive() { return totalActive; }
        public long getCurrentOverdue() { return currentOverdue; }
        public long getMarkedOverdue() { return markedOverdue; }
        public LocalDateTime getTimestamp() { return timestamp; }
    }
}