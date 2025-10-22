import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AgentDashboard.css';

const AgentDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalActive: 0,
    currentOverdue: 0,
    markedOverdue: 0
  });
  const [overdueReservations, setOverdueReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');
  const [filter, setFilter] = useState('all');
  const [analytics, setAnalytics] = useState({
    vehicleTypes: {},
    topLocations: [],
    averageOverdueMinutes: 0
  });

  const API_BASE_URL = 'http://localhost:8081/api';

  // Charger les données au démarrage et toutes les 30 secondes
  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [overdueRes, statsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/agent/overdue`),
        fetch(`${API_BASE_URL}/agent/overdue/stats`)
      ]);

      if (overdueRes.ok && statsRes.ok) {
        const overdueData = await overdueRes.json();
        const statsData = await statsRes.json();
        setOverdueReservations(overdueData);
        setStats({
          totalActive: statsData.totalActive || 0,
          currentOverdue: statsData.currentOverdue || 0,
          markedOverdue: statsData.markedOverdue || 0
        });
        calculateAnalytics(overdueData);
      }
    } catch (error) {
      console.error('❌ Erreur chargement:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateAnalytics = (data) => {
    // Répartition par type de véhicule
    const vehicleTypes = data.reduce((acc, item) => {
      const type = item.vehicleType || 'UNKNOWN';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    // Top 5 des adresses
    const locationCounts = data.reduce((acc, item) => {
      const addr = item.address || 'Adresse inconnue';
      acc[addr] = (acc[addr] || 0) + 1;
      return acc;
    }, {});
    const topLocations = Object.entries(locationCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([address, count]) => ({ address, count }));

    // Durée moyenne de dépassement
    const totalOverdueMinutes = data.reduce((sum, item) => {
      const minutes = calculateOverdueMinutes(item);
      return sum + minutes;
    }, 0);
    const averageOverdueMinutes = data.length > 0 ? Math.round(totalOverdueMinutes / data.length) : 0;

    setAnalytics({
      vehicleTypes,
      topLocations,
      averageOverdueMinutes
    });
  };

  const markAsOverdue = async (reservationId, licencePlate) => {
    try {
      const response = await fetch(`${API_BASE_URL}/agent/overdue/${reservationId}/mark`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setSuccessMessage(`✓ Véhicule ${licencePlate} marqué`);
          setTimeout(() => setSuccessMessage(''), 3000);
          loadData();
        }
      }
    } catch (error) {
      console.error('❌ Erreur marquage:', error);
    }
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getVehicleIcon = (type) => {
    const icons = {
      'CAR': '🚗',
      'MOTORCYCLE': '🏍️',
      'BICYCLE': '🚲',
      'ELECTRIC_SCOOTER': '🛴'
    };
    return icons[type] || '🚗';
  };

  const getVehicleLabel = (type) => {
    const labels = {
      'CAR': 'Voiture',
      'MOTORCYCLE': 'Moto',
      'BICYCLE': 'Vélo',
      'ELECTRIC_SCOOTER': 'Trottinette'
    };
    return labels[type] || type;
  };

  const filteredReservations = overdueReservations.filter(res => {
    if (filter === 'all') return true;
    const minutes = calculateOverdueMinutes(res);
    if (filter === 'severe') return minutes > 60;
    if (filter === 'moderate') return minutes > 30 && minutes <= 60;
    return true;
  });

  const handleBackToHome = () => {
    navigate('/');
  };

  return (
    <div className="agent-dashboard">
      <div className="dashboard-container">
        {/* Bouton retour */}
        <button onClick={handleBackToHome} className="back-button">
          ← Accueil
        </button>

        {/* Header */}
        <header className="dashboard-header">
          <h1>🚔 Contrôle Agent</h1>
          <p>Surveillance des excès de temps de stationnement</p>
        </header>

        {/* Message de succès */}
        {successMessage && (
          <div className="success-message">
            {successMessage}
          </div>
        )}

        {/* SECTION STATISTIQUES GÉNÉRALES */}
        <div className="statistics-section">
          <div className="section-header">
            <h2 className="section-title">
              <span className="section-icon">📊</span>
              Statistiques Générales
            </h2>
            <div className="last-update">
              Mise à jour : {new Date().toLocaleTimeString('fr-FR')}
            </div>
          </div>

          {/* Stats cards */}
          <div className="stats-grid">
            <div className="stat-card current-overdue">
              <div className="stat-number">{loading ? '...' : stats.currentOverdue}</div>
              <div className="stat-label">En excès maintenant</div>
            </div>
            <div className="stat-card marked-overdue">
              <div className="stat-number">{loading ? '...' : stats.markedOverdue}</div>
              <div className="stat-label">Déjà signalés</div>
            </div>
            <div className="stat-card average-time">
              <div className="stat-number">{loading ? '...' : analytics.averageOverdueMinutes}</div>
              <div className="stat-label">Moyenne excès (min)</div>
            </div>
          </div>

          {/* Analytics */}
          <div className="analytics-grid">
            {/* Répartition par type de véhicule */}
            <div className="analytics-card">
              <h3 className="analytics-title">
                <span className="analytics-icon">🚗</span>
                Répartition par Type
              </h3>
              <div className="vehicle-types-list">
                {Object.entries(analytics.vehicleTypes).length > 0 ? (
                  Object.entries(analytics.vehicleTypes).map(([type, count]) => (
                    <div key={type} className="vehicle-type-item">
                      <span className="vehicle-type-icon">{getVehicleIcon(type)}</span>
                      <span className="vehicle-type-label">{getVehicleLabel(type)}</span>
                      <span className="vehicle-type-count">{count}</span>
                    </div>
                  ))
                ) : (
                  <p className="no-data">Aucun véhicule en excès</p>
                )}
              </div>
            </div>

            {/* Top 5 des adresses */}
            <div className="analytics-card">
              <h3 className="analytics-title">
                <span className="analytics-icon">📍</span>
                Top Zones d'Excès
              </h3>
              <div className="top-locations-list">
                {analytics.topLocations.length > 0 ? (
                  analytics.topLocations.map((location, index) => (
                    <div key={index} className="location-item">
                      <span className="location-rank">#{index + 1}</span>
                      <span className="location-address">{location.address}</span>
                      <span className="location-count">{location.count}</span>
                    </div>
                  ))
                ) : (
                  <p className="no-data">Aucune donnée disponible</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* SÉPARATEUR VISUEL */}
        <div className="section-divider">
          <div className="divider-line"></div>
          <div className="divider-icon">🚨</div>
          <div className="divider-line"></div>
        </div>

        {/* SECTION VÉHICULES EN EXCÈS */}
        <div className="vehicles-section">
          <div className="section-header">
            <h2 className="section-title">
              <span className="section-icon">🚗</span>
              Véhicules en Excès - Détails
            </h2>
            <div className="vehicle-count-badge">
              {filteredReservations.length} véhicule{filteredReservations.length > 1 ? 's' : ''}
            </div>
          </div>

          {/* Filtres */}
          <div className="filters">
            <button 
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              Tous
            </button>
            <button 
              className={`filter-btn severe ${filter === 'severe' ? 'active' : ''}`}
              onClick={() => setFilter('severe')}
            >
              Graves (&gt; 60min)
            </button>
            <button 
              className={`filter-btn moderate ${filter === 'moderate' ? 'active' : ''}`}
              onClick={() => setFilter('moderate')}
            >
              Modérés (30-60min)
            </button>
          </div>

          {/* Liste des véhicules */}
          {loading ? (
            <div className="loading-state">⟳ Chargement...</div>
          ) : filteredReservations.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">✓</div>
              <p>Aucun véhicule en excès</p>
            </div>
          ) : (
            <div className="vehicles-grid">
              {filteredReservations.map(reservation => {
                const overdueMinutes = calculateOverdueMinutes(reservation);
                const severityClass = getSeverityClass(overdueMinutes);
                const severityLabel = getSeverityLabel(overdueMinutes);
                
                return (
                  <div key={reservation.id} className={`vehicle-card ${severityClass}`}>
                    <div className="vehicle-header">
                      <span className="licence-plate">{reservation.licencePlate}</span>
                      <span className={`severity-badge ${severityClass}`}>
                        {severityLabel}
                      </span>
                    </div>
                    
                    <div className="vehicle-info">
                      <div className="info-row">
                        <span className="label">Type:</span>
                        <span className="value">
                          {reservation.vehicleType === 'CAR' && '🚗 Voiture'}
                          {reservation.vehicleType === 'MOTORCYCLE' && '🏍️ Moto'}
                          {reservation.vehicleType === 'BICYCLE' && '🚲 Vélo'}
                          {reservation.vehicleType === 'ELECTRIC_SCOOTER' && '🛴 Trottinette'}
                        </span>
                      </div>
                      <div className="info-row">
                        <span className="label">Adresse:</span>
                        <span className="value">{reservation.address}</span>
                      </div>
                      <div className="info-row">
                        <span className="label">Début:</span>
                        <span className="value">{formatDate(reservation.startAt)}</span>
                      </div>
                      <div className="info-row">
                        <span className="label">Durée prévue:</span>
                        <span className="value">{reservation.durationMinutes} min</span>
                      </div>
                      <div className="info-row highlight">
                        <span className="label">Excès:</span>
                        <span className={`value overdue ${severityClass}`}>+{overdueMinutes} min</span>
                      </div>
                    </div>

                    <button
                      className="mark-btn"
                      onClick={() => markAsOverdue(reservation.id, reservation.licencePlate)}
                    >
                      🚨 Marquer infraction
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Info actualisation */}
        <div className="update-info">
          ⟳ Actualisation automatique toutes les 30 secondes
        </div>
      </div>
    </div>
  );
};

export default AgentDashboard;