import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AgentDashboard.css';

const API_BASE_URL = 'http://localhost:8081/api';

const AgentDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [overdueReservations, setOverdueReservations] = useState([]);
  const [stats, setStats] = useState({
    currentOverdue: 0,
    markedOverdue: 0,
    regularized: 0,
    totalOverdueMinutes: 0,
    averageOverdueMinutes: 0
  });
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [occupation, setOccupation] = useState({
    totalActive: 0,
    totalCapacity: 205,
    availablePlaces: 205,
    occupationRate: 0
  });
  const [parkingZones, setParkingZones] = useState([]);
  const [analytics, setAnalytics] = useState({
    vehicleTypes: {},
    topLocations: [],
    averageOverdueMinutes: 0
  });
  const [filter, setFilter] = useState('all');
  const [successMessage, setSuccessMessage] = useState('');
  const [allReservations, setAllReservations] = useState([]);
  const [selectedParking, setSelectedParking] = useState(null);
  const [parkingVehicles, setParkingVehicles] = useState([]);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [overdueRes, occupationRes, zonesRes, historyRes] = await Promise.all([
        fetch(`${API_BASE_URL}/agent/overdue`),
        fetch(`${API_BASE_URL}/agent/occupation`),
        fetch(`${API_BASE_URL}/agent/occupation/by-zone`),
        fetch(`${API_BASE_URL}/agent/overdue/history`)
      ]);

      if (overdueRes.ok && occupationRes.ok && zonesRes.ok && historyRes.ok) {
        const overdueData = await overdueRes.json();
        const occupationData = await occupationRes.json();
        const zonesData = await zonesRes.json();
        const historyData = await historyRes.json();

        console.log('\n🅿️ ============ DONNÉES PARKINGS REÇUES ============');
        console.log('📊 Nombre de parkings reçus:', zonesData.length);
        console.log('📊 Total véhicules dans ces parkings:', zonesData.reduce((sum, z) => sum + z.occupiedPlaces, 0));
        zonesData.forEach(zone => {
          console.log(`  ${zone.parkingName}: ${zone.occupiedPlaces}/${zone.totalCapacity} (${zone.occupationRate.toFixed(0)}%)`);
        });
        console.log('=================================================\n');

        console.log('📊 ============ ANALYSE COMPLETE DES TICKETS ============');
        console.log('📊 Total tickets reçus du backend:', overdueData.length);
        console.log('\n📋 DETAIL COMPLET DE CHAQUE TICKET:');
        overdueData.forEach((t, index) => {
          const minutes = calculateOverdueMinutes(t);
          const isOverdue = minutes > 0;
          console.log(`\n${index + 1}. ${t.licencePlate} @ ${t.address}`);
          console.log(`   Status: ${t.status}`);
          console.log(`   Excès: ${minutes} min (${isOverdue ? 'EN EXCES' : 'OK'})`);
          console.log(`   Début: ${new Date(t.startAt).toLocaleString('fr-FR')}`);
          console.log(`   Durée payée: ${t.durationMinutes} min`);
        });
        
        // Calculer les stats dynamiquement à partir des tickets
        // "En excès maintenant" = tickets ACTIVE qui sont vraiment en excès
        console.log('\n🔍 ============ FILTRAGE POUR "EN EXCES MAINTENANT" ============');
        const activeOverdueTickets = overdueData.filter(t => {
          const minutes = calculateOverdueMinutes(t);
          const isActive = t.status === 'ACTIVE';
          const isOverdue = minutes > 0;
          const shouldCount = isActive && isOverdue;
          
          console.log(`${t.licencePlate}: status=${t.status}, excès=${minutes}min → ${shouldCount ? '✅ COMPTÉ' : '❌ EXCLU'}`);
          
          return shouldCount;
        });
        const currentOverdue = activeOverdueTickets.length;
        
        console.log('\n✅ RESULTAT FINAL "EN EXCES MAINTENANT":', currentOverdue);
        console.log('   Tickets comptés:', activeOverdueTickets.map(t => t.licencePlate));
        
        // "Déjà signalés" = tickets avec statut SIGNALE
        console.log('\n🔍 ============ FILTRAGE POUR "DEJA SIGNALES" ============');
        const signaledTickets = overdueData.filter(t => {
          const isSignaled = t.status === 'SIGNALE';
          console.log(`${t.licencePlate}: status=${t.status} → ${isSignaled ? '✅ COMPTÉ' : '❌ EXCLU'}`);
          return isSignaled;
        });
        const markedOverdue = signaledTickets.length;
        
        console.log('\n✅ RESULTAT FINAL "DEJA SIGNALES":', markedOverdue);
        console.log('   Tickets comptés:', signaledTickets.map(t => t.licencePlate));
        
        const regularized = historyData.length;
        
        // Calculer temps total excès et moyenne uniquement sur les tickets en infraction (ACTIVE en excès + SIGNALE)
        const displayedTickets = [...activeOverdueTickets, ...signaledTickets];
        
        console.log('\n⏱️ ============ CALCUL TEMPS TOTAL EXCÈS ============');
        const totalOverdueMinutes = displayedTickets.reduce((sum, t) => {
          const overdueMinutes = calculateOverdueMinutes(t);
          console.log(`  ${t.licencePlate} (${t.status}): ${overdueMinutes} min d'excès`);
          return sum + overdueMinutes;
        }, 0);
        
        console.log(`\n📊 SOMME TOTALE: ${totalOverdueMinutes} minutes d'excès cumulés`);
        console.log(`   = ${Math.floor(totalOverdueMinutes / 60)}h ${totalOverdueMinutes % 60}min`);
        console.log(`   Nombre de tickets comptés: ${displayedTickets.length}\n`);
        
        const averageOverdueMinutes = displayedTickets.length > 0 
          ? Math.round(totalOverdueMinutes / displayedTickets.length) 
          : 0;

        console.log('\n📊 ============ STATISTIQUES FINALES ============');
        console.log('⏰ En excès maintenant (ACTIVE en excès):', currentOverdue, 'véhicules');
        console.log('🚨 Déjà signalés (SIGNALE):', markedOverdue, 'véhicules');
        console.log('✅ Régularisés:', regularized, 'véhicules');
        console.log('📊 Total infractions affichées:', displayedTickets.length, 'tickets');
        console.log('📊 Moyenne excès:', averageOverdueMinutes, 'min (', Math.floor(averageOverdueMinutes / 60), 'h', averageOverdueMinutes % 60, 'min)');
        console.log('⏱️ Temps total excès:', totalOverdueMinutes, 'min (', Math.floor(totalOverdueMinutes / 60), 'h', totalOverdueMinutes % 60, 'min)');
        console.log('============================================\n');

        setOverdueReservations(overdueData);
        setStats({
          currentOverdue,
          markedOverdue,
          regularized,
          totalOverdueMinutes,
          averageOverdueMinutes
        });
        setOccupation(occupationData);
        setParkingZones(zonesData);
        setHistory(historyData);
        calculateAnalytics(overdueData);
      }
    } catch (error) {
      console.error('❌ Erreur chargement:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateAnalytics = (data) => {
    const vehicleTypes = data.reduce((acc, item) => {
      const type = item.vehicleType || 'UNKNOWN';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    const locationCounts = data.reduce((acc, item) => {
      const addr = item.address || 'Adresse inconnue';
      acc[addr] = (acc[addr] || 0) + 1;
      return acc;
    }, {});
    const topLocations = Object.entries(locationCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([address, count]) => ({ address, count }));

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

  const handleParkingClick = async (parkingName) => {
    setSelectedParking(parkingName);
    try {
      const response = await fetch(`${API_BASE_URL}/agent/parking/${encodeURIComponent(parkingName)}/vehicles`);
      if (response.ok) {
        const vehicles = await response.json();
        setParkingVehicles(vehicles);
      } else {
        console.error('❌ Erreur chargement véhicules');
        setParkingVehicles([]);
      }
    } catch (error) {
      console.error('❌ Erreur:', error);
      setParkingVehicles([]);
    }
  };

  const calculateTimeRemaining = (reservation) => {
    const endTime = new Date(reservation.startAt);
    endTime.setMinutes(endTime.getMinutes() + reservation.durationMinutes);
    const now = new Date();
    const diff = Math.floor((endTime - now) / 1000 / 60);
    
    if (diff < 0) {
      return <span style={{ color: '#EF4444', fontWeight: 'bold' }}>Dépassé de {formatDuration(Math.abs(diff))}</span>;
    }
    return formatDuration(diff);
  };

  const signalInfraction = async (reservationId, licencePlate) => {
    try {
      const response = await fetch(`${API_BASE_URL}/agent/overdue/${reservationId}/signal`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        setSuccessMessage(`🚨 Infraction signalée pour ${licencePlate}`);
        setTimeout(() => setSuccessMessage(''), 3000);
        
        // Mise à jour locale immédiate
        setOverdueReservations(prev => 
          prev.map(r => r.id === reservationId ? { ...r, status: 'SIGNALE' } : r)
        );
        
        // Recalculer les stats
        const updatedTickets = overdueReservations.map(r => 
          r.id === reservationId ? { ...r, status: 'SIGNALE' } : r
        );
        updateStatsFromTickets(updatedTickets);
      }
    } catch (error) {
      console.error('❌ Erreur signalement:', error);
    }
  };

  const regularizeInfraction = async (reservationId, licencePlate) => {
    try {
      const response = await fetch(`${API_BASE_URL}/agent/overdue/${reservationId}/regularize`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        const regularized = await response.json();
        setSuccessMessage(`✅ Excès régularisé pour ${licencePlate}`);
        setTimeout(() => setSuccessMessage(''), 3000);
        
        // Retirer le ticket de la liste active
        setOverdueReservations(prev => prev.filter(r => r.id !== reservationId));
        
        // Ajouter à l'historique
        setHistory(prev => [regularized, ...prev]);
        
        // Recalculer les stats
        const updatedTickets = overdueReservations.filter(r => r.id !== reservationId);
        updateStatsFromTickets(updatedTickets, history.length + 1);
      }
    } catch (error) {
      console.error('❌ Erreur régularisation:', error);
    }
  };

  const updateStatsFromTickets = (tickets, regularizedCount = history.length) => {
    // "En excès maintenant" = ACTIVE en excès uniquement
    const activeOverdueTickets = tickets.filter(t => 
      t.status === 'ACTIVE' && calculateOverdueMinutes(t) > 0
    );
    const currentOverdue = activeOverdueTickets.length;
    
    // "Déjà signalés" = SIGNALE uniquement
    const signaledTickets = tickets.filter(t => t.status === 'SIGNALE');
    const markedOverdue = signaledTickets.length;
    
    // Calculer temps total excès = somme de tous les dépassements (temps réel - durée payée)
    const displayedTickets = [...activeOverdueTickets, ...signaledTickets];
    const totalOverdueMinutes = displayedTickets.reduce((sum, t) => {
      const overdueMinutes = Math.max(0, calculateOverdueMinutes(t));
      return sum + overdueMinutes;
    }, 0);
    
    const averageOverdueMinutes = displayedTickets.length > 0 
      ? Math.round(totalOverdueMinutes / displayedTickets.length) 
      : 0;

    console.log('🔄 Stats mises à jour:');
    console.log('  - En excès maintenant:', currentOverdue);
    console.log('  - Déjà signalés:', markedOverdue);
    console.log('  - Régularisés:', regularizedCount);
    console.log('  - Temps total excès:', totalOverdueMinutes, 'min');

    setStats({
      currentOverdue,
      markedOverdue,
      regularized: regularizedCount,
      totalOverdueMinutes,
      averageOverdueMinutes
    });
  };

  /**
   * Calcule le temps d'excès d'un véhicule en minutes
   * Pour les tickets affichés (en cours), calcule en temps réel
   * Pour l'historique, utilise updatedAt (moment de la régularisation)
   * 
   * Formule: (Temps actuel OU updatedAt - Heure de fin théorique)
   * Où Heure de fin théorique = Heure de début + Durée payée
   */
  const calculateOverdueMinutes = (reservation) => {
    const startTime = new Date(reservation.startAt);
    const endTime = new Date(reservation.startAt);
    endTime.setMinutes(endTime.getMinutes() + reservation.durationMinutes);
    
    // Pour les tickets actifs/signalés : temps réel
    // Pour les completed : figer au moment de updatedAt
    const referenceTime = (reservation.status === 'COMPLETED' || reservation.status === 'REGULARISE')
      ? new Date(reservation.updatedAt)
      : new Date();
    
    // Calcul: temps de référence - fin théorique = excès
    const overdueMinutes = Math.floor((referenceTime - endTime) / 1000 / 60);
    
    return Math.max(0, overdueMinutes); // Ne jamais retourner de valeur négative
  };

  // Fonction pour formater les minutes en heures et minutes
  const formatDuration = (minutes) => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (remainingMinutes === 0) {
      return `${hours}h`;
    }
    return `${hours}h ${remainingMinutes}min`;
  };

  const getSeverityClass = (minutes, status) => {
    if (status === 'SIGNALE') return 'signaled'; // Déjà signalé
    if (minutes > 60) return 'severe';
    if (minutes > 30) return 'moderate';
    return 'light';
  };

  const getSeverityLabel = (minutes, status) => {
    if (status === 'SIGNALE') return 'SIGNALÉ';
    if (minutes > 60) return 'GRAVE';
    if (minutes > 30) return 'MODÉRÉ';
    return 'LÉGER';
  };

  const getVehicleIcon = (type) => {
    const icons = {
      'CAR': '🚗',
      'MOTORCYCLE': '🏍️',
      'BICYCLE': '🚲',
      'TRUCK': '🚚',
      'ELECTRIC_SCOOTER': '🛴'
    };
    return icons[type] || '🚗';
  };

  const getVehicleLabel = (type) => {
    const labels = {
      'CAR': 'Voiture',
      'MOTORCYCLE': 'Moto',
      'TRUCK': 'Camion',
      'BICYCLE': 'Vélo',
      'ELECTRIC_SCOOTER': 'Trottinette'
    };
    return labels[type] || type;
  };

  const filteredReservations = overdueReservations
    .filter(res => {
      if (filter === 'all') return true;
      const minutes = calculateOverdueMinutes(res);
      if (filter === 'severe') return minutes > 60;
      if (filter === 'moderate') return minutes > 30 && minutes <= 60;
      return true;
    })
    .sort((a, b) => {
      if (a.address !== b.address) {
        return a.address.localeCompare(b.address);
      }
      const minutesA = calculateOverdueMinutes(a);
      const minutesB = calculateOverdueMinutes(b);
      return minutesB - minutesA;
    });

  const handleBackToHome = () => {
    navigate('/');
  };

  // Calcul de l'indice de saturation global
  const calculateSaturationIndex = () => {
    if (!parkingZones || parkingZones.length === 0) {
      return { level: 'normal', color: '🟢', label: 'Normal', class: 'saturation-normal' };
    }

    // Comptage des parkings par niveau de saturation
    const criticalCount = parkingZones.filter(z => z.occupationRate > 85).length;
    const highCount = parkingZones.filter(z => z.occupationRate > 70 && z.occupationRate <= 85).length;
    const totalParking = parkingZones.length;

    // Taux global de saturation critique
    const criticalRate = (criticalCount / totalParking) * 100;
    const highRate = (highCount / totalParking) * 100;

    // Logique de détermination de l'indice
    if (criticalCount >= 2 || criticalRate >= 30) {
      return { level: 'critique', color: '🔴', label: 'Critique', class: 'saturation-critical' };
    } else if (criticalCount >= 1 || highRate >= 40) {
      return { level: 'élevé', color: '🟠', label: 'Élevé', class: 'saturation-high' };
    } else {
      return { level: 'normal', color: '🟢', label: 'Normal', class: 'saturation-normal' };
    }
  };

  const saturationIndex = calculateSaturationIndex();

  return (
    <div className="agent-dashboard">
      <div className="dashboard-container">
        {/* Bouton retour amélioré */}
        <div className="top-navigation">
          <button onClick={handleBackToHome} className="back-button">
            <svg className="back-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="back-text">Retour à l'accueil</span>
          </button>
          <div className="dashboard-badge">
            <span className="badge-icon">🚔</span>
            <span className="badge-text">Dashboard Agent</span>
          </div>
        </div>

        <header className="dashboard-header">
          <h1>🚔 Contrôle Agent</h1>
          <p>Surveillance des excès de temps de stationnement</p>
        </header>

        {successMessage && (
          <div className="success-message">
            {successMessage}
          </div>
        )}

        {/* 1. STATISTIQUES GÉNÉRALES */}
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

          <div className="stats-grid stats-grid-compact">
            <div className="stat-card occupation-card">
              <div className="stat-number">
                {loading ? '...' : occupation.totalActive}
              </div>
              <div className="stat-label">🚗 Véhicules garés</div>
              <div className="occupation-bar">
                <div 
                  className="occupation-fill" 
                  style={{ width: `${occupation.occupationRate}%` }}
                ></div>
              </div>
              <div className="occupation-percentage">
                {occupation.occupationRate.toFixed(1)}% de remplissage
              </div>
            </div>
            <div className={`stat-card saturation-card ${saturationIndex.class}`}>
              <div className="stat-icon-large">{saturationIndex.color}</div>
              <div className="stat-label">� Indice de Saturation</div>
              <div className="stat-detail saturation-label">{saturationIndex.label}</div>
              <div className="saturation-info">
                {parkingZones.filter(z => z.occupationRate > 85).length > 0 && (
                  <span className="saturation-warning">
                    {parkingZones.filter(z => z.occupationRate > 85).length} parking(s) saturé(s)
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Nouvelles statistiques avancées */}
          <div className="stats-grid stats-advanced">
            {/* Parking le plus rempli */}
            {!loading && parkingZones.length > 0 && (
              <div className="stat-card fullest-parking-card">
                <div className="stat-label">🏆 Parking le plus rempli</div>
                <div className="stat-parking-name">{parkingZones[0].parkingName}</div>
                <div className="stat-parking-details">
                  <span className="stat-parking-numbers">
                    {parkingZones[0].occupiedPlaces} / {parkingZones[0].totalCapacity}
                  </span>
                  <span className="stat-parking-rate">
                    {parkingZones[0].occupationRate.toFixed(0)}%
                  </span>
                </div>
                <div className="stat-parking-bar">
                  <div 
                    className="stat-parking-fill"
                    style={{ 
                      width: `${parkingZones[0].occupationRate}%`,
                      backgroundColor: parkingZones[0].occupationRate > 85 ? '#EF4444' : parkingZones[0].occupationRate > 70 ? '#F59E0B' : '#10B981'
                    }}
                  ></div>
                </div>
              </div>
            )}

            {/* Indice de répartition */}
            {!loading && parkingZones.length > 0 && (
              <div className="stat-card distribution-card">
                <div className="stat-label">📊 Indice de répartition</div>
                {(() => {
                  const rates = parkingZones.map(z => z.occupationRate);
                  const avg = rates.reduce((a, b) => a + b, 0) / rates.length;
                  const variance = rates.reduce((sum, rate) => sum + Math.pow(rate - avg, 2), 0) / rates.length;
                  const stdDev = Math.sqrt(variance);
                  
                  let status, icon, color;
                  if (stdDev < 15) {
                    status = 'Équilibrée';
                    icon = '✅';
                    color = '#10B981';
                  } else if (stdDev < 25) {
                    status = 'Modérée';
                    icon = '⚠️';
                    color = '#F59E0B';
                  } else {
                    status = 'Déséquilibrée';
                    icon = '❌';
                    color = '#EF4444';
                  }
                  
                  return (
                    <>
                      <div className="stat-distribution-status" style={{ color }}>
                        <span className="stat-icon-large">{icon}</span>
                        <span className="stat-distribution-label">{status}</span>
                      </div>
                      <div className="stat-distribution-details">
                        Écart-type: {stdDev.toFixed(1)}%
                      </div>
                      <div className="stat-distribution-info">
                        {stdDev < 15 
                          ? 'Charge bien répartie entre parkings' 
                          : stdDev < 25
                            ? 'Quelques parkings surchargés'
                            : 'Forte concentration sur certains parkings'}
                      </div>
                    </>
                  );
                })()}
              </div>
            )}
          </div>
        </div>

        {/* 2. OCCUPATION PAR PARKING */}
        <div className="zones-section-main">
          <div className="section-header">
            <h2 className="section-title">
              <span className="section-icon">🅿️</span>
              Occupation par Parking
            </h2>
          </div>
          <div className="zones-grid">
            {loading ? (
              <div className="loading-zones">⟳ Chargement des zones...</div>
            ) : parkingZones.length === 0 ? (
              <div className="no-zones">Aucune donnée disponible</div>
            ) : (
              (() => {
                console.log('🖼️ RENDU: Affichage de', parkingZones.length, 'parkings');
                return parkingZones.map((zone, index) => (
                  <div 
                    key={index} 
                    className="zone-card"
                    onClick={() => handleParkingClick(zone.parkingName)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="zone-header">
                      <span className="zone-name">{zone.parkingName}</span>
                      <span className={`zone-status ${zone.occupationRate > 80 ? 'full' : zone.occupationRate > 60 ? 'busy' : 'available'}`}>
                        {zone.occupationRate > 80 ? '🔴' : zone.occupationRate > 60 ? '🟠' : '🟢'}
                      </span>
                    </div>
                    <div className="zone-stats">
                      <div className="zone-numbers">
                        <span className="zone-occupied">{zone.occupiedPlaces}</span>
                        <span className="zone-separator">/</span>
                        <span className="zone-capacity">{zone.totalCapacity}</span>
                      </div>
                      <div className="zone-available">
                        {zone.availablePlaces} place{zone.availablePlaces > 1 ? 's' : ''} libre{zone.availablePlaces > 1 ? 's' : ''}
                      </div>
                    </div>
                    <div className="zone-progress-bar">
                      <div 
                        className={`zone-progress-fill ${zone.occupationRate > 80 ? 'full' : zone.occupationRate > 60 ? 'busy' : ''}`}
                        style={{ width: `${zone.occupationRate}%` }}
                      ></div>
                    </div>
                    <div className="zone-percentage">
                      {zone.occupationRate.toFixed(0)}%
                    </div>
                  </div>
                ));
              })()
            )}
          </div>
        </div>

        {/* Modal véhicules d'un parking */}
        {selectedParking && (
          <div className="modal-backdrop" onClick={() => setSelectedParking(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="close-btn" onClick={() => setSelectedParking(null)}>✕</button>
              <h2 className="modal-title">🅿️ {selectedParking}</h2>
              
              {parkingVehicles.length === 0 ? (
                <div className="no-vehicles">Aucun véhicule dans ce parking</div>
              ) : (
                <table className="vehicle-table">
                  <thead>
                    <tr>
                      <th>Plaque</th>
                      <th>Type</th>
                      <th>Statut</th>
                      <th>Durée</th>
                      <th>Temps restant</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parkingVehicles.map((vehicle) => (
                      <tr key={vehicle.id}>
                        <td className="licence-plate">{vehicle.licencePlate}</td>
                        <td>{getVehicleLabel(vehicle.vehicleType)}</td>
                        <td>
                          <span className={`severity-badge ${
                            vehicle.status === 'SIGNALE' ? 'signaled' : 
                            calculateOverdueMinutes(vehicle) > 0 ? 'high' : 'ok'
                          }`}>
                            {vehicle.status === 'SIGNALE' ? '🚨 Signalé' : 
                             calculateOverdueMinutes(vehicle) > 0 ? '⏰ En excès' : '✅ OK'}
                          </span>
                        </td>
                        <td>{formatDuration(vehicle.durationMinutes)}</td>
                        <td>{calculateTimeRemaining(vehicle)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* 3. VÉHICULES EN EXCÈS - Statistiques */}
        <div className="overdue-stats-section">
          <div className="section-header">
            <h2 className="section-title">
              <span className="section-icon">🚨</span>
              Véhicules en Excès - Détails
            </h2>
          </div>

          <div className="stats-grid">
            <div className="stat-card current-overdue">
              <div className="stat-number">{loading ? '...' : stats.currentOverdue}</div>
              <div className="stat-label">⏰ En excès maintenant</div>
            </div>
            <div className="stat-card marked-overdue">
              <div className="stat-number">{loading ? '...' : stats.markedOverdue}</div>
              <div className="stat-label">🚨 Déjà Signalés</div>
            </div>
            <div className="stat-card regularized clickable" onClick={() => setShowHistory(true)} style={{ cursor: 'pointer' }}>
              <div className="stat-number">{loading ? '...' : stats.regularized}</div>
              <div className="stat-label">✅ Régularisés</div>
              <button className="history-button" onClick={(e) => { e.stopPropagation(); setShowHistory(true); }}>
                📜 Historique
              </button>
            </div>
            <div className="stat-card average-time">
              <div className="stat-number">
                {loading ? '...' : formatDuration(stats.averageOverdueMinutes || 0)}
              </div>
              <div className="stat-label">📊 Moyenne Excès</div>
              <div className="stat-detail">
                par véhicule en infraction
              </div>
            </div>
            <div className="stat-card total-overdue-time">
              <div className="stat-number">
                {loading ? '...' : formatDuration(stats.totalOverdueMinutes || 0)}
              </div>
              <div className="stat-label">⏱️ Temps Total Excès</div>
              <div className="stat-detail">
                somme de tous les excès
              </div>
            </div>
          </div>

          {/* Répartition par type et Top zones */}
          <div className="analytics-grid">
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

        {/* 4. INFRACTIONS PAR PARKING */}
        <div className="infractions-by-parking">
          <div className="section-header">
            <h2 className="section-title">
              <span className="section-icon">📋</span>
              Infractions par Parking
            </h2>
          </div>

          {loading ? (
            <div className="loading-state">⟳ Chargement...</div>
          ) : filteredReservations.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">✓</div>
              <p>Aucun véhicule en excès</p>
            </div>
          ) : (
            (() => {
              // Liste complète des parkings (5 parkings actifs)
              const allParkings = [
                'Parking Centre Ville',
                'Parking Gare',
                'Parking République',
                'Parking Liberté',
                'Parking Mairie'
              ];

              // Grouper les réservations par parking
              const byParking = filteredReservations.reduce((acc, res) => {
                const parking = res.address || 'Parking inconnu';
                if (!acc[parking]) acc[parking] = [];
                acc[parking].push(res);
                return acc;
              }, {});

              // Créer les sections pour tous les parkings
              return allParkings.map(parkingName => {
                const reservations = byParking[parkingName] || [];
                const hasInfractions = reservations.length > 0;

                return (
                  <div key={parkingName} className={`parking-infractions-section ${!hasInfractions ? 'empty-parking' : ''}`}>
                    <h3 className="parking-section-title">
                      <span>
                        🅿️ {parkingName}
                        {!hasInfractions && <span className="parking-status-ok"> ✓</span>}
                      </span>
                      <span className={`parking-infraction-count ${!hasInfractions ? 'zero-infractions' : ''}`}>
                        {hasInfractions 
                          ? `${reservations.length} infraction${reservations.length > 1 ? 's' : ''}`
                          : 'Aucune infraction'
                        }
                      </span>
                    </h3>
                    
                    {hasInfractions ? (
                      <div className="vehicles-grid">
                        {reservations.map(reservation => {
                          const overdueMinutes = calculateOverdueMinutes(reservation);
                          const severityClass = getSeverityClass(overdueMinutes, reservation.status);
                          const severityLabel = getSeverityLabel(overdueMinutes, reservation.status);
                          
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
                                  <span className="info-icon">🚗</span>
                                  <span className="info-label">Type:</span>
                                  <span className="info-value">{getVehicleLabel(reservation.vehicleType)}</span>
                                </div>
                                <div className="info-row">
                                  <span className="info-icon">⏱️</span>
                                  <span className="info-label">Durée payée:</span>
                                  <span className="info-value">{formatDuration(reservation.durationMinutes)}</span>
                                </div>
                                <div className="info-row">
                                  <span className="info-icon">⏰</span>
                                  <span className="info-label">Début:</span>
                                  <span className="info-value">
                                    {new Date(reservation.startAt).toLocaleTimeString('fr-FR', { 
                                      hour: '2-digit', 
                                      minute: '2-digit' 
                                    })}
                                  </span>
                                </div>
                                <div className="info-row highlight">
                                  <span className="info-icon">🚨</span>
                                  <span className="info-label">Excès:</span>
                                  <span className="info-value overdue">{formatDuration(overdueMinutes)}</span>
                                </div>
                              </div>
                              {reservation.status === 'ACTIVE' && (
                                <div className="action-buttons">
                                  <button 
                                    className="mark-button infraction-button"
                                    onClick={() => signalInfraction(reservation.id, reservation.licencePlate)}
                                  >
                                    🚨 Signaler l'infraction
                                  </button>
                                  <button 
                                    className="mark-button justified-button"
                                    onClick={() => regularizeInfraction(reservation.id, reservation.licencePlate)}
                                  >
                                    ✅ Excès régularisé
                                  </button>
                                </div>
                              )}
                              {reservation.status === 'SIGNALE' && (
                                <div className="action-buttons single-button">
                                  <div className="pending-badge">⚙️ En attente de régularisation</div>
                                  <button 
                                    className="mark-button justified-button full-width"
                                    onClick={() => regularizeInfraction(reservation.id, reservation.licencePlate)}
                                  >
                                    ✅ Régulariser maintenant
                                  </button>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="no-infractions-message">
                        <div className="no-infractions-icon">✅</div>
                        <p>Aucun véhicule en excès dans ce parking</p>
                      </div>
                    )}
                  </div>
                );
              });
            })()
          )}
        </div>

        <div className="update-info">
          ⟳ Actualisation automatique toutes les 30 secondes
        </div>

        {/* Modal Historique */}
        {showHistory && (
          <div className="modal-backdrop" onClick={() => setShowHistory(false)}>
            <div className="modal-content history-modal" onClick={(e) => e.stopPropagation()}>
              <button className="close-btn" onClick={() => setShowHistory(false)}>✕</button>
              <h2 className="modal-title">📜 Historique des Régularisations</h2>
              
              {history.length === 0 ? (
                <div className="no-history">
                  <div className="no-history-icon">📭</div>
                  <p>Aucun véhicule régularisé récemment</p>
                </div>
              ) : (
                <div className="history-list">
                  <div className="history-stats">
                    <span className="history-count">
                      {history.length} régularisation{history.length > 1 ? 's' : ''} aujourd'hui
                    </span>
                  </div>
                  <table className="history-table">
                    <thead>
                      <tr>
                        <th>Immatriculation</th>
                        <th>Type</th>
                        <th>Parking</th>
                        <th>Durée excès</th>
                        <th>Régularisé le</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history
                        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
                        .map((item) => {
                          const overdueMinutes = Math.floor(
                            (new Date(item.updatedAt) - new Date(item.startAt).setMinutes(
                              new Date(item.startAt).getMinutes() + item.durationMinutes
                            )) / 1000 / 60
                          );
                          return (
                            <tr key={item.id}>
                              <td className="licence-plate-history">{item.licencePlate}</td>
                              <td>{getVehicleLabel(item.vehicleType)}</td>
                              <td>{item.address}</td>
                              <td className="overdue-duration">{formatDuration(Math.max(0, overdueMinutes))}</td>
                              <td>
                                {new Date(item.updatedAt).toLocaleString('fr-FR', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AgentDashboard;
