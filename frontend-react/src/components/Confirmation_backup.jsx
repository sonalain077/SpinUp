import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Confirmation.css';

const Confirmation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // R├®cup├®ration des donn├®es de la r├®servation et du paiement
  const { reservationData, reservationResponse, amount, paymentMethod, success } = location.state || {};

  const handleBackToHome = () => {
    navigate('/');
  };

  const getPaymentMethodText = (method) => {
    switch (method) {
      case 'carte-bleue':
        return '­ƒÆ│ Carte Bleue';
      case 'lydia':
        return '­ƒô▒ Lydia';
      case 'paypal':
        return '­ƒîÉ PayPal';
      default:
        return '­ƒÆ│ Non sp├®cifi├®';
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
            <h1>Ô£à Confirmation</h1>
            <p>Votre r├®servation est confirm├®e !</p>
          </div>
        </div>
      </header>

      <main className="confirmation-content">
        {success && reservationData ? (
          <div className="confirmation-details">
            {/* Message de succ├¿s */}
            <div className="success-message">
              <h2>­ƒÄë Paiement confirm├® !</h2>
              <p>Votre place de parking a ├®t├® r├®serv├®e avec succ├¿s.</p>
            </div>

            {/* Informations essentielles */}
            <div className="reservation-info">
              <h3>­ƒôï D├®tails de votre r├®servation</h3>
              
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">­ƒåö Num├®ro de r├®servation :</span>
                  <span className="info-value">{reservationResponse?.reservationId || 'R-' + Date.now()}</span>
                </div>

                <div className="info-item">
                  <span className="info-label">­ƒÜù V├®hicule :</span>
                  <span className="info-value">{reservationData.licencePlate}</span>
                </div>

                <div className="info-item">
                  <span className="info-label">­ƒÅÀ´©Å Type :</span>
                  <span className="info-value">{reservationData.vehicleType}</span>
                </div>

                <div className="info-item">
                  <span className="info-label">­ƒôì Parking :</span>
                  <span className="info-value">{reservationData.address}</span>
                </div>

                {/* Informations temporelles regroup├®es */}
                <div className="info-item time-block">
                  <div className="time-info">
                    <div className="time-row">
                      <span className="time-label">ÔÅ░ D├®but :</span>
                      <span className="time-value">{new Date(reservationData.startAt).toLocaleString('fr-FR')}</span>
                    </div>
                    <div className="time-row">
                      <span className="time-label">ÔÅ▒´©Å Dur├®e :</span>
                      <span className="time-value">{formatDuration(reservationData.durationMinutes)}</span>
                    </div>
                    <div className="time-row">
                      <span className="time-label">ÔÅ░ Fin :</span>
                      <span className="time-value">
                        {new Date(new Date(reservationData.startAt).getTime() + reservationData.durationMinutes * 60000).toLocaleString('fr-FR')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="info-item payment">
                  <span className="info-label">­ƒÆ│ Mode de paiement :</span>
                  <span className="info-value">{getPaymentMethodText(paymentMethod)}</span>
                </div>

                <div className="info-item total">
                  <span className="info-label">­ƒÆ░ Montant pay├® :</span>
                  <span className="info-value">{amount}Ôé¼</span>
                </div>
              </div>
            </div>

            {/* Informations importantes */}
            <div className="important-info">
              <h4>ÔÜá´©Å Informations importantes</h4>
              <ul>
                <li>­ƒô▒ Conservez votre num├®ro de r├®servation : <strong>{reservationResponse?.reservationId || 'R-' + Date.now()}</strong></li>
                <li>­ƒÄ½ Une confirmation a ├®t├® envoy├®e par email. </li>
              </ul>
            </div>

            {/* Contact et support */}
            <div className="support-info">
              <h4>­ƒåÿ Besoin d'aide ?</h4>
              <p>Service client Park & See :</p>
              <ul>
                <li>­ƒô× 01 23 45 67 89</li>
                <li>­ƒôº support@parkandsee.fr</li>
                <li>­ƒòÆ Du lundi au vendredi, 8h-18h</li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="error-message">
            <h2>ÔØî Erreur</h2>
            <p>Aucune confirmation de r├®servation trouv├®e.</p>
            <p>Veuillez contacter le service client si vous pensez qu'il s'agit d'une erreur.</p>
          </div>
        )}

        {/* Action principale */}
        <div className="confirmation-actions">
          <button 
            className="home-button"
            onClick={handleBackToHome}
          >
            ­ƒÅá Retour ├á l'accueil
          </button>
        </div>
      </main>

      <footer>
        <p>Park & See - Phase 1 : Stationnement en parkings publics</p>
        <p>Merci de votre confiance ! ­ƒÜù</p>
      </footer>
    </div>
  );
};

export default Confirmation;
