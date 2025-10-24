import React, { useState, useMemo } from 'react';
import { calculateOverdueMinutes, calculateTimeRemaining, formatDuration } from '../../lib/overdue';
import { getVehicleTypeIcon, getVehicleTypeLabel } from '../../lib/vehicleTypes';

/**
 * Modale affichant les détails des véhicules dans un parking
 * Table responsive avec tri et recherche
 */
export default function ParkingModal({ parking, onClose }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('status'); // status | plate | overdue

  const { name, vehicles } = parking;

  // Filtrage et tri
  const filteredAndSorted = useMemo(() => {
    let result = [...vehicles];

    // Recherche par plaque
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(v => 
        v.licencePlate.toLowerCase().includes(term)
      );
    }

    // Tri
    result.sort((a, b) => {
      switch (sortBy) {
        case 'status':
          // Ordre: ACTIVE en excès > SIGNALE > ACTIVE normal
          const aOverdue = calculateOverdueMinutes(a);
          const bOverdue = calculateOverdueMinutes(b);
          const aInOverdue = a.status === 'ACTIVE' && aOverdue > 0;
          const bInOverdue = b.status === 'ACTIVE' && bOverdue > 0;
          
          if (aInOverdue && !bInOverdue) return -1;
          if (!aInOverdue && bInOverdue) return 1;
          if (a.status === 'SIGNALE' && b.status !== 'SIGNALE') return -1;
          if (a.status !== 'SIGNALE' && b.status === 'SIGNALE') return 1;
          return 0;

        case 'plate':
          return a.licencePlate.localeCompare(b.licencePlate);

        case 'overdue':
          return calculateOverdueMinutes(b) - calculateOverdueMinutes(a);

        default:
          return 0;
      }
    });

    return result;
  }, [vehicles, searchTerm, sortBy]);

  // Gestion du clavier (ESC pour fermer)
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div 
      className="modal-overlay" 
      onClick={onClose}
      role="dialog"
      aria-labelledby="modal-title"
      aria-modal="true"
    >
      <div 
        className="modal-content modal-parking-details"
        onClick={e => e.stopPropagation()}
      >
        {/* Header fixe */}
        <header className="modal-header">
          <h2 id="modal-title" className="modal-title">
            🅿️ {name} - Véhicules présents ({filteredAndSorted.length})
          </h2>
          <button 
            className="modal-close"
            onClick={onClose}
            aria-label="Fermer la modale"
          >
            ✕
          </button>
        </header>

        {/* Contrôles de recherche et tri */}
        <div className="modal-controls">
          <div className="search-box">
            <label htmlFor="search-plate" className="sr-only">Rechercher par plaque</label>
            <input
              id="search-plate"
              type="text"
              className="search-input"
              placeholder="🔍 Rechercher par plaque..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="sort-box">
            <label htmlFor="sort-by" className="sort-label">Trier par:</label>
            <select
              id="sort-by"
              className="sort-select"
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
            >
              <option value="status">Statut</option>
              <option value="plate">Plaque</option>
              <option value="overdue">Excès</option>
            </select>
          </div>
        </div>

        {/* Table responsive */}
        <div className="modal-body">
          {filteredAndSorted.length === 0 ? (
            <p className="no-results">Aucun véhicule trouvé</p>
          ) : (
            <div className="table-responsive">
              <table className="vehicles-table">
                <thead>
                  <tr>
                    <th>Plaque</th>
                    <th>Type</th>
                    <th>Statut</th>
                    <th>Durée payée</th>
                    <th>Temps restant / Excès</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAndSorted.map(vehicle => (
                    <VehicleRow key={vehicle.id} vehicle={vehicle} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Fermer
          </button>
        </footer>
      </div>
    </div>
  );
}

/**
 * Ligne de véhicule dans la table
 */
function VehicleRow({ vehicle }) {
  const overdueMinutes = calculateOverdueMinutes(vehicle);
  const timeInfo = calculateTimeRemaining(vehicle);

  return (
    <tr className={`vehicle-row vehicle-row-${vehicle.status.toLowerCase()}`}>
      <td className="cell-plate">
        <strong>{vehicle.licencePlate}</strong>
      </td>
      <td className="cell-type">
        {getVehicleTypeIcon(vehicle.vehicleType)} {getVehicleTypeLabel(vehicle.vehicleType, true)}
      </td>
      <td className="cell-status">
        <StatusBadge status={vehicle.status} overdueMinutes={overdueMinutes} />
      </td>
      <td className="cell-duration">
        {formatDuration(vehicle.duration)}
      </td>
      <td className="cell-time">
        <TimeDisplay timeInfo={timeInfo} overdueMinutes={overdueMinutes} />
      </td>
    </tr>
  );
}

/**
 * Badge de statut avec emoji
 */
function StatusBadge({ status, overdueMinutes }) {
  if (status === 'SIGNALE') {
    return <span className="badge badge-signale">🚨 Signalé</span>;
  }
  
  if (status === 'ACTIVE') {
    if (overdueMinutes > 0) {
      return <span className="badge badge-overdue">⏰ En excès</span>;
    }
    return <span className="badge badge-active">✅ Normal</span>;
  }

  return <span className="badge badge-default">{status}</span>;
}

/**
 * Affichage du temps restant ou excès
 */
function TimeDisplay({ timeInfo, overdueMinutes }) {
  if (overdueMinutes > 0) {
    return (
      <span className="time-overdue">
        Dépassé de <strong>{formatDuration(overdueMinutes)}</strong>
      </span>
    );
  }

  return (
    <span className="time-remaining">
      Reste <strong>{formatDuration(timeInfo.remaining)}</strong>
    </span>
  );
}
