import React, { useState } from 'react';
import { formatDuration } from '../../lib/overdue';
import RegularizedHistoryModal from './RegularizedHistoryModal';

/**
 * Composant Section 3: KPI des Excès
 * Affiche 5 cartes KPI avec animations et modale historique
 */
export default function OverdueKpis({ kpis, history, loading }) {
  const [showHistory, setShowHistory] = useState(false);

  if (loading) {
    return (
      <section className="kpi-section">
        <h2 className="section-title">📊 Statistiques des excès</h2>
        <div className="kpi-grid">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="kpi-card skeleton">
              <div className="skeleton-title"></div>
              <div className="skeleton-value"></div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  const {
    activeOverdue,
    signaled,
    regularized,
    averageOverdue,
    totalOverdueMinutes
  } = kpis;

  return (
    <>
      <section className="kpi-section">
        <h2 className="section-title">📊 Statistiques des excès</h2>
        <div className="kpi-grid">
          
          {/* KPI 1: En excès maintenant */}
          <KpiCard
            title="⏰ En excès maintenant"
            value={activeOverdue}
            color="warning"
            description="Véhicules ACTIVE dépassant leur durée payée"
          />

          {/* KPI 2: Déjà signalés */}
          <KpiCard
            title="🚨 Déjà signalés"
            value={signaled}
            color="danger"
            description="Véhicules marqués SIGNALE en attente"
          />

          {/* KPI 3: Régularisés avec bouton historique */}
          <div className="kpi-card kpi-card-success">
            <div className="kpi-header">
              <h3 className="kpi-title">✅ Régularisés</h3>
            </div>
            <div className="kpi-value">
              <AnimatedNumber value={regularized} />
            </div>
            <p className="kpi-description">
              Réservations passées au statut COMPLETED
            </p>
            <button
              className="btn-history"
              onClick={() => setShowHistory(true)}
              aria-label="Voir l'historique des régularisations"
            >
              📜 Voir l'historique
            </button>
          </div>

          {/* KPI 4: Moyenne excès */}
          <div className="kpi-card kpi-card-info">
            <div className="kpi-header">
              <h3 className="kpi-title">📊 Moyenne excès</h3>
            </div>
            <div className="kpi-value">
              <AnimatedNumber value={averageOverdue} />
              <span className="kpi-unit">min</span>
            </div>
            <p className="kpi-description">
              Moyenne des dépassements (tickets actifs en excès)
            </p>
          </div>

          {/* KPI 5: Temps total excès */}
          <div className="kpi-card kpi-card-danger">
            <div className="kpi-header">
              <h3 className="kpi-title">⏱️ Temps total excès</h3>
            </div>
            <div className="kpi-value-text">
              {formatDuration(totalOverdueMinutes)}
            </div>
            <p className="kpi-description">
              Somme des excès (actifs + signalés)
            </p>
          </div>

        </div>
      </section>

      {/* Modale historique */}
      {showHistory && (
        <RegularizedHistoryModal
          history={history}
          onClose={() => setShowHistory(false)}
        />
      )}
    </>
  );
}

/**
 * Carte KPI réutilisable
 */
function KpiCard({ title, value, color = 'default', description }) {
  return (
    <div className={`kpi-card kpi-card-${color}`}>
      <div className="kpi-header">
        <h3 className="kpi-title">{title}</h3>
      </div>
      <div className="kpi-value">
        <AnimatedNumber value={value} />
      </div>
      <p className="kpi-description">{description}</p>
    </div>
  );
}

/**
 * Composant d'animation de nombre (count-up)
 * Animation légère au changement de valeur
 */
function AnimatedNumber({ value }) {
  const [displayValue, setDisplayValue] = React.useState(value);

  React.useEffect(() => {
    // Animation simple: transition CSS gère l'effet
    setDisplayValue(value);
  }, [value]);

  return (
    <span className="count-up" key={displayValue}>
      {displayValue}
    </span>
  );
}
