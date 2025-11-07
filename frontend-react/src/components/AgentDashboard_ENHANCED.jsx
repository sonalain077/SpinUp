import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AgentDashboard.css';

const API_BASE_URL = 'http://localhost:8081/api';

const AgentDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [serverHealth, setServerHealth] = useState('UP');
  
  // Données de l'overview
  const [stats, setStats] = useState({
    currentOverdue: 0,
    markedOverdue: 0,
    regularized: 0,
    totalOverdueMinutes: 0,
    averageOverdueMinutes: 0,
    parkedVehicles: 0,
    capacity: 0,
    saturationIndex: 0
  });
  
  const [mostFilled, setMostFilled] = useState(null);
  const [distribution, setDistribution] = useState(null);
  const [parkingZones, setParkingZones] = useState([]);
  const [overstayStats, setOverstayStats] = useState(null);
  
  // Infractions par parking
  const [infringementsByParking, setInfringementsByParking] = useState([]);
  
  // Historique des véhicules régularisés
  const [regularizedHistory, setRegularizedHistory] = useState([]);
  
  // État pour le popup de détails parking
  const [selectedParking, setSelectedParking] = useState(null);
  const [showParkingPopup, setShowParkingPopup] = useState(false);
  
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    loadData();
    // Polling toutes les 30 secondes
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Charger health check
      try {
        const healthRes = await fetch(`${API_BASE_URL}/../health`);
        if (healthRes.ok) {
          const healthData = await healthRes.json();
          setServerHealth(healthData.status || 'UP');
        }
      } catch (err) {
        setServerHealth('DOWN');
      }
      
      // Charger overview, infringements et historique en parallèle
      const [overviewRes, infringementsRes, historyRes] = await Promise.all([
        fetch(`${API_BASE_URL}/agent/overview`),
        fetch(`${API_BASE_URL}/agent/infringements`),
        fetch(`${API_BASE_URL}/agent/regularized-history`)
      ]);

      if (overviewRes.ok) {
        const overview = await overviewRes.json();
        
        console.log('📊 Overview reçu:', overview);
        
        // Mettre à jour lastUpdate
        if (overview.lastUpdate) {
          setLastUpdate(new Date(overview.lastUpdate));
        }
        
        // Mettre à jour les stats générales
        setStats({
          currentOverdue: overview.overstayStats?.nowExceeded || 0,
          markedOverdue: overview.overstayStats?.alreadyReported || 0,
          regularized: overview.overstayStats?.regularized || 0,
          totalOverdueMinutes: overview.overstayStats?.totalExcessMinutes || 0,
          averageOverdueMinutes: overview.overstayStats?.avgExcessMinutes || 0,
          parkedVehicles: overview.totals?.parkedVehicles || 0,
          capacity: overview.totals?.capacity || 0,
          saturationIndex: overview.totals?.saturationIndex || 0
        });
        
        // Parking le plus rempli
        setMostFilled(overview.mostFilled);
        
        // Distribution
        setDistribution(overview.distribution);
        
        // Parkings
        setParkingZones(overview.perParking || []);
        
        // Stats d'excès
        setOverstayStats(overview.overstayStats);
      }

      if (infringementsRes.ok) {
        const infringements = await infringementsRes.json();
        console.log('🚨 Infractions reçues:', infringements);
        setInfringementsByParking(infringements);
      }

      if (historyRes.ok) {
        const history = await historyRes.json();
        console.log('📜 Historique régularisations:', history);
        setRegularizedHistory(history);
      }
      
    } catch (error) {
      console.error('❌ Erreur chargement:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReport = async (reservationId) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/agent/infringements/${reservationId}/report`,
        { method: 'POST' }
      );
      
      if (response.ok) {
        showSuccessMessage('✅ Véhicule signalé avec succès');
        // Recharger les données
        await loadData();
      }
    } catch (error) {
      console.error('❌ Erreur signalement:', error);
    }
  };

  const handleRegularize = async (reservationId) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/agent/infringements/${reservationId}/regularize`,
        { method: 'POST' }
      );
      
      if (response.ok) {
        showSuccessMessage('✅ Véhicule régularisé avec succès');
        // Recharger les données
        await loadData();
      }
    } catch (error) {
      console.error('❌ Erreur régularisation:', error);
    }
  };

  const showSuccessMessage = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 5000);
  };

  // Fonction pour scroller vers l'historique
  const scrollToHistory = () => {
    const historySection = document.querySelector('.history-section');
    if (historySection) {
      historySection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Fonction pour ouvrir le popup de détails parking
  const openParkingDetails = (parking) => {
    setSelectedParking(parking);
    setShowParkingPopup(true);
  };

  // Fonction pour fermer le popup
  const closeParkingPopup = () => {
    setShowParkingPopup(false);
    setTimeout(() => setSelectedParking(null), 300);
  };

  // Fonction pour gérer le clic sur un véhicule en excès
  const handleVehicleClick = (reservationId) => {
    // Fermer le popup
    closeParkingPopup();
    
    // Attendre que le popup se ferme, puis scroller vers la section infractions
    setTimeout(() => {
      const infractionsSection = document.querySelector('.infringements-section');
      if (infractionsSection) {
        infractionsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 400);
  };

  // Fonction pour déterminer la classe de remplissage (feux de circulation)
  const getFillClass = (fillPercent) => {
    if (fillPercent < 0.7) return 'low';
    if (fillPercent < 0.9) return 'medium';
    return 'high';
  };

  const formatDate = (date) => {
    if (!date) return '--';
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(date);
  };

  const formatDuration = (minutes) => {
    if (!minutes || minutes === 0) return '0 min';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}min`;
    }
    return `${mins} min`;
  };

  const getVehicleTypeLabel = (type) => {
    const labels = {
      'CAR': '🚗 Voiture',
      'MOTORCYCLE': '🏍️ Moto',
      'VAN': '🚐 Camionnette',
      'TRUCK': '🚚 Camion',
      'BICYCLE': '🚲 Vélo',
      'ELECTRIC_SCOOTER': '🛴 Trottinette'
    };
    return labels[type] || type;
  };

  if (loading && !lastUpdate) {
    return (
      <div className="agent-dashboard">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Chargement des données...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="agent-dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <h1>🅿️ Dashboard Agent</h1>
            <p className="subtitle">Surveillance en temps réel</p>
          </div>
          <div className="header-right">
            <div className="last-update">
              <span className="update-label">Dernière mise à jour :</span>
              <span className="update-time">{formatDate(lastUpdate)}</span>
            </div>
            <div className={`server-status ${serverHealth === 'UP' ? 'connected' : 'disconnected'}`}>
              {serverHealth === 'UP' ? '✅ Serveur connecté' : '❌ Serveur déconnecté'}
            </div>
            <button className="btn-home" onClick={() => navigate('/')}>
              🏠 Retour Accueil
            </button>
          </div>
        </div>
      </header>

      {/* Message de succès */}
      {successMessage && (
        <div className="success-toast">
          {successMessage}
        </div>
      )}

      {/* Statistiques Générales */}
      <section className="stats-section">
        <h2>📊 Statistiques Générales</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">🅿️</div>
            <div className="stat-content">
              <div className="stat-value">{stats.parkedVehicles}</div>
              <div className="stat-label">Véhicules garés</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">📊</div>
            <div className="stat-content">
              <div className="stat-value">{(stats.saturationIndex * 100).toFixed(1)}%</div>
              <div className="stat-label">Indice de saturation</div>
              <div className="stat-detail">{stats.parkedVehicles} / {stats.capacity} places</div>
            </div>
          </div>

          <div className="stat-card alert">
            <div className="stat-icon">⏰</div>
            <div className="stat-content">
              <div className="stat-value">{stats.currentOverdue}</div>
              <div className="stat-label">En excès maintenant</div>
            </div>
          </div>

          <div className="stat-card warning">
            <div className="stat-icon">🚨</div>
            <div className="stat-content">
              <div className="stat-value">{stats.markedOverdue}</div>
              <div className="stat-label">Déjà signalés</div>
            </div>
          </div>

          <div className="stat-card success clickable" onClick={scrollToHistory} title="Voir l'historique des régularisations">
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <div className="stat-value">{stats.regularized}</div>
              <div className="stat-label">Régularisés</div>
            </div>
          </div>
        </div>
      </section>

      {/* Parking le plus rempli & Distribution */}
      <section className="highlights-section">
        <div className="highlights-grid">
          {mostFilled && (
            <div className="highlight-card most-filled">
              <h3>🏆 Parking le plus rempli</h3>
              <div className="highlight-content">
                <div className="parking-name">{mostFilled.parkingName}</div>
                <div className="fill-bar">
                  <div 
                    className={`fill-progress ${getFillClass(mostFilled.fillPercent)}`}
                    style={{ width: `${(mostFilled.fillPercent * 100).toFixed(0)}%` }}
                  ></div>
                </div>
                <div className="fill-stats">
                  <span>{mostFilled.used} / {mostFilled.capacity} places</span>
                  <span className={`fill-percent ${getFillClass(mostFilled.fillPercent)}`}>
                    {(mostFilled.fillPercent * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          )}

          {distribution && (
            <div className="highlight-card distribution">
              <h3>📊 Indice de répartition</h3>
              <div className="highlight-content">
                <div className="distribution-value">{distribution.stddevPercent.toFixed(1)}%</div>
                <div className="distribution-label">{distribution.label}</div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Occupation par Parking */}
      <section className="parking-section">
        <h2>🅿️ Occupation par Parking</h2>
        <div className="parking-grid">
          {parkingZones.map((zone, index) => (
            <div 
              key={index} 
              className="parking-card clickable" 
              onClick={() => openParkingDetails(zone)}
              title="Cliquer pour voir les détails des véhicules"
            >
              <div className="parking-header">
                <h3>{zone.parkingName}</h3>
                <span className="capacity-badge">{zone.used} / {zone.capacity}</span>
              </div>
              <div className="parking-bar">
                <div 
                  className={`parking-fill ${getFillClass(zone.fillPercent)}`}
                  style={{ width: `${(zone.fillPercent * 100).toFixed(0)}%` }}
                ></div>
              </div>
              <div className="parking-stats">
                <span>Places libres: {zone.free}</span>
                <span className={`fill-rate ${getFillClass(zone.fillPercent)}`}>
                  {(zone.fillPercent * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Véhicules en Excès - Détails */}
      {overstayStats && (
        <section className="excess-details-section">
          <h2>⏰ Véhicules en Excès – Détails</h2>
          <div className="excess-details-grid">
            <div className="detail-card">
              <div className="detail-label">Moyenne excès</div>
              <div className="detail-value">{formatDuration(overstayStats.avgExcessMinutes)}</div>
            </div>
            <div className="detail-card">
              <div className="detail-label">Temps total excès</div>
              <div className="detail-value">{formatDuration(overstayStats.totalExcessMinutes)}</div>
            </div>
            {overstayStats.byType && overstayStats.byType.length > 0 && (
              <div className="detail-card">
                <div className="detail-label">Répartition par type</div>
                <div className="type-list">
                  {overstayStats.byType.map((item, idx) => (
                    <div key={idx} className="type-item">
                      {getVehicleTypeLabel(item.type)}: {item.count}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {overstayStats.topExcessZones && overstayStats.topExcessZones.length > 0 && (
              <div className="detail-card">
                <div className="detail-label">Top zones excès</div>
                <div className="zone-list">
                  {overstayStats.topExcessZones.map((zone, idx) => (
                    <div key={idx} className="zone-item">
                      {zone.parkingName}: {zone.count}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Infractions par Parking */}
      <section className="infringements-section">
        <h2>🚨 Infractions par Parking</h2>
        {infringementsByParking.length === 0 ? (
          <div className="no-infringements">
            <p>✅ Aucune infraction détectée</p>
          </div>
        ) : (
          infringementsByParking.map((parking, parkingIdx) => (
            <div key={parkingIdx} className="parking-infringements">
              <h3 className="parking-title">
                📍 {parking.parkingName} 
                <span className="infringement-count">({parking.items.length} infraction{parking.items.length > 1 ? 's' : ''})</span>
              </h3>
              <div className="infringement-list">
                {parking.items.map((item, itemIdx) => (
                  <div key={itemIdx} className={`infringement-card ${item.severity.toLowerCase()}`}>
                    <div className="infringement-header">
                      <div className="plate-badge">{item.plate}</div>
                      <div className={`severity-badge ${item.severity.toLowerCase()}`}>
                        {item.severity === 'LEGER' ? '⚠️ LÉGER' : '🚨 GRAVE'}
                      </div>
                    </div>
                    
                    <div className="infringement-details">
                      <div className="detail-row">
                        <span className="detail-label">Type:</span>
                        <span>{getVehicleTypeLabel(item.vehicleType)}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Durée payée:</span>
                        <span>{formatDuration(item.paidMinutes)}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Début:</span>
                        <span>{formatDate(new Date(item.startAt * 1000))}</span>
                      </div>
                      <div className="detail-row highlight">
                        <span className="detail-label">Excès:</span>
                        <span className="excess-value">{formatDuration(item.exceededMinutes)}</span>
                      </div>
                    </div>

                    <div className="infringement-actions">
                      {!item.reported && !item.regularized && (
                        <>
                          <button 
                            className="btn-report"
                            onClick={() => handleReport(item.reservationId)}
                          >
                            🚨 Signaler
                          </button>
                          <button 
                            className="btn-regularize"
                            onClick={() => handleRegularize(item.reservationId)}
                          >
                            ✅ Excès régularisé
                          </button>
                        </>
                      )}
                      {item.reported && !item.regularized && (
                        <div className="status-badge reported">Déjà signalé</div>
                      )}
                      {item.regularized && (
                        <div className="status-badge regularized">Régularisé</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </section>

      {/* Section Historique des Régularisations */}
      <section className="history-section">
        <h2 className="section-title">📜 Historique des Régularisations</h2>
        
        {regularizedHistory.length === 0 ? (
          <div className="empty-state">
            <p>Aucune régularisation enregistrée pour le moment.</p>
          </div>
        ) : (
          <div className="history-container">
            <div className="history-table">
              <div className="history-header">
                <div className="history-col">Plaque</div>
                <div className="history-col">Type</div>
                <div className="history-col">Parking</div>
                <div className="history-col">Début</div>
                <div className="history-col">Fin prévue</div>
                <div className="history-col">Régularisé le</div>
                <div className="history-col">Excès</div>
                <div className="history-col">Durée payée</div>
              </div>
              
              {regularizedHistory.map((item, index) => (
                <div key={index} className="history-row">
                  <div className="history-col">
                    <div className="plate-badge small">{item.licencePlate}</div>
                  </div>
                  <div className="history-col">
                    {getVehicleTypeLabel(item.vehicleType)}
                  </div>
                  <div className="history-col">{item.parkingName}</div>
                  <div className="history-col">
                    {formatDate(new Date(item.startAt))}
                  </div>
                  <div className="history-col">
                    {formatDate(new Date(item.endAt))}
                  </div>
                  <div className="history-col">
                    {formatDate(new Date(item.regularizedAt))}
                  </div>
                  <div className="history-col excess-highlight">
                    {formatDuration(item.exceededMinutes)}
                  </div>
                  <div className="history-col">
                    {formatDuration(item.paidMinutes)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Popup détails parking */}
      {showParkingPopup && selectedParking && (
        <div className="popup-overlay" onClick={closeParkingPopup}>
          <div className="popup-content" onClick={(e) => e.stopPropagation()}>
            <div className="popup-header">
              <h2>🅿️ {selectedParking.parkingName}</h2>
              <button className="close-btn" onClick={closeParkingPopup}>✕</button>
            </div>
            
            <div className="popup-stats">
              <div className="popup-stat">
                <span className="label">Occupation:</span>
                <span className="value">{selectedParking.used} / {selectedParking.capacity}</span>
              </div>
              <div className="popup-stat">
                <span className="label">Taux de remplissage:</span>
                <span className="value">{(selectedParking.fillPercent * 100).toFixed(1)}%</span>
              </div>
              <div className="popup-stat">
                <span className="label">Places libres:</span>
                <span className="value">{selectedParking.free}</span>
              </div>
            </div>

            <ParkingVehiclesList 
              parkingName={selectedParking.parkingName}
              onVehicleClick={handleVehicleClick}
            />
          </div>
        </div>
      )}
    </div>
  );
};

// Composant pour afficher la liste des véhicules d'un parking
const ParkingVehiclesList = ({ parkingName, onVehicleClick }) => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVehicles();
  }, [parkingName]);

  const loadVehicles = async () => {
    try {
      setLoading(true);
      const encodedName = encodeURIComponent(parkingName);
      const response = await fetch(`${API_BASE_URL}/agent/parking/${encodedName}/vehicles`);
      
      if (response.ok) {
        const data = await response.json();
        setVehicles(data);
      }
    } catch (error) {
      console.error('❌ Erreur chargement véhicules:', error);
    } finally {
      setLoading(false);
    }
  };

  const getVehicleTypeLabel = (type) => {
    const labels = {
      'CAR': '🚗 Voiture',
      'MOTORCYCLE': '🏍️ Moto',
      'VAN': '🚐 Camionnette',
      'TRUCK': '🚚 Camion',
      'BICYCLE': '🚴 Vélo',
      'ELECTRIC_SCOOTER': '🛴 Trottinette'
    };
    return labels[type] || type;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (minutes) => {
    if (minutes < 60) return `${minutes}min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h${mins}min` : `${hours}h`;
  };

  if (loading) {
    return <div className="vehicles-loading">Chargement des véhicules...</div>;
  }

  if (vehicles.length === 0) {
    return <div className="vehicles-empty">Aucun véhicule actuellement garé</div>;
  }

  return (
    <div className="vehicles-list">
      <h3>Véhicules garés ({vehicles.length})</h3>
      <div className="vehicles-grid">
        {vehicles.map((vehicle, index) => (
          <div 
            key={index} 
            className={`vehicle-item ${vehicle.overdue ? 'overdue clickable-vehicle' : ''}`}
            onClick={() => vehicle.overdue && onVehicleClick(vehicle.reservationId)}
            style={vehicle.overdue ? { cursor: 'pointer' } : {}}
            title={vehicle.overdue ? 'Cliquer pour aller à la zone de régularisation' : ''}
          >
            <div className="vehicle-header">
              <div className="plate-badge small">{vehicle.licencePlate}</div>
              {vehicle.overdue && (
                <div className="overdue-badge">⚠️ En excès - Cliquez ici</div>
              )}
            </div>
            
            <div className="vehicle-details">
              <div className="detail-row">
                <span className="detail-label">Type:</span>
                <span>{getVehicleTypeLabel(vehicle.vehicleType)}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Arrivée:</span>
                <span>{formatDate(vehicle.startAt)}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Fin prévue:</span>
                <span>{formatDate(vehicle.endAt)}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Durée:</span>
                <span>{formatDuration(vehicle.durationMinutes)}</span>
              </div>
              {vehicle.overdue && vehicle.exceededMinutes && (
                <div className="detail-row highlight">
                  <span className="detail-label">Excès:</span>
                  <span className="excess-value">{formatDuration(vehicle.exceededMinutes)}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AgentDashboard;
