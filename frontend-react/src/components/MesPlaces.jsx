import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getVehicleTypeLabel } from '../lib/vehicleTypes';
import './MesPlaces.css';

const MesPlaces = () => {
  const navigate = useNavigate();
  const [reservationId, setReservationId] = useState('');
  const [reservation, setReservation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [exitLoading, setExitLoading] = useState(false);
  const [exitMessage, setExitMessage] = useState(null);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  // Fonction pour rechercher une réservation
  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!reservationId.trim()) {
      setError('Veuillez saisir un ID de réservation');
      return;
    }

    setLoading(true);
    setError('');
    setReservation(null);

    try {
      console.log('🔍 Recherche de la réservation:', reservationId);
      
      const response = await fetch(`http://localhost:8081/api/parking/reservations/${reservationId.trim()}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Réservation non trouvée. Vérifiez votre ID de réservation.');
        } else if (response.status === 403) {
          throw new Error('Accès non autorisé. Connectez-vous d\'abord.');
        } else {
          throw new Error(`Erreur ${response.status}: ${response.statusText}`);
        }
      }

      const data = await response.json();
      console.log('✅ Réservation trouvée:', data);
      setReservation(data);

    } catch (err) {
      console.error('❌ Erreur:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour formater la date
  const formatDate = (dateString) => {
    if (!dateString) return 'Non définie';
    const date = new Date(dateString);
    return date.toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Fonction pour calculer le temps restant/dépassé
  const calculateTimeStatus = (startAt, durationMinutes) => {
    if (!startAt || !durationMinutes) return { status: 'unknown', message: 'Données incomplètes' };
    
    const start = new Date(startAt);
    const end = new Date(start.getTime() + durationMinutes * 60000);
    const now = new Date();
    
    if (now < start) {
      const timeUntilStart = Math.ceil((start - now) / (1000 * 60));
      return { 
        status: 'future', 
        message: `Commence dans ${timeUntilStart} minute(s)`,
        className: 'future'
      };
    } else if (now < end) {
      const timeRemaining = Math.ceil((end - now) / (1000 * 60));
      return { 
        status: 'active', 
        message: `Temps restant: ${timeRemaining} minute(s)`,
        className: 'active'
      };
    } else {
      const overdue = Math.ceil((now - end) / (1000 * 60));
      return { 
        status: 'overdue', 
        message: `Dépassement: ${overdue} minute(s)`,
        className: 'overdue'
      };
    }
  };

  // Fonction pour obtenir l'emoji du statut
  const getStatusEmoji = (status) => {
    switch (status) {
      case 'ACTIVE': return '🟢';
      case 'COMPLETED': return '✅';
      case 'CANCELLED': return '❌';
      case 'OVERDUE': return '⚠️';
      case 'SIGNALE': return '🚨';
      case 'REGULARISE': return '✔️';
      default: return '❓';
    }
  };

  // Fonction pour vérifier si on peut quitter le parking
  const handleCheckExit = async () => {
    setExitLoading(true);
    setExitMessage(null);

    try {
      const response = await fetch(`http://localhost:8081/api/parking/check-exit?reservationId=${reservation.id}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la vérification de sortie');
      }

      const data = await response.json();
      
      if (data.canExit) {
        // Pas d'infraction - demander confirmation
        setShowExitConfirm(true);
        setExitMessage({ type: 'info', text: data.message });
      } else {
        // Infraction détectée - bloquer la sortie
        setExitMessage({ 
          type: 'error', 
          text: data.message,
          overdueMinutes: data.overdueMinutes,
          overdueAmount: data.overdueAmount
        });
      }

    } catch (err) {
      console.error('❌ Erreur:', err);
      setExitMessage({ type: 'error', text: 'Erreur lors de la vérification de sortie' });
    } finally {
      setExitLoading(false);
    }
  };

  // Fonction pour confirmer la sortie
  const handleConfirmExit = async () => {
    setExitLoading(true);

    try {
      const response = await fetch(`http://localhost:8081/api/parking/confirm-exit?reservationId=${reservation.id}`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la confirmation de sortie');
      }

      const data = await response.json();
      
      if (data.canExit) {
        // Succès - afficher message et rediriger
        setExitMessage({ type: 'success', text: data.message });
        setTimeout(() => {
          navigate('/parking-reservation');
        }, 2000);
      } else {
        // Ne devrait pas arriver si check-exit a été fait
        setExitMessage({ type: 'error', text: data.message });
      }

    } catch (err) {
      console.error('❌ Erreur:', err);
      setExitMessage({ type: 'error', text: 'Erreur lors de la confirmation de sortie' });
    } finally {
      setExitLoading(false);
      setShowExitConfirm(false);
    }
  };

  // Fonction pour annuler la sortie
  const handleCancelExit = () => {
    setShowExitConfirm(false);
    setExitMessage(null);
  };

  return (
    <div className="mes-places-page">
      <header>
        <div className="header-content">
          <button 
            className="back-button" 
            onClick={() => navigate('/parking-reservation')}
          >
            ← Retour
          </button>
          <div className="header-title">
            <h1>📋 Mes Places de Parking</h1>
            <p>Recherchez vos réservations par ID</p>
          </div>
        </div>
      </header>

      <main className="search-container">
        {/* Formulaire de recherche */}
        <div className="search-form-container">
          <form onSubmit={handleSearch} className="search-form">
            <div className="form-group">
              <label htmlFor="reservationId">ID de réservation :</label>
              <input
                type="text"
                id="reservationId"
                value={reservationId}
                onChange={(e) => setReservationId(e.target.value)}
                placeholder="Exemple: d6185945-ea73-4587-a9e6-3910a1940bf8"
                className="search-input"
                disabled={loading}
              />
            </div>
            
            <button 
              type="submit" 
              disabled={loading || !reservationId.trim()}
              className={`search-btn ${loading ? 'loading' : ''}`}
            >
              {loading ? (
                <>
                  <span className="spinner">⏳</span>
                  Recherche...
                </>
              ) : (
                <>🔍 Rechercher</>
              )}
            </button>
          </form>

          {/* Message d'aide */}
          <div className="help-message">
            💡 <strong>Conseil :</strong> Votre ID de réservation vous a été communiqué lors de votre réservation. 
            Il s'agit d'un identifiant unique au format UUID (par exemple : d6185945-ea73-4587-a9e6-3910a1940bf8).
            Vous le trouverez sur votre page de confirmation après avoir effectué votre réservation.
          </div>
        </div>

        {/* Affichage des erreurs */}
        {error && (
          <div className="error-message">
            ❌ <strong>Erreur :</strong> {error}
          </div>
        )}

        {/* Affichage des résultats */}
        {reservation && (
          <div className="reservation-details">
            <div className="reservation-card">
              <div className="reservation-header">
                <h2>
                  {getStatusEmoji(reservation.status)} 
                  Réservation {reservation.id}
                </h2>
                <div className={`status-badge ${reservation.status.toLowerCase()}`}>
                  {reservation.status}
                </div>
              </div>

              <div className="reservation-info">
                <div className="info-section">
                  <h3>🚗 Véhicule</h3>
                  <div className="info-row">
                    <span className="label">Plaque d'immatriculation :</span>
                    <span className="value">{reservation.licencePlate}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Type de véhicule :</span>
                    <span className="value">{getVehicleTypeLabel(reservation.vehicleType)}</span>
                  </div>
                </div>

                <div className="info-section">
                  <h3>📅 Horaires</h3>
                  <div className="info-row">
                    <span className="label">Début :</span>
                    <span className="value">{formatDate(reservation.startAt)}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Durée :</span>
                    <span className="value">{reservation.durationMinutes} minutes</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Fin prévue :</span>
                    <span className="value">
                      {formatDate(new Date(new Date(reservation.startAt).getTime() + reservation.durationMinutes * 60000))}
                    </span>
                  </div>
                  
                  {reservation.status === 'ACTIVE' && (
                    <div className="time-status">
                      {(() => {
                        const timeStatus = calculateTimeStatus(reservation.startAt, reservation.durationMinutes);
                        return (
                          <div className={`time-indicator ${timeStatus.className}`}>
                            {timeStatus.message}
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>

                <div className="info-section">
                  <h3>📍 Parking</h3>
                  <div className="info-row">
                    <span className="label">Adresse :</span>
                    <span className="value">{reservation.address}</span>
                  </div>
                </div>

                <div className="info-section">
                  <h3>💰 Paiement</h3>
                  <div className="info-row">
                    <span className="label">Montant payé :</span>
                    <span className="value price">{reservation.paymentAmount}€</span>
                  </div>
                </div>

                <div className="info-section">
                  <h3>📊 Données techniques</h3>
                  <div className="info-row">
                    <span className="label">Créé le :</span>
                    <span className="value">{formatDate(reservation.createdAt)}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Mis à jour :</span>
                    <span className="value">{formatDate(reservation.updatedAt)}</span>
                  </div>
                </div>
              </div>

              {/* Bouton Quitter le parking */}
              {reservation.status === 'ACTIVE' && !showExitConfirm && (
                <div className="exit-section">
                  <button
                    className="exit-button"
                    onClick={handleCheckExit}
                    disabled={exitLoading}
                  >
                    {exitLoading ? '⏳ Vérification...' : '🚪 Quitter le parking'}
                  </button>
                </div>
              )}

              {/* Message de sortie */}
              {exitMessage && (
                <div className={`exit-message ${exitMessage.type}`}>
                  {exitMessage.type === 'error' && exitMessage.overdueMinutes && (
                    <div className="overdue-details">
                      <p><strong>⚠️ Infraction détectée</strong></p>
                      <p>{exitMessage.text}</p>
                      <p className="overdue-info">
                        💰 Montant dû : <strong>{exitMessage.overdueAmount.toFixed(2)}€</strong>
                      </p>
                      <button 
                        className="regularize-button"
                        onClick={() => navigate('/rallonger-stationnement')}
                      >
                        📝 Régulariser maintenant
                      </button>
                    </div>
                  )}
                  {exitMessage.type !== 'error' && <p>{exitMessage.text}</p>}
                </div>
              )}

              {/* Confirmation de sortie */}
              {showExitConfirm && (
                <div className="exit-confirmation">
                  <h3>⚠️ Confirmer la sortie</h3>
                  <p>Êtes-vous sûr de vouloir quitter le parking ? Cette action supprimera votre réservation.</p>
                  <div className="confirmation-buttons">
                    <button 
                      className="cancel-button"
                      onClick={handleCancelExit}
                      disabled={exitLoading}
                    >
                      ❌ Annuler
                    </button>
                    <button 
                      className="confirm-button"
                      onClick={handleConfirmExit}
                      disabled={exitLoading}
                    >
                      {exitLoading ? '⏳ Traitement...' : '✅ Confirmer la sortie'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default MesPlaces;