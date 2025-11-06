import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getVehicleTypeLabel } from '../lib/vehicleTypes';
import './Confirmation.css';

const Confirmation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Récupération des données de la réservation et du paiement
  const { reservationData, reservationResponse, amount, paymentMethod, success, overdue, overdueMinutes, overdueAmount } = location.state || {};

  // 🔍 LOGS DE DEBUG
  console.log('🎯 Confirmation - État reçu:', location.state);
  console.log('🆔 reservationResponse:', reservationResponse);
  console.log('🆔 reservationResponse?.reservationId:', reservationResponse?.reservationId);

  const handleBackToHome = () => {
    navigate('/');
  };

  const handleGoToMesPlaces = () => {
    // Permettre à l'usager de lancer la sortie via le flux standard Mes Places
    navigate('/mes-places');
  };

  const handleQuitAfterRegularise = async () => {
    try {
      const id = reservationResponse?.reservationId;
      if (!id) {
        alert('ID de réservation manquant');
        return;
      }
      const resp = await fetch(`http://localhost:8081/api/parking/confirm-exit?reservationId=${id}`, {
        method: 'POST',
        headers: { 'Accept': 'application/json' }
      });
      if (!resp.ok) {
        throw new Error('Erreur lors de la sortie');
      }
      const data = await resp.json();
      alert(data.message || 'Véhicule sorti.');
      navigate('/parking-reservation');
    } catch (e) {
      console.error(e);
      alert("Une erreur est survenue lors de la sortie. Veuillez réessayer.");
    }
  };

  const getPaymentMethodText = (method) => {
    switch (method) {
      case 'carte-bleue':
        return '💳 Carte Bleue';
      case 'lydia':
        return '📱 Lydia';
      case 'paypal':
        return '💰 PayPal';
      default:
        return '💳 Non spécifié';
    }
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (hours > 0 && remainingMinutes > 0) {
      return `${hours}h ${remainingMinutes}min`;
    } else if (hours > 0) {
      return `${hours}h`;
    } else {
      return `${remainingMinutes}min`;
    }
  };

  return (
    <div className="confirmation-page">
      <header>
        <div className="header-content">
          <div className="header-text">
            <h1>✅ Confirmation</h1>
            <p>Votre réservation est confirmée !</p>
          </div>
        </div>
      </header>

      <main className="confirmation-content">
        {success && reservationData ? (
          <div className="confirmation-details">
            {/* Message de succès */}
            <div className="success-message">
              {overdue ? (
                <>
                  <h2>✅ Infraction régularisée</h2>
                  <p>Votre dépassement de {overdueMinutes} minute(s) a été réglé ({overdueAmount}€).</p>
                </>
              ) : (
                <>
                  <h2>🎉 Paiement confirmé !</h2>
                  <p>Votre place de parking a été réservée avec succès.</p>
                </>
              )}
            </div>

            {/* Informations essentielles */}
            <div className="reservation-info">
              <h3>📋 Détails de votre réservation</h3>
              
              {/* ID de réservation mis en avant */}
              <div className="reservation-id-highlight">
                <div className="id-label">🆔 Numéro de réservation {overdue ? '(régularisée)' : '(conservez-le pour retrouver votre place)'} :</div>
                <div className="id-value" title="Cliquez pour copier">
                  {reservationResponse?.reservationId || 'R-' + Date.now()}
                </div>
                <div className="id-help">💡 Utilisez cet identifiant dans "Voir mes places" pour consulter votre réservation</div>
              </div>
              
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">🚗 Véhicule :</span>
                  <span className="info-value">{reservationData.licencePlate}</span>
                </div>

                <div className="info-item">
                  <span className="info-label">🚙 Type :</span>
                  <span className="info-value">{getVehicleTypeLabel(reservationData.vehicleType)}</span>
                </div>

                <div className="info-item">
                  <span className="info-label">🏢 Parking :</span>
                  <span className="info-value">{reservationData.address}</span>
                </div>

                {/* Informations temporelles regroupées */}
                <div className="info-item time-block">
                  <div className="time-info">
                    <div className="time-row">
                      <span className="time-label">⏰ Début :</span>
                      <span className="time-value">{new Date(reservationData.startAt).toLocaleString('fr-FR')}</span>
                    </div>
                    <div className="time-row">
                      <span className="time-label">⏱️ Durée :</span>
                      <span className="time-value">{formatDuration(reservationData.durationMinutes)}</span>
                    </div>
                    <div className="time-row">
                      <span className="time-label">⏰ Fin :</span>
                      <span className="time-value">
                        {new Date(new Date(reservationData.startAt).getTime() + reservationData.durationMinutes * 60000).toLocaleString('fr-FR')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="info-item payment">
                  <span className="info-label">💳 Mode de paiement :</span>
                  <span className="info-value">{getPaymentMethodText(paymentMethod)}</span>
                </div>

                <div className="info-item total">
                  <span className="info-label">{overdue ? '💰 Montant régularisation :' : '💰 Montant payé :'}</span>
                  <span className="info-value">{amount}€</span>
                </div>
              </div>
            </div>

            {/* Informations importantes */}
            <div className="important-info">
              <h4>⚠️ Informations importantes</h4>
              <ul>
                <li>📱 Conservez votre numéro de réservation : <strong>{reservationResponse?.reservationId || 'R-' + Date.now()}</strong></li>
                {!overdue && <li>📧 Une confirmation a été envoyée par email. </li>}
                {overdue && <li>⚠️ Votre statut de réservation est maintenant: Régularisé.</li>}
              </ul>
            </div>

            {/* Contact et support */}
            <div className="support-info">
              <h4>🆘 Besoin d'aide ?</h4>
              <p>Service client Park & See :</p>
              <ul>
                <li>📞 01 23 45 67 89</li>
                <li>📧 support@parkandsee.fr</li>
                <li>🕒 Du lundi au vendredi, 8h-18h</li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="error-message">
            <h2>❌ Erreur</h2>
            <p>Aucune confirmation de réservation trouvée.</p>
            <p>Veuillez contacter le service client si vous pensez qu'il s'agit d'une erreur.</p>
          </div>
        )}

        {/* Action principale */}
        <div className="confirmation-actions">
          {overdue ? (
            <>
              <button 
                className="home-button"
                onClick={handleGoToMesPlaces}
              >
                🚗 Procéder à la sortie (Mes Places)
              </button>
              <div style={{height:10}} />
              <button 
                className="home-button"
                onClick={handleBackToHome}
              >
                🏠 Retour à l'accueil
              </button>
            </>
          ) : (
            <button 
              className="home-button"
              onClick={handleBackToHome}
            >
              🏠 Retour à l'accueil
            </button>
          )}
        </div>
      </main>

      <footer>
        <p>Park & See - Phase 1 : Stationnement en parkings publics</p>
        <p>Merci de votre confiance ! 🚗</p>
      </footer>
    </div>
  );
};

export default Confirmation;
