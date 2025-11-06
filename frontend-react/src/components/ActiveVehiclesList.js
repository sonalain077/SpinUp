import React, { useState, useEffect } from 'react';
import './ActiveVehiclesList.css';

const ActiveVehiclesList = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('ALL'); // ALL, ACTIVE, OVERDUE

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('http://localhost:8081/api/vehicles/active');
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des véhicules');
      }
      const data = await response.json();
      setVehicles(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
    // Refresh toutes les 30 secondes
    const interval = setInterval(fetchVehicles, 30000);
    return () => clearInterval(interval);
  }, []);

  const filteredVehicles = vehicles.filter(vehicle => {
    if (filter === 'ALL') return true;
    if (filter === 'ACTIVE') return vehicle.status === 'ACTIVE';
    if (filter === 'OVERDUE') return vehicle.status === 'OVERDUE';
    return true;
  });

  const formatDuration = (minutes) => {
    const hours = Math.floor(Math.abs(minutes) / 60);
    const mins = Math.abs(minutes) % 60;
    return `${hours}h${mins.toString().padStart(2, '0')}`;
  };

  const getStatusClass = (vehicle) => {
    if (vehicle.status === 'OVERDUE') return 'status-overdue';
    if (vehicle.remainingMinutes < 10) return 'status-warning';
    return 'status-active';
  };

  if (loading && vehicles.length === 0) {
    return (
      <div className="active-vehicles-list">
        <div className="loading">
          <div className="spinner"></div>
          <p>Chargement des véhicules...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="active-vehicles-list">
      <div className="list-header">
        <div className="title-section">
          <h3>🚗 Véhicules Stationnés</h3>
          <span className="count-badge">{filteredVehicles.length} véhicule(s)</span>
        </div>
        <div className="filter-buttons">
          <button 
            className={filter === 'ALL' ? 'active' : ''}
            onClick={() => setFilter('ALL')}
          >
            Tous
          </button>
          <button 
            className={filter === 'ACTIVE' ? 'active' : ''}
            onClick={() => setFilter('ACTIVE')}
          >
            Actifs
          </button>
          <button 
            className={filter === 'OVERDUE' ? 'active' : ''}
            onClick={() => setFilter('OVERDUE')}
          >
            En retard
          </button>
          <button 
            className="refresh-btn"
            onClick={fetchVehicles}
          >
            🔄 Actualiser
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          ❌ Erreur : {error}
        </div>
      )}

      {filteredVehicles.length === 0 && !loading ? (
        <div className="empty-state">
          <p>Aucun véhicule {filter === 'OVERDUE' ? 'en retard' : 'stationné'}</p>
        </div>
      ) : (
        <div className="vehicles-grid">
          {filteredVehicles.map((vehicle, index) => (
            <div key={index} className={`vehicle-card ${getStatusClass(vehicle)}`}>
              <div className="vehicle-plate">{vehicle.licencePlate}</div>
              
              <div className="vehicle-type">
                {vehicle.vehicleType === 'CAR' && '🚗 Voiture'}
                {vehicle.vehicleType === 'MOTORCYCLE' && '🏍️ Moto'}
                {vehicle.vehicleType === 'BICYCLE' && '🚲 Vélo'}
                {vehicle.vehicleType === 'ELECTRIC_SCOOTER' && '🛴 Trottinette'}
              </div>

              <div className="vehicle-parking">
                📍 {vehicle.parkingName}
              </div>

              <div className="vehicle-timing">
                <div className="timing-row">
                  <span className="label">Début:</span>
                  <span className="value">
                    {new Date(vehicle.startTime).toLocaleTimeString('fr-FR', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </span>
                </div>
                <div className="timing-row">
                  <span className="label">Fin prévue:</span>
                  <span className="value">
                    {new Date(vehicle.endTime).toLocaleTimeString('fr-FR', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </span>
                </div>
                <div className="timing-row">
                  <span className="label">Durée:</span>
                  <span className="value">{formatDuration(vehicle.durationMinutes)}</span>
                </div>
                <div className="timing-row">
                  <span className="label">Temps restant:</span>
                  <span className={`value ${vehicle.remainingMinutes < 0 ? 'overdue' : ''}`}>
                    {vehicle.remainingMinutes < 0 ? '+' : ''}{formatDuration(vehicle.remainingMinutes)}
                  </span>
                </div>
              </div>

              <div className={`vehicle-status ${vehicle.status.toLowerCase()}`}>
                <span className="status-icon">
                  {vehicle.status === 'ACTIVE' ? '✅' : '⚠️'}
                </span>
                <span className="status-text">
                  {vehicle.status === 'ACTIVE' ? 'ACTIF' : 'EN RETARD'}
                </span>
              </div>

              <div className="vehicle-amount">
                {vehicle.amountPaid.toFixed(2)} €
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="list-footer">
        🔄 Actualisation automatique toutes les 30 secondes
      </div>
    </div>
  );
};

export default ActiveVehiclesList;
