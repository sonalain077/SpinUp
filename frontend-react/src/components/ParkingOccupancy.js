import React, { useState, useEffect } from 'react';
import './ParkingOccupancy.css';

const ParkingOccupancy = () => {
  const [parkings, setParkings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  const fetchOccupancy = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('http://localhost:8081/api/parking/occupancy');
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des données');
      }
      const data = await response.json();
      setParkings(data);
      setLastUpdate(new Date());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOccupancy();
    // Refresh toutes les 30 secondes
    const interval = setInterval(fetchOccupancy, 30000);
    return () => clearInterval(interval);
  }, []);

  const getOccupancyClass = (rate) => {
    if (rate >= 90) return 'critical';
    if (rate >= 70) return 'warning';
    return 'normal';
  };

  const getOccupancyIcon = (rate) => {
    if (rate >= 90) return '🚫';
    if (rate >= 70) return '⚠️';
    return '✅';
  };

  if (loading && parkings.length === 0) {
    return (
      <div className="parking-occupancy">
        <div className="loading">
          <div className="spinner"></div>
          <p>Chargement de l'occupation des parkings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="parking-occupancy">
      <div className="occupancy-header">
        <div className="title-section">
          <h3>📊 Occupation des Parkings</h3>
          {lastUpdate && (
            <span className="last-update">
              Dernière mise à jour : {lastUpdate.toLocaleTimeString('fr-FR')}
            </span>
          )}
        </div>
        <button className="refresh-btn" onClick={fetchOccupancy}>
          🔄 Actualiser
        </button>
      </div>

      {error && (
        <div className="error-message">
          ❌ Erreur : {error}
        </div>
      )}

      {parkings.length === 0 && !loading ? (
        <div className="empty-state">
          <p>Aucun parking disponible</p>
        </div>
      ) : (
        <div className="parkings-grid">
          {parkings.map((parking) => (
            <div
              key={parking.parkingId}
              className={`parking-card ${getOccupancyClass(parking.occupancyRate)}`}
            >
              <div className="parking-header">
                <div className="parking-name">
                  <span className="icon">🅿️</span>
                  <h4>{parking.parkingName}</h4>
                </div>
                <div className={`occupancy-icon ${getOccupancyClass(parking.occupancyRate)}`}>
                  {getOccupancyIcon(parking.occupancyRate)}
                </div>
              </div>

              <div className="parking-address">
                📍 {parking.address}
              </div>

              <div className="parking-stats">
                <div className="stat-item">
                  <div className="stat-label">Occupation</div>
                  <div className="stat-value large">
                    {parking.occupiedSpots} / {parking.totalSpots}
                  </div>
                </div>
                <div className="stat-item">
                  <div className="stat-label">Taux</div>
                  <div className={`stat-value large ${getOccupancyClass(parking.occupancyRate)}`}>
                    {parking.occupancyRate.toFixed(1)}%
                  </div>
                </div>
              </div>

              <div className="progress-bar-container">
                <div
                  className={`progress-bar ${getOccupancyClass(parking.occupancyRate)}`}
                  style={{ width: `${parking.occupancyRate}%` }}
                >
                  <span className="progress-text">
                    {parking.occupancyRate.toFixed(0)}%
                  </span>
                </div>
              </div>

              <div className="available-spots">
                <span className="spots-icon">🚗</span>
                <span className="spots-text">
                  {parking.availableSpots} place{parking.availableSpots !== 1 ? 's' : ''} disponible{parking.availableSpots !== 1 ? 's' : ''}
                </span>
              </div>

              {parking.overdueCount > 0 && (
                <div className="overdue-alert">
                  <span className="alert-icon">⏰</span>
                  <span className="alert-text">
                    {parking.overdueCount} véhicule{parking.overdueCount !== 1 ? 's' : ''} en retard
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="occupancy-legend">
        <div className="legend-item">
          <div className="legend-color normal"></div>
          <span>Disponible (&lt; 70%)</span>
        </div>
        <div className="legend-item">
          <div className="legend-color warning"></div>
          <span>Attention (70-90%)</span>
        </div>
        <div className="legend-item">
          <div className="legend-color critical"></div>
          <span>Complet (&gt; 90%)</span>
        </div>
      </div>

      <div className="list-footer">
        🔄 Actualisation automatique toutes les 30 secondes
      </div>
    </div>
  );
};

export default ParkingOccupancy;
