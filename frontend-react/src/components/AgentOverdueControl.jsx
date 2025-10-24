import React, { useState, useEffect } from 'react';
import './AgentOverdueControl.css';

const AgentOverdueControl = () => {
  const [overdueReservations, setOverdueReservations] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [filter, setFilter] = useState('all'); // all, severe, moderate

  const API_BASE_URL = 'http://localhost:8081/api';

  // Charger les données au démarrage et toutes les 30 secondes
  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000); // Rafraîchissement auto
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Charger les réservations en excès et les stats en parallèle
      const [overdueRes, statsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/agent/overdue`),
        fetch(`${API_BASE_URL}/agent/overdue/stats`)
      ]);

      if (!overdueRes.ok || !statsRes.ok) {
        throw new Error('Erreur lors du chargement des données');
      }

      const overdueData = await overdueRes.json();
      const statsData = await statsRes.json();

      setOverdueReservations(overdueData);
      setStats(statsData);
    } catch (err) {
      setError(err.message);
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  const markAsOverdue = async (reservationId, licencePlate) => {
    try {
      const response = await fetch(`${API_BASE_URL}/agent/overdue/${reservationId}/mark`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Erreur lors du marquage');
      }

      const result = await response.json();
      
      if (result.success) {
        setSuccessMessage(`✓ Véhicule ${licencePlate} marqué en infraction`);
        setTimeout(() => setSuccessMessage(''), 3000);
        loadData(); // Recharger les données
      }
    } catch (err) {
      setError(`Erreur: ${err.message}`);
      setTimeout(() => setError(null), 3000);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateOverdueMinutes = (reservation) => {
    const endTime = new Date(reservation.startAt);
    endTime.setMinutes(endTime.getMinutes() + reservation.durationMinutes);
    const now = new Date();
    return Math.floor((now - endTime) / 1000 / 60);
  };

  const getSeverityClass = (minutes) => {
    if (minutes > 60) return 'severe';
    if (minutes > 30) return 'moderate';
    return 'light';
  };

  const getSeverityLabel = (minutes) => {
    if (minutes > 60) return 'GRAVE';
    if (minutes > 30) return 'MODÉRÉ';
    return 'LÉGER';
  };

  const filteredReservations = overdueReservations.filter(res => {
    if (filter === 'all') return true;
    const minutes = calculateOverdueMinutes(res);
    if (filter === 'severe') return minutes > 60;
    if (filter === 'moderate') return minutes > 30 && minutes <= 60;
    return true;
  });

  if (loading && !stats) {
    return (
      <div className="agent-control">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Chargement des données...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="agent-control">
      {/* Header */}
      <div className="control-header">
        <div className="header-content">
          <h1>🚔 Contrôle des Excès de Stationnement</h1>
          <p className="subtitle">Tableau de bord agent - Surveillance en temps réel</p>
        </div>
        <button onClick={loadData} className="refresh-btn" disabled={loading}>
          {loading ? '⟳ Chargement...' : '🔄 Actualiser'}
        </button>
      </div>

      {/* Messages */}
      {error && (
        <div className="alert alert-error">
          ⚠️ {error}
        </div>
      )}
      
      {successMessage && (
        <div className="alert alert-success">
          {successMessage}
        </div>
      )}

      {/* Statistiques */}
      {stats && (
        <div className="stats-grid">
          <div className="stat-card primary">
            <div className="stat-icon">📊</div>
            <div className="stat-content">
              <h3>{stats.totalActive}</h3>
              <p>Réservations actives</p>
            </div>
          </div>
          <div className="stat-card warning">
            <div className="stat-icon">⏰</div>
            <div className="stat-content">
              <h3>{stats.currentOverdue}</h3>
              <p>En excès actuellement</p>
            </div>
          </div>
          <div className="stat-card danger">
            <div className="stat-icon">🚨</div>
            <div className="stat-content">
              <h3>{stats.markedOverdue}</h3>
              <p>Marqués en infraction</p>
            </div>
          </div>
          <div className="stat-card info">
            <div className="stat-icon">📅</div>
            <div className="stat-content">
              <h3>{new Date(stats.timestamp).toLocaleTimeString('fr-FR')}</h3>
              <p>Dernière mise à jour</p>
            </div>
          </div>
        </div>
      )}

      {/* Filtres */}
      <div className="filters">
        <button 
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          Tous ({overdueReservations.length})
        </button>
        <button 
          className={`filter-btn ${filter === 'severe' ? 'active' : ''}`}
          onClick={() => setFilter('severe')}
        >
          Graves (&gt; 60 min)
        </button>
        <button 
          className={`filter-btn ${filter === 'moderate' ? 'active' : ''}`}
          onClick={() => setFilter('moderate')}
        >
          Modérés (30-60 min)
        </button>
      </div>

      {/* Liste des excès */}
      <div className="overdue-list">
        <h2>Véhicules en excès de temps ({filteredReservations.length})</h2>
        
        {filteredReservations.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">✓</div>
            <h3>Aucun excès détecté</h3>
            <p>Tous les véhicules respectent leur temps de stationnement</p>
          </div>
        ) : (
          <div className="reservations-table">
            <table>
              <thead>
                <tr>
                  <th>Plaque</th>
                  <th>Type</th>
                  <th>Adresse</th>
                  <th>Début</th>
                  <th>Durée prévue</th>
                  <th>Excès</th>
                  <th>Sévérité</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredReservations.map(reservation => {
                  const overdueMinutes = calculateOverdueMinutes(reservation);
                  const severityClass = getSeverityClass(overdueMinutes);
                  const severityLabel = getSeverityLabel(overdueMinutes);
                  
                  return (
                    <tr key={reservation.id} className={`row-${severityClass}`}>
                      <td className="licence-plate">
                        <strong>{reservation.licencePlate}</strong>
                      </td>
                      <td>
                        <span className="vehicle-type">
                          {reservation.vehicleType === 'CAR' && '🚗 Voiture'}
                          {reservation.vehicleType === 'MOTORCYCLE' && '🏍️ Moto'}
                          {reservation.vehicleType === 'BICYCLE' && '🚲 Vélo'}
                          {reservation.vehicleType === 'ELECTRIC_SCOOTER' && '🛴 Trottinette'}
                        </span>
                      </td>
                      <td className="address">{reservation.address}</td>
                      <td>{formatDate(reservation.startAt)}</td>
                      <td>{reservation.durationMinutes} min</td>
                      <td className={`overdue-time ${severityClass}`}>
                        <strong>+{overdueMinutes} min</strong>
                      </td>
                      <td>
                        <span className={`severity-badge ${severityClass}`}>
                          {severityLabel}
                        </span>
                      </td>
                      <td>
                        <button
                          className="action-btn mark-btn"
                          onClick={() => markAsOverdue(reservation.id, reservation.licencePlate)}
                        >
                          🚨 Marquer infraction
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Légende */}
      <div className="legend">
        <h4>Légende des niveaux de sévérité :</h4>
        <div className="legend-items">
          <div className="legend-item">
            <span className="severity-badge light">LÉGER</span>
            <span>Moins de 30 minutes de dépassement</span>
          </div>
          <div className="legend-item">
            <span className="severity-badge moderate">MODÉRÉ</span>
            <span>Entre 30 et 60 minutes de dépassement</span>
          </div>
          <div className="legend-item">
            <span className="severity-badge severe">GRAVE</span>
            <span>Plus de 60 minutes de dépassement</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentOverdueControl;
