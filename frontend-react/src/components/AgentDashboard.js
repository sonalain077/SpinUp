import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AgentDashboard.css';

const AgentDashboard = () => {
  const navigate = useNavigate();
  const [parkingData, setParkingData] = useState([]);
  const [totalSpaces, setTotalSpaces] = useState(0);
  const [occupiedSpaces, setOccupiedSpaces] = useState(0);
  const [revenueToday, setRevenueToday] = useState(0);

  // Simulation de données de parking
  useEffect(() => {
    // Simulation d'une API call
    const mockParkingData = [
      {
        id: 1,
        zone: "Zone A",
        totalSpaces: 50,
        occupiedSpaces: 35,
        freeSpaces: 15,
        revenue: 245.50
      },
      {
        id: 2,
        zone: "Zone B", 
        totalSpaces: 30,
        occupiedSpaces: 22,
        freeSpaces: 8,
        revenue: 156.80
      },
      {
        id: 3,
        zone: "Zone C",
        totalSpaces: 40,
        occupiedSpaces: 28,
        freeSpaces: 12,
        revenue: 198.20
      }
    ];

    setParkingData(mockParkingData);
    
    // Calcul des totaux
    const total = mockParkingData.reduce((sum, zone) => sum + zone.totalSpaces, 0);
    const occupied = mockParkingData.reduce((sum, zone) => sum + zone.occupiedSpaces, 0);
    const revenue = mockParkingData.reduce((sum, zone) => sum + zone.revenue, 0);
    
    setTotalSpaces(total);
    setOccupiedSpaces(occupied);
    setRevenueToday(revenue);
  }, []);

  const occupancyRate = totalSpaces > 0 ? ((occupiedSpaces / totalSpaces) * 100).toFixed(1) : 0;

  const handleBackToHome = () => {
    navigate('/');
  };

  const handleZoneDetails = (zoneId) => {
    // Navigation vers les détails d'une zone (à implémenter)
    console.log(`Navigating to zone ${zoneId} details`);
  };

  const handleOverdueControl = () => {
    navigate('/agent/overdue');
  };

  return (
    <div className="agent-dashboard">
      <div className="dashboard-container">
        <header className="dashboard-header">
          <div className="header-content">
            <h1>Dashboard Agent</h1>
            <p>Contrôle en temps réel du stationnement</p>
          </div>
          <button onClick={handleBackToHome} className="back-button">
            ← Retour
          </button>
        </header>

        {/* Statistiques générales */}
        <div className="stats-grid">
          <div className="stat-card total-spaces">
            <div className="stat-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                <path d="M3 6L3 18C3 19.1046 3.89543 20 5 20L19 20C20.1046 20 21 19.1046 21 18L21 6C21 4.89543 20.1046 4 19 4L5 4C3.89543 4 3 4.89543 3 6Z" stroke="currentColor" strokeWidth="2"/>
                <path d="M8 8L16 8" stroke="currentColor" strokeWidth="2"/>
                <path d="M8 12L16 12" stroke="currentColor" strokeWidth="2"/>
                <path d="M8 16L16 16" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
            <div className="stat-info">
              <h3>{totalSpaces}</h3>
              <p>Places totales</p>
            </div>
          </div>

          <div className="stat-card occupied-spaces">
            <div className="stat-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                <path d="M9 17C9.5 17 10 16.5 10 16V12C10 11.5 9.5 11 9 11S8 11.5 8 12V16C8 16.5 8.5 17 9 17Z" fill="currentColor"/>
                <path d="M15 17C15.5 17 16 16.5 16 16V8C16 7.5 15.5 7 15 7S14 7.5 14 8V16C14 16.5 14.5 17 15 17Z" fill="currentColor"/>
                <path d="M3 21V19C3 18.5 3.5 18 4 18H20C20.5 18 21 18.5 21 19V21H3Z" fill="currentColor"/>
              </svg>
            </div>
            <div className="stat-info">
              <h3>{occupiedSpaces}</h3>
              <p>Places occupées</p>
            </div>
          </div>

          <div className="stat-card occupancy-rate">
            <div className="stat-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                <path d="M8 12L11 15L16 9" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
            <div className="stat-info">
              <h3>{occupancyRate}%</h3>
              <p>Taux d'occupation</p>
            </div>
          </div>

          <div className="stat-card revenue">
            <div className="stat-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                <path d="M12 2V22M17 5H9.5C8.11929 5 7 6.11929 7 7.5C7 8.88071 8.11929 10 9.5 10H14.5C15.8807 10 17 11.1193 17 12.5C17 13.8807 15.8807 15 14.5 15H7" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
            <div className="stat-info">
              <h3>{revenueToday.toFixed(2)}€</h3>
              <p>Recettes du jour</p>
            </div>
          </div>
        </div>

        {/* Zones de stationnement */}
        <div className="zones-section">
          <h2>Zones de stationnement</h2>
          <div className="zones-grid">
            {parkingData.map((zone) => (
              <div key={zone.id} className="zone-card" onClick={() => handleZoneDetails(zone.id)}>
                <div className="zone-header">
                  <h3>{zone.zone}</h3>
                  <span className={`status ${zone.freeSpaces < 5 ? 'critical' : zone.freeSpaces < 10 ? 'warning' : 'good'}`}>
                    {zone.freeSpaces < 5 ? 'Critique' : zone.freeSpaces < 10 ? 'Attention' : 'OK'}
                  </span>
                </div>
                
                <div className="zone-stats">
                  <div className="zone-stat">
                    <span className="label">Occupées:</span>
                    <span className="value">{zone.occupiedSpaces}/{zone.totalSpaces}</span>
                  </div>
                  <div className="zone-stat">
                    <span className="label">Libres:</span>
                    <span className="value">{zone.freeSpaces}</span>
                  </div>
                  <div className="zone-stat">
                    <span className="label">Recettes:</span>
                    <span className="value">{zone.revenue.toFixed(2)}€</span>
                  </div>
                </div>

                <div className="zone-occupancy">
                  <div className="occupancy-bar">
                    <div 
                      className="occupancy-fill" 
                      style={{ width: `${(zone.occupiedSpaces / zone.totalSpaces) * 100}%` }}
                    ></div>
                  </div>
                  <span className="occupancy-text">
                    {((zone.occupiedSpaces / zone.totalSpaces) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions rapides */}
        <div className="quick-actions">
          <h2>Actions rapides</h2>
          <div className="actions-grid">
            <button className="action-button" onClick={handleOverdueControl}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2"/>
                <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2"/>
                <path d="M16 16L12 12" stroke="#EF4444" strokeWidth="2"/>
              </svg>
              Contrôle excès temps
            </button>
            
            <button className="action-button">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M15 3H6C4.89543 3 4 3.89543 4 5V19C4 20.1046 4.89543 21 6 21H18C19.1046 21 20 20.1046 20 19V8L15 3Z" stroke="currentColor" strokeWidth="2"/>
                <path d="M14 3V9H20" stroke="currentColor" strokeWidth="2"/>
                <path d="M10 12L14 16M14 12L10 16" stroke="currentColor" strokeWidth="2"/>
              </svg>
              Générer rapport
            </button>
            
            <button className="action-button">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M22 11.08V12C21.9996 14.7712 21.0818 17.4815 19.3779 19.7195C17.674 21.9575 15.2738 23.5951 12.5668 24.3866C9.85976 25.178 6.99043 25.0813 4.34112 24.1084C1.69181 23.1355 -0.616134 21.3384 -1.86267 19.0002C-3.10921 16.662 -3.20189 13.9304 -2.11982 11.5183C-1.03774 9.10625 0.950936 7.14794 3.35304 6.04717C5.75515 4.9464 8.48221 4.78717 11.0121 5.59365C13.542 6.39913 15.6879 8.11073 17.02 10.38" stroke="currentColor" strokeWidth="2"/>
                <path d="M22 4L12 14.01L9 11.01" stroke="currentColor" strokeWidth="2"/>
              </svg>
              Contrôle terrain
            </button>
            
            <button className="action-button">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M18 8C18 6.34315 16.6569 5 15 5H9C7.34315 5 6 6.34315 6 8C6 9.65685 7.34315 11 9 11H15C16.6569 11 18 9.65685 18 8Z" stroke="currentColor" strokeWidth="2"/>
                <path d="M2 2L22 22" stroke="currentColor" strokeWidth="2"/>
                <path d="M6 15L18 3" stroke="currentColor" strokeWidth="2"/>
              </svg>
              Signaler incident
            </button>
            
            <button className="action-button">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2"/>
                <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2"/>
              </svg>
              Historique
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentDashboard;