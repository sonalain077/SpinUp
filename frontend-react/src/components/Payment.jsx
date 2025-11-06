import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getVehicleTypeLabel } from '../lib/vehicleTypes';
import { createReservation } from '../services/reservationApi';
import './Payment.css';

const Payment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Récupération des données de réservation
  const { reservationData, reservationResponse, amount } = location.state || {};
  
  // État pour le mode de paiement
  const [paymentMethod, setPaymentMethod] = useState('');
  const [paymentData, setPaymentData] = useState({
    // Carte bleue
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
    // Lydia
    lydiaPhone: '',
    // PayPal
    paypalEmail: ''
  });
  
  // Validation des champs de paiement
  const isPaymentComplete = () => {
    switch (paymentMethod) {
      case 'carte-bleue':
        return paymentData.cardNumber.length === 19 && 
               paymentData.cardName.trim() !== '' && 
               paymentData.expiryDate.length === 5 && 
               paymentData.cvv.length === 3;
      case 'lydia':
        console.log('Lydia validation - phone:', paymentData.lydiaPhone, 'length:', paymentData.lydiaPhone.length);
        return paymentData.lydiaPhone.length === 12; // Format: +33 + 9 chiffres = 12 caractères
      case 'paypal':
        return paymentData.paypalEmail.includes('@') && paymentData.paypalEmail.includes('.');
      default:
        return false;
    }
  };

  const handleBackToReservation = () => {
    navigate('/reservation');
  };

  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method);
    // Réinitialiser les données de paiement
    setPaymentData({
      cardNumber: '',
      cardName: '',
      expiryDate: '',
      cvv: '',
      lydiaPhone: '',
      paypalEmail: ''
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    // Formatage spécifique selon le champ
    switch (name) {
      case 'cardNumber':
        // Format: XXXX XXXX XXXX XXXX
        formattedValue = value.replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1 ').substring(0, 19);
        break;
      case 'expiryDate':
        // Format: MM/YY
        formattedValue = value.replace(/\D/g, '').replace(/(\d{2})(\d{1,2})/, '$1/$2').substring(0, 5);
        break;
      case 'cvv':
        // 3 chiffres maximum
        formattedValue = value.replace(/\D/g, '').substring(0, 3);
        break;
      case 'cardName':
        // Seuls les caractères alphanumériques, espaces, tirets et apostrophes sont autorisés
        formattedValue = value.replace(/[^a-zA-Z0-9\s\-']/g, '').toUpperCase();
        break;
      case 'lydiaPhone':
        // Format simple: +33 suivi de 9 chiffres sans espaces
        const cleaned = value.replace(/\D/g, '');
        let phoneDigits = '';
        
        // Gestion des différents formats d'entrée
        if (cleaned.startsWith('33')) {
          phoneDigits = cleaned.substring(2, 11); // Prendre max 9 chiffres après 33
        } else if (cleaned.startsWith('0')) {
          phoneDigits = cleaned.substring(1, 10); // Prendre max 9 chiffres après 0
        } else {
          phoneDigits = cleaned.substring(0, 9); // Prendre max 9 chiffres
        }
        
        // Format final simple : +33 + 9 chiffres
        formattedValue = '+33' + phoneDigits;
        break;
      default:
        break;
    }

    setPaymentData(prev => ({
      ...prev,
      [name]: formattedValue
    }));
  };

  const handlePayment = async () => {
    if (!isPaymentComplete()) {
      alert('Veuillez compléter toutes les informations de paiement.');
      return;
    }

    try {
      // Simulation du traitement du paiement
      console.log('💳 Traitement du paiement...');
      console.log('Méthode:', paymentMethod);
      console.log('Données:', paymentData);
      console.log('Montant:', amount);

      // Mapper la méthode de paiement au format API
      const paymentMethodMap = {
        'carte-bleue': 'CARD',
        'lydia': 'LYDIA',
        'paypal': 'PAYPAL'
      };
      const apiPaymentMethod = paymentMethodMap[paymentMethod] || 'CARD';

      // Appeler l'API de création de réservation
      console.log('🚀 Appel API de création de réservation...');
      const response = await createReservation({
        plate: reservationData.licencePlate,
        vehicleType: reservationData.vehicleType,
        parkingId: reservationData.parkingId,
        startAt: reservationData.startAt,
        durationMinutes: reservationData.durationMinutes,
        paymentMethod: apiPaymentMethod,
        amountCents: reservationData.amountCents
      });

      console.log('✅ Réservation créée:', response);

      // Redirection vers la page de confirmation avec la réponse de l'API
      navigate('/confirmation', {
        state: {
          reservationData,
          reservationResponse: response,
          amount,
          paymentMethod,
          success: true
        }
      });
    } catch (error) {
      console.error('❌ Erreur lors du paiement:', error);
      alert(`Erreur lors de la création de la réservation: ${error.message || 'Veuillez réessayer.'}`);
    }
  };

  return (
    <div className="payment-page">
      <header>
        <div className="header-content">
          <button 
            className="back-button" 
            onClick={handleBackToReservation}
          >
            ← Retour
          </button>
          <div className="header-text">
            <h1>💳 Paiement</h1>
            <p>Finalisation de votre réservation</p>
          </div>
        </div>
      </header>

      <main className="payment-content">
        {reservationData ? (
          <>
            {/* Récapitulatif de la réservation */}
            <div className="reservation-summary">
              <h2>📋 Récapitulatif de votre réservation</h2>
              
              <div className="summary-details">
                <div className="detail-row">
                  <span className="label">🚗 Véhicule :</span>
                  <span className="value">{reservationData.licencePlate} ({getVehicleTypeLabel(reservationData.vehicleType)})</span>
                </div>
                
                <div className="detail-row">
                  <span className="label">📍 Parking :</span>
                  <span className="value">{reservationData.address}</span>
                </div>
                
                <div className="detail-row">
                  <span className="label">⏰ Début :</span>
                  <span className="value">{new Date(reservationData.startAt).toLocaleString('fr-FR')}</span>
                </div>
                
                <div className="detail-row">
                  <span className="label">⏱️ Durée :</span>
                  <span className="value">{Math.floor(reservationData.durationMinutes / 60)}h {reservationData.durationMinutes % 60}min</span>
                </div>
                
                <div className="detail-row total">
                  <span className="label">💰 Montant total :</span>
                  <span className="value">{amount}€</span>
                </div>
              </div>
            </div>

            {/* Choix du mode de paiement */}
            <div className="payment-methods">
              <h3>🎯 Choisissez votre mode de paiement</h3>
              
              <div className="payment-options">
                <label className={`payment-option ${paymentMethod === 'carte-bleue' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="carte-bleue"
                    checked={paymentMethod === 'carte-bleue'}
                    onChange={(e) => handlePaymentMethodChange(e.target.value)}
                  />
                  <span className="option-text">💳 Carte Bleue</span>
                </label>

                <label className={`payment-option ${paymentMethod === 'lydia' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="lydia"
                    checked={paymentMethod === 'lydia'}
                    onChange={(e) => handlePaymentMethodChange(e.target.value)}
                  />
                  <span className="option-text">📱 Lydia</span>
                </label>

                <label className={`payment-option ${paymentMethod === 'paypal' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="paypal"
                    checked={paymentMethod === 'paypal'}
                    onChange={(e) => handlePaymentMethodChange(e.target.value)}
                  />
                  <span className="option-text">🌐 PayPal</span>
                </label>
              </div>
            </div>

            {/* Formulaires spécifiques selon le mode de paiement */}
            {paymentMethod === 'carte-bleue' && (
              <div className="payment-form">
                <h4>💳 Informations de carte bancaire</h4>
                
                <div className="form-group">
                  <label htmlFor="cardNumber">Numéro de carte :</label>
                  <input
                    type="text"
                    id="cardNumber"
                    name="cardNumber"
                    value={paymentData.cardNumber}
                    onChange={handleInputChange}
                    placeholder="XXXX XXXX XXXX XXXX"
                    maxLength="19"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="cardName">Nom sur la carte :</label>
                  <input
                    type="text"
                    id="cardName"
                    name="cardName"
                    value={paymentData.cardName}
                    onChange={handleInputChange}
                    placeholder="Jean DUPONT"
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="expiryDate">Date d'expiration :</label>
                    <input
                      type="text"
                      id="expiryDate"
                      name="expiryDate"
                      value={paymentData.expiryDate}
                      onChange={handleInputChange}
                      placeholder="MM/YY"
                      maxLength="5"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="cvv">CVV :</label>
                    <input
                      type="text"
                      id="cvv"
                      name="cvv"
                      value={paymentData.cvv}
                      onChange={handleInputChange}
                      placeholder="123"
                      maxLength="3"
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {paymentMethod === 'lydia' && (
              <div className="payment-form">
                <h4>📱 Paiement via Lydia</h4>
                
                <div className="form-group">
                  <label htmlFor="lydiaPhone">Numéro de téléphone :</label>
                  <input
                    type="text"
                    id="lydiaPhone"
                    name="lydiaPhone"
                    value={paymentData.lydiaPhone}
                    onChange={handleInputChange}
                    placeholder="+33 + 9 chiffres"
                    maxLength="12"
                    required
                  />
                </div>
                
                <div className="lydia-info">
                  <p>ℹ️ Un code de confirmation sera envoyé sur votre téléphone.</p>
                </div>
              </div>
            )}

            {paymentMethod === 'paypal' && (
              <div className="payment-form">
                <h4>🌐 Paiement via PayPal</h4>
                
                <div className="form-group">
                  <label htmlFor="paypalEmail">Adresse email PayPal :</label>
                  <input
                    type="email"
                    id="paypalEmail"
                    name="paypalEmail"
                    value={paymentData.paypalEmail}
                    onChange={handleInputChange}
                    placeholder="votre.email@example.com"
                    required
                  />
                </div>
                
                <div className="paypal-info">
                  <p>ℹ️ Vous serez redirigé vers PayPal pour finaliser le paiement.</p>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="payment-actions">
              <button 
                className="pay-button"
                onClick={handlePayment}
                disabled={!isPaymentComplete()}
              >
                💳 Payer {amount}€
              </button>
            </div>
          </>
        ) : (
          <div className="no-reservation">
            <p>❌ Aucune réservation en cours</p>
            <p>Veuillez retourner au formulaire de réservation.</p>
            <button 
              className="back-button-main" 
              onClick={handleBackToReservation}
            >
              ← Retour à la réservation
            </button>
          </div>
        )}
      </main>

      <footer>
        <p>Park & See - Phase 1 : Stationnement en parkings publics</p>
      </footer>
    </div>
  );
};

export default Payment;
