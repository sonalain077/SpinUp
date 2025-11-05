import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './ExtensionConfirmation.css';

const ExtensionConfirmation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Récupération des données depuis la navigation
  const { reservation, extensionDuration, extensionPrice, paymentMethod, success } = location.state || {};

  const getPaymentMethodLabel = (method) => {
    switch (method) {
      case 'carte-bleue': return '💳 Carte Bleue';
      case 'lydia': return '📱 Lydia';
      case 'paypal': return '🌐 PayPal';
      default: return method;
    }
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0 && mins > 0) {
      return `${hours}h ${mins}min`;
    } else if (hours > 0) {
      return `${hours}h`;
    } else {
      return `${mins}min`;
    }
  };

  const calculateNewEndTime = () => {
    if (reservation && extensionDuration) {
      const currentEndTime = new Date(reservation.endAt);
      const newEndTime = new Date(currentEndTime.getTime() + extensionDuration * 60000);
      return newEndTime;
    }
    return null;
  };

  const newEndTime = calculateNewEndTime();

  return (
    <div className="extension-confirmation">
      <header>
        <div className="header-content">
          <div className="header-text">
            <h1>✅ Extension Confirmée</h1>
            <p>Votre stationnement a été rallongé avec succès</p>
          </div>
        </div>
      </header>

      <main className="confirmation-content">
        {success && reservation ? (
          <>
            {/* Message de succès */}
            <div className="success-message">
              <div className="success-icon">🎉</div>
              <h2>Paiement effectué avec succès !</h2>
              <p>Votre stationnement a été rallongé et le paiement a été traité.</p>
            </div>

            {/* Détails de l'extension */}
            <div className="extension-details">
              <h3>📋 Détails de l'extension</h3>
              
              <div className="detail-section">
                <h4>🚗 Informations du véhicule</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="label">Plaque d'immatriculation :</span>
                    <span className="value">{reservation.licencePlate}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Type de véhicule :</span>
                    <span className="value">
                      {reservation.vehicleType === 'CAR' ? 'Voiture' : 
                       reservation.vehicleType === 'MOTORCYCLE' ? '2 roues' : 'Camionnette'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h4>📍 Informations de parking</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="label">Adresse :</span>
                    <span className="value">{reservation.address}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">ID de réservation :</span>
                    <span className="value">{reservation.id}</span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h4>⏰ Informations temporelles</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="label">Fin précédente :</span>
                    <span className="value">{new Date(reservation.endAt).toLocaleString('fr-FR')}</span>
                  </div>
                  <div className="detail-item highlight">
                    <span className="label">Nouvelle fin :</span>
                    <span className="value">{newEndTime ? newEndTime.toLocaleString('fr-FR') : 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Extension :</span>
                    <span className="value">+ {formatDuration(extensionDuration)}</span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h4>💰 Informations de paiement</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="label">Méthode de paiement :</span>
                    <span className="value">{getPaymentMethodLabel(paymentMethod)}</span>
                  </div>
                  <div className="detail-item highlight">
                    <span className="label">Montant payé :</span>
                    <span className="value">{extensionPrice}€</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Statut :</span>
                    <span className="value success-text">✅ Paiement confirmé</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Informations importantes */}
            <div className="important-info">
              <h3>📢 Informations importantes</h3>
              <div className="info-list">
                <div className="info-item">
                  <span className="icon">⏰</span>
                  <span className="text">
                    Votre stationnement est maintenant valable jusqu'au <strong>{newEndTime ? newEndTime.toLocaleString('fr-FR') : 'N/A'}</strong>
                  </span>
                </div>
                <div className="info-item">
                  <span className="icon">📱</span>
                  <span className="text">
                    Conservez cette confirmation ou votre numéro de réservation <strong>{reservation.id}</strong>
                  </span>
                </div>
                <div className="info-item">
                  <span className="icon">🚗</span>
                  <span className="text">
                    Assurez-vous que votre véhicule reste sur la place réservée
                  </span>
                </div>
                <div className="info-item">
                  <span className="icon">💡</span>
                  <span className="text">
                    Vous pouvez rallonger à nouveau votre stationnement si nécessaire
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="confirmation-actions">
              <button 
                className="secondary-btn"
                onClick={() => navigate('/rallonger-stationnement')}
              >
                ⏰ Nouvelle extension
              </button>
              <button 
                className="secondary-btn"
                onClick={() => navigate('/mes-places')}
              >
                👁️ Voir mes places
              </button>
              <button 
                className="primary-btn"
                onClick={() => navigate('/')}
              >
                🏠 Retour à l'accueil
              </button>
            </div>
          </>
        ) : (
          <div className="error-state">
            <div className="error-icon">❌</div>
            <h2>Erreur</h2>
            <p>Impossible de charger les détails de la confirmation.</p>
            <button 
              className="primary-btn"
              onClick={() => navigate('/rallonger-stationnement')}
            >
              ← Retour à l'extension
            </button>
          </div>
        )}
      </main>

      <footer>
        <p>Park & See - Extension de stationnement confirmée</p>
      </footer>
    </div>
  );
};

export default ExtensionConfirmation;