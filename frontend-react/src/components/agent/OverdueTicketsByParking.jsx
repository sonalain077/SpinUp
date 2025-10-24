import React from 'react';
import TicketCard from './TicketCard';

/**
 * Composant Section 4: Infractions par Parking
 * Affiche les groupes de tickets d'infraction avec actions
 */
export default function OverdueTicketsByParking({ 
  overdueGroups, 
  onSignal, 
  onRegularize, 
  loading 
}) {
  if (loading) {
    return (
      <section className="infractions-section">
        <h2 className="section-title">🚨 Infractions par parking</h2>
        <div className="infractions-container">
          {[1, 2].map(i => (
            <div key={i} className="parking-group skeleton">
              <div className="skeleton-title"></div>
              <div className="skeleton-card"></div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (!overdueGroups || overdueGroups.length === 0) {
    return (
      <section className="infractions-section">
        <h2 className="section-title">🚨 Infractions par parking</h2>
        <div className="no-infractions">
          <p className="no-data">✅ Aucune infraction en cours</p>
          <p className="no-data-subtitle">Tous les véhicules sont en règle</p>
        </div>
      </section>
    );
  }

  return (
    <section className="infractions-section">
      <h2 className="section-title">🚨 Infractions par parking</h2>
      
      <div className="infractions-container">
        {overdueGroups.map(group => (
          <ParkingGroup
            key={group.parkingName}
            group={group}
            onSignal={onSignal}
            onRegularize={onRegularize}
          />
        ))}
      </div>
    </section>
  );
}

/**
 * Groupe d'infractions pour un parking
 */
function ParkingGroup({ group, onSignal, onRegularize }) {
  const { parkingName, count, tickets } = group;

  return (
    <article className="parking-group">
      {/* Header du groupe */}
      <header className="parking-group-header">
        <h3 className="parking-group-title">
          🅿️ {parkingName}
        </h3>
        <span className="infractions-badge">
          {count} {count === 1 ? 'infraction' : 'infractions'}
        </span>
      </header>

      {/* Liste des tickets */}
      <div className="tickets-list">
        {tickets.map(ticket => (
          <TicketCard
            key={ticket.id}
            ticket={ticket}
            onSignal={onSignal}
            onRegularize={onRegularize}
          />
        ))}
      </div>
    </article>
  );
}
