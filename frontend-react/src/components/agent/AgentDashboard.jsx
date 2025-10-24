import React, { useState, useEffect } from 'react';
import { useAgentData } from '../../hooks/useAgentData';
import StatsGlobales from './StatsGlobales';
import OccupationGrid from './OccupationGrid';
import OverdueKpis from './OverdueKpis';
import OverdueTicketsByParking from './OverdueTicketsByParking';
import './AgentDashboard.css';

/**
 * Dashboard Agent Principal - Version Modernisée
 * Architecture modulaire avec calculs KPI côté front
 */
export default function AgentDashboard() {
  // Hook de gestion des données
  const {
    tickets,
    parkings,
    history,
    kpis,
    occupationByParking,
    globalStats,
    overdueGroups,
    loading,
    error,
    lastUpdate,
    signalVehicle,
    regularizeVehicle,
    refresh
  } = useAgentData();

  // Gestion des toasts
  const [toasts, setToasts] = useState([]);

  // Afficher un toast
  const showToast = (message, type = 'info') => {
    const id = Date.now();
    const newToast = { id, message, type };
    setToasts(prev => [...prev, newToast]);

    // Auto-suppression après 5 secondes
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  };

  // Gestion du signalement avec feedback
  const handleSignal = async (reservationId) => {
    const result = await signalVehicle(reservationId);
    
    if (result.success) {
      showToast('✅ Véhicule signalé avec succès', 'success');
    } else {
      showToast(`❌ Erreur: ${result.error}`, 'error');
    }
  };

  // Gestion de la régularisation avec feedback
  const handleRegularize = async (reservationId) => {
    const result = await regularizeVehicle(reservationId);
    
    if (result.success) {
      showToast('✅ Véhicule régularisé avec succès', 'success');
    } else {
      showToast(`❌ Erreur: ${result.error}`, 'error');
    }
  };

  // Logging pour debug (peut être retiré en prod)
  useEffect(() => {
    if (!loading) {
      console.log('📊 [AgentDashboard] État actuel:', {
        tickets: tickets.length,
        parkings: parkings.length,
        history: history.length,
        kpis,
        globalStats,
        overdueGroups: overdueGroups.length
      });
    }
  }, [loading, tickets, parkings, history, kpis, globalStats, overdueGroups]);

  return (
    <div className="agent-dashboard">
      {/* Header avec titre et actions */}
      <header className="dashboard-header">
        <div className="header-content">
          <h1 className="dashboard-title">
            🚔 Dashboard Agent - Contrôle Stationnement
          </h1>
          {lastUpdate && (
            <p className="last-update">
              Dernière mise à jour: {lastUpdate.toLocaleTimeString('fr-FR')}
            </p>
          )}
        </div>
        <div className="header-actions">
          <button
            className="btn-refresh"
            onClick={refresh}
            disabled={loading}
            aria-label="Rafraîchir les données"
          >
            {loading ? '⏳' : '🔄'} Actualiser
          </button>
        </div>
      </header>

      {/* Message d'erreur global */}
      {error && (
        <div className="error-banner" role="alert">
          ❌ {error}
        </div>
      )}

      {/* Sections principales */}
      <main className="dashboard-main">
        {/* Section 1: Statistiques Générales */}
        <StatsGlobales 
          globalStats={globalStats} 
          loading={loading} 
        />

        {/* Section 2: Occupation par Parking */}
        <OccupationGrid 
          occupationByParking={occupationByParking} 
          loading={loading} 
        />

        {/* Section 3: KPI des Excès */}
        <OverdueKpis 
          kpis={kpis} 
          history={history}
          loading={loading} 
        />

        {/* Section 4: Infractions par Parking */}
        <OverdueTicketsByParking 
          overdueGroups={overdueGroups}
          onSignal={handleSignal}
          onRegularize={handleRegularize}
          loading={loading} 
        />
      </main>

      {/* Système de toasts */}
      <ToastContainer toasts={toasts} onRemove={(id) => setToasts(prev => prev.filter(t => t.id !== id))} />
    </div>
  );
}

/**
 * Conteneur de toasts (notifications)
 */
function ToastContainer({ toasts, onRemove }) {
  if (toasts.length === 0) return null;

  return (
    <div className="toast-container" aria-live="polite" aria-atomic="true">
      {toasts.map(toast => (
        <Toast 
          key={toast.id} 
          toast={toast} 
          onClose={() => onRemove(toast.id)} 
        />
      ))}
    </div>
  );
}

/**
 * Toast individuel
 */
function Toast({ toast, onClose }) {
  const { message, type } = toast;

  return (
    <div className={`toast toast-${type}`} role="status">
      <span className="toast-message">{message}</span>
      <button 
        className="toast-close"
        onClick={onClose}
        aria-label="Fermer la notification"
      >
        ✕
      </button>
    </div>
  );
}
