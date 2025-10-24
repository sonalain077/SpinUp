import React, { useState, useMemo } from 'react';
import { calculateOverdueMinutes, formatDuration, exportRegularizedToCSV, downloadCSV } from '../../lib/overdue';
import { getVehicleTypeIcon, getVehicleTypeLabel } from '../../lib/vehicleTypes';

/**
 * Modale d'historique des régularisations
 * Table triable avec export CSV
 */
export default function RegularizedHistoryModal({ history, onClose }) {
  const [sortBy, setSortBy] = useState('date'); // date | overdue | parking

  // Tri des données
  const sortedHistory = useMemo(() => {
    if (!history || history.length === 0) return [];

    const sorted = [...history];

    sorted.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          // Plus récent d'abord
          return new Date(b.endTime || b.startTime) - new Date(a.endTime || a.startTime);

        case 'overdue':
          return calculateOverdueMinutes(b) - calculateOverdueMinutes(a);

        case 'parking':
          return (a.parkingZone || '').localeCompare(b.parkingZone || '');

        default:
          return 0;
      }
    });

    return sorted;
  }, [history, sortBy]);

  // Export CSV
  const handleExportCSV = () => {
    const csvContent = exportRegularizedToCSV(sortedHistory);
    const filename = `regularisations_${new Date().toISOString().split('T')[0]}.csv`;
    downloadCSV(csvContent, filename);
  };

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
      aria-labelledby="history-modal-title"
      aria-modal="true"
    >
      <div 
        className="modal-content modal-history"
        onClick={e => e.stopPropagation()}
      >
        {/* Header fixe */}
        <header className="modal-header">
          <h2 id="history-modal-title" className="modal-title">
            📜 Historique des régularisations ({sortedHistory.length})
          </h2>
          <button 
            className="modal-close"
            onClick={onClose}
            aria-label="Fermer la modale"
          >
            ✕
          </button>
        </header>

        {/* Contrôles */}
        <div className="modal-controls">
          <div className="sort-box">
            <label htmlFor="history-sort" className="sort-label">Trier par:</label>
            <select
              id="history-sort"
              className="sort-select"
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
            >
              <option value="date">Date (récent d'abord)</option>
              <option value="overdue">Durée excès</option>
              <option value="parking">Parking</option>
            </select>
          </div>

          <button
            className="btn btn-export"
            onClick={handleExportCSV}
            aria-label="Exporter en CSV"
          >
            📥 Exporter CSV
          </button>
        </div>

        {/* Table */}
        <div className="modal-body">
          {sortedHistory.length === 0 ? (
            <p className="no-results">Aucune régularisation enregistrée</p>
          ) : (
            <div className="table-responsive">
              <table className="history-table">
                <thead>
                  <tr>
                    <th>Plaque</th>
                    <th>Type</th>
                    <th>Parking</th>
                    <th>Durée excès</th>
                    <th>Date régularisation</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedHistory.map((item, index) => (
                    <HistoryRow key={item.id || index} item={item} />
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
 * Ligne d'historique
 */
function HistoryRow({ item }) {
  const overdueMinutes = calculateOverdueMinutes(item);
  const regularizationDate = item.endTime 
    ? new Date(item.endTime).toLocaleString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : 'N/A';

  return (
    <tr className="history-row">
      <td className="cell-plate">
        <strong>{item.licencePlate}</strong>
      </td>
      <td className="cell-type">
        {getVehicleTypeIcon(item.vehicleType)} {getVehicleTypeLabel(item.vehicleType, true)}
      </td>
      <td className="cell-parking">
        {item.parkingZone}
      </td>
      <td className="cell-overdue">
        <span className={overdueMinutes > 60 ? 'overdue-severe' : 'overdue-normal'}>
          {formatDuration(overdueMinutes)}
        </span>
      </td>
      <td className="cell-date">
        {regularizationDate}
      </td>
    </tr>
  );
}
