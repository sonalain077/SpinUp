import React, { useState } from 'react';
import { 
  calculateOverdueMinutes, 
  calculateTimeRemaining, 
  formatDuration,
  getSeverity,
  getSeverityInfo
} from '../../lib/overdue';
import { getVehicleTypeIcon, getVehicleTypeLabel } from '../../lib/vehicleTypes';

/**
 * Carte de ticket d'infraction
 * Affiche les détails du véhicule avec actions contextuelles
 */
export default function TicketCard({ ticket, onSignal, onRegularize }) {
  const [processing, setProcessing] = useState(false);
  
  const overdueMinutes = calculateOverdueMinutes(ticket);
  const timeInfo = calculateTimeRemaining(ticket);
  const severity = getSeverity(overdueMinutes);
  const severityInfo = getSeverityInfo(severity);

  const startTime = new Date(ticket.startTime).toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });

  // Gestion du signalement
  const handleSignal = async () => {
    setProcessing(true);
    try {
      await onSignal(ticket.id);
    } finally {
      setProcessing(false);
    }
  };

  // Gestion de la régularisation
  const handleRegularize = async () => {
    setProcessing(true);
    try {
      await onRegularize(ticket.id);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <article 
      className={`ticket-card ticket-card-${severity}`}
      aria-label={`Ticket ${ticket.licencePlate}`}
    >
      {/* Header avec plaque et type */}
      <header className="ticket-header">
        <div className="ticket-plate">
          <span className="plate-icon">🚗</span>
          <strong className="plate-number">{ticket.licencePlate}</strong>
        </div>
        <div className="ticket-type">
          {getVehicleTypeIcon(ticket.vehicleType)} {getVehicleTypeLabel(ticket.vehicleType, true)}
        </div>
      </header>

      {/* Informations de stationnement */}
      <div className="ticket-info">
        <div className="info-row">
          <span className="info-label">⏱️ Durée payée:</span>
          <span className="info-value">{formatDuration(ticket.duration)}</span>
        </div>
        <div className="info-row">
          <span className="info-label">🕐 Début:</span>
          <span className="info-value">{startTime}</span>
        </div>
        <div className="info-row info-row-highlight">
          <span className="info-label">⚠️ Excès:</span>
          <span className="info-value info-value-danger">
            <strong>{formatDuration(overdueMinutes)}</strong>
          </span>
        </div>
      </div>

      {/* Badge de sévérité */}
      <div className="ticket-severity">
        <span className={`severity-badge severity-${severity}`}>
          {severityInfo.emoji} {severityInfo.label}
        </span>
      </div>

      {/* Actions selon le statut */}
      <footer className="ticket-actions">
        {ticket.status === 'ACTIVE' && overdueMinutes > 0 && (
          <div className="actions-group">
            <button
              className="btn-action btn-signal"
              onClick={handleSignal}
              disabled={processing}
              aria-label={`Signaler le véhicule ${ticket.licencePlate}`}
            >
              {processing ? '⏳' : '🚨'} Signaler
            </button>
            <button
              className="btn-action btn-regularize"
              onClick={handleRegularize}
              disabled={processing}
              aria-label={`Marquer comme régularisé ${ticket.licencePlate}`}
            >
              {processing ? '⏳' : '✅'} Excès régularisé
            </button>
          </div>
        )}

        {ticket.status === 'SIGNALE' && (
          <div className="actions-group">
            <div className="pending-badge">
              ⏰ En attente de régularisation
            </div>
            <button
              className="btn-action btn-regularize-now"
              onClick={handleRegularize}
              disabled={processing}
              aria-label={`Régulariser maintenant ${ticket.licencePlate}`}
            >
              {processing ? '⏳' : '✅'} Régulariser maintenant
            </button>
          </div>
        )}
      </footer>
    </article>
  );
}
