import React, { useState } from 'react';
import ParkingModal from './ParkingModal';

/**
 * Composant Section 2: Grille d'Occupation par Parking
 * Affiche les cartes de chaque parking avec bouton Détails
 */
export default function OccupationGrid({ occupationByParking, loading }) {
  const [selectedParking, setSelectedParking] = useState(null);

  if (loading) {
    return (
      <section className="occupation-section">
        <h2 className="section-title">🅿️ Occupation par parking</h2>
        <div className="parking-grid">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="parking-card skeleton">
              <div className="skeleton-title"></div>
              <div className="skeleton-bar"></div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (!occupationByParking || occupationByParking.length === 0) {
    return (
      <section className="occupation-section">
        <h2 className="section-title">🅿️ Occupation par parking</h2>
        <p className="no-data">Aucun parking disponible</p>
      </section>
    );
  }

  return (
    <>
      <section className="occupation-section">
        <h2 className="section-title">🅿️ Occupation par parking</h2>
        <div className="parking-grid">
          {occupationByParking.map(parking => (
            <ParkingCard
              key={parking.name}
              parking={parking}
              onDetailsClick={() => setSelectedParking(parking)}
            />
          ))}
        </div>
      </section>

      {/* Modale de détails */}
      {selectedParking && (
        <ParkingModal
          parking={selectedParking}
          onClose={() => setSelectedParking(null)}
        />
      )}
    </>
  );
}

/**
 * Carte d'un parking individuel
 */
function ParkingCard({ parking, onDetailsClick }) {
  const { name, occupation, capacity, percentage, state, vehicles } = parking;

  return (
    <article className={`parking-card parking-card-${state}`}>
      {/* Header avec titre et puce état */}
      <div className="parking-header">
        <h3 className="parking-title">{name}</h3>
        <span 
          className={`parking-indicator parking-indicator-${state}`}
          aria-label={`État: ${getStateLabel(state)}`}
        >
          {getStateIcon(state)}
        </span>
      </div>

      {/* Occupation */}
      <div className="parking-occupation-text">
        <span className="occupation-current">{occupation}</span>
        <span className="occupation-separator"> / </span>
        <span className="occupation-capacity">{capacity}</span>
        <span className="occupation-label"> places</span>
      </div>

      {/* Barre de progression */}
      <div className="progress-bar-container">
        <div 
          className={`progress-bar progress-bar-${state}`}
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={percentage}
          aria-valuemin="0"
          aria-valuemax="100"
          aria-label={`Occupation ${percentage}%`}
        >
          {percentage >= 15 && (
            <span className="progress-label">{percentage}%</span>
          )}
        </div>
      </div>

      {/* Pied avec badge état et bouton détails */}
      <div className="parking-footer">
        <span className={`state-badge state-badge-${state}`}>
          {getStateLabel(state)}
        </span>
        <button 
          className="btn-details"
          onClick={onDetailsClick}
          aria-label={`Voir les détails du parking ${name}`}
        >
          📋 Détails ({vehicles.length})
        </button>
      </div>
    </article>
  );
}

/**
 * Utilitaires de rendu
 */
function getStateIcon(state) {
  const icons = {
    low: '🟢',
    medium: '🟠',
    high: '🔴'
  };
  return icons[state] || '⚪';
}

function getStateLabel(state) {
  const labels = {
    low: 'Disponible',
    medium: 'Modéré',
    high: 'Saturé'
  };
  return labels[state] || 'Inconnu';
}
