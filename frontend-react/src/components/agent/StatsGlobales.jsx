import React from 'react';

/**
 * Composant Section 1: Statistiques Globales
 * Affiche 4 cartes principales avec infobulles explicatives
 */
export default function StatsGlobales({ globalStats, loading }) {
  if (loading) {
    return (
      <section className="stats-section">
        <h2 className="section-title">📊 Statistiques Générales</h2>
        <div className="stats-grid">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="stat-card skeleton">
              <div className="skeleton-title"></div>
              <div className="skeleton-value"></div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  const {
    totalVehicles,
    totalCapacity,
    globalPercentage,
    saturationIndex,
    mostFilledParking,
    distributionIndex
  } = globalStats;

  return (
    <section className="stats-section">
      <h2 className="section-title">📊 Statistiques Générales</h2>
      <div className="stats-grid">
        
        {/* Carte 1: Véhicules garés avec progress bar */}
        <div className="stat-card stat-card-large">
          <div className="stat-header">
            <h3 className="stat-title">🚗 Véhicules garés</h3>
            <Tooltip content="Nombre total de véhicules actuellement présents (ACTIVE + SIGNALE) sur l'ensemble des parkings." />
          </div>
          <div className="stat-value-large">
            <span className="count-up">{totalVehicles}</span>
            <span className="stat-capacity">/ {totalCapacity}</span>
          </div>
          <div className="progress-bar-container">
            <div 
              className={`progress-bar ${getProgressBarClass(globalPercentage)}`}
              style={{ width: `${globalPercentage}%` }}
              role="progressbar"
              aria-valuenow={globalPercentage}
              aria-valuemin="0"
              aria-valuemax="100"
              aria-label={`Occupation globale ${globalPercentage}%`}
            >
              <span className="progress-label">{globalPercentage}%</span>
            </div>
          </div>
          <p className="stat-description">
            Capacité globale utilisée à {globalPercentage}%
          </p>
        </div>

        {/* Carte 2: Indice de saturation */}
        <div className="stat-card">
          <div className="stat-header">
            <h3 className="stat-title">📈 Indice de saturation</h3>
            <Tooltip content="Moyenne des taux d'occupation de tous les parkings. Indique la pression globale sur le réseau." />
          </div>
          <div className="stat-value">
            <span className="count-up">{saturationIndex}</span>
            <span className="stat-unit">%</span>
          </div>
          <div className={`stat-badge badge-${getSaturationLevel(saturationIndex)}`}>
            {getSaturationLabel(saturationIndex)}
          </div>
        </div>

        {/* Carte 3: Parking le plus rempli */}
        <div className="stat-card">
          <div className="stat-header">
            <h3 className="stat-title">🎯 Parking le plus rempli</h3>
            <Tooltip content="Parking avec le taux d'occupation le plus élevé actuellement." />
          </div>
          <div className="stat-value-text">
            {mostFilledParking ? (
              <>
                <div className="parking-name">{mostFilledParking.name}</div>
                <div className="parking-occupation">
                  {mostFilledParking.occupation} / {mostFilledParking.capacity}
                  <span className="parking-percentage"> ({mostFilledParking.percentage}%)</span>
                </div>
              </>
            ) : (
              <div className="no-data">Aucune donnée</div>
            )}
          </div>
        </div>

        {/* Carte 4: Indice de répartition */}
        <div className="stat-card">
          <div className="stat-header">
            <h3 className="stat-title">⚖️ Indice de répartition</h3>
            <Tooltip content="Mesure l'équilibre de charge entre les parkings. 100 = parfaitement équilibré, 0 = très déséquilibré." />
          </div>
          <div className="stat-value">
            <span className="count-up">{distributionIndex}</span>
            <span className="stat-unit">/ 100</span>
          </div>
          <div className={`stat-badge badge-${getDistributionLevel(distributionIndex)}`}>
            {getDistributionLabel(distributionIndex)}
          </div>
        </div>

      </div>
    </section>
  );
}

/**
 * Composant Tooltip réutilisable
 */
function Tooltip({ content }) {
  const [visible, setVisible] = React.useState(false);

  return (
    <div className="tooltip-container">
      <button
        className="tooltip-trigger"
        aria-label="Information"
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        onFocus={() => setVisible(true)}
        onBlur={() => setVisible(false)}
      >
        <span className="info-icon">ℹ️</span>
      </button>
      {visible && (
        <div className="tooltip-content" role="tooltip">
          {content}
        </div>
      )}
    </div>
  );
}

/**
 * Utilitaires de rendu
 */
function getProgressBarClass(percentage) {
  if (percentage >= 70) return 'progress-high';
  if (percentage >= 30) return 'progress-medium';
  return 'progress-low';
}

function getSaturationLevel(index) {
  if (index >= 70) return 'high';
  if (index >= 40) return 'medium';
  return 'low';
}

function getSaturationLabel(index) {
  if (index >= 70) return 'Élevée';
  if (index >= 40) return 'Modérée';
  return 'Faible';
}

function getDistributionLevel(index) {
  if (index >= 70) return 'good';
  if (index >= 40) return 'medium';
  return 'poor';
}

function getDistributionLabel(index) {
  if (index >= 70) return 'Équilibrée';
  if (index >= 40) return 'Acceptable';
  return 'Déséquilibrée';
}
