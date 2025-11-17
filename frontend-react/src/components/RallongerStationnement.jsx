import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ENDPOINTS } from '../config';
import './RallongerStationnement.css';

const RallongerStationnement = () => {
  const navigate = useNavigate();
  
  // État du formulaire
  const [searchMethod, setSearchMethod] = useState('licencePlate'); // 'licencePlate' ou 'reservationId'
  const [searchValue, setSearchValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [resultType, setResultType] = useState('');
  const [foundReservation, setFoundReservation] = useState(null);
  const [extensionDuration, setExtensionDuration] = useState('');

  // État pour la durée personnalisée (similaire à ParkingReservation)
  const [isCustomDuration, setIsCustomDuration] = useState(false);
  const [customHours, setCustomHours] = useState('1');
  const [customMinutes, setCustomMinutes] = useState('0');
  
  // États pour le paiement
  const [showPayment, setShowPayment] = useState(false);
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

  // Validation de la plaque d'immatriculation
  const validateLicencePlate = (plate) => {
    const pattern = /^[A-Z]{2}-[0-9]{3}-[A-Z]{2}$/;
    return pattern.test(plate);
  };

  // Formatage de la plaque d'immatriculation
  const formatLicencePlate = (value) => {
    const cleaned = value.replace(/[^A-Z0-9]/g, '').toUpperCase();
    let formattedValue = cleaned;
    
    if (cleaned.length >= 2) {
      formattedValue = cleaned.slice(0, 2) + '-' + cleaned.slice(2);
    }
    
    if (cleaned.length >= 5) {
      formattedValue = cleaned.slice(0, 2) + '-' + cleaned.slice(2, 5) + '-' + cleaned.slice(5);
    }
    
    if (cleaned.length > 7) {
      formattedValue = cleaned.slice(0, 2) + '-' + cleaned.slice(2, 5) + '-' + cleaned.slice(5, 7);
    }
    
    return formattedValue;
  };

  // Calcul du prix (1€50 les 30 minutes)
  const calculatePrice = (durationMinutes) => {
    if (!durationMinutes || durationMinutes <= 0) return 0;
    const pricePerHalfHour = 1.50;
    const halfHours = Math.ceil(durationMinutes / 30);
    return (halfHours * pricePerHalfHour).toFixed(2);
  };

  // Gestion de la durée personnalisée
  const handleDurationModeChange = (value) => {
    if (value === 'custom') {
      setIsCustomDuration(true);
      const totalMinutes = parseInt(customHours) * 60 + parseInt(customMinutes);
      setExtensionDuration(totalMinutes.toString());
    } else {
      setIsCustomDuration(false);
      setExtensionDuration(value);
    }
  };

  const handleCustomDurationChange = () => {
    const totalMinutes = parseInt(customHours) * 60 + parseInt(customMinutes);
    setExtensionDuration(totalMinutes.toString());
  };

  // Effet pour mettre à jour la durée quand les heures/minutes personnalisées changent
  useEffect(() => {
    if (isCustomDuration) {
      handleCustomDurationChange();
    }
  }, [customHours, customMinutes, isCustomDuration]);

  // Gestion des changements de champ
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'searchValue' && searchMethod === 'licencePlate') {
      const formatted = formatLicencePlate(value);
      setSearchValue(formatted);
    } else if (name === 'extensionDuration') {
      handleDurationModeChange(value);
    } else {
      setSearchValue(value);
    }
  };

  // Recherche de la réservation
  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!searchValue.trim()) {
      setResult('❌ Veuillez saisir une valeur de recherche');
      setResultType('error');
      return;
    }

    if (searchMethod === 'licencePlate' && !validateLicencePlate(searchValue)) {
      setResult('❌ Format de plaque invalide (ex: AB-123-CD)');
      setResultType('error');
      return;
    }

    setLoading(true);
    setResult('🔍 Recherche en cours...');
    setResultType('info');

    try {
      // Appel API backend pour rechercher la réservation
      const params = searchMethod === 'licencePlate' 
        ? `licencePlate=${encodeURIComponent(searchValue.trim())}`
        : `reservationId=${encodeURIComponent(searchValue.trim())}`;
      
      const response = await fetch(`${ENDPOINTS.parking.search}?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        const reservation = await response.json();
        
        // Calculer endAt si non présent
        if (!reservation.endAt && reservation.startAt && reservation.durationMinutes) {
          const startDate = new Date(reservation.startAt);
          reservation.endAt = new Date(startDate.getTime() + reservation.durationMinutes * 60000).toISOString();
        }
        
        setFoundReservation(reservation);
        setResult('✅ Réservation trouvée !');
        setResultType('success');
      } else if (response.status === 404) {
        setResult('❌ Aucune réservation active trouvée avec ces informations');
        setResultType('error');
        setFoundReservation(null);
      } else {
        setResult('❌ Erreur lors de la recherche');
        setResultType('error');
        setFoundReservation(null);
      }
    } catch (error) {
      console.error('Erreur de recherche:', error);
      setResult('❌ Erreur de connexion au serveur');
      setResultType('error');
      setFoundReservation(null);
    } finally {
      setLoading(false);
    }
  };

  // Fonctions de gestion du paiement (reprises de Payment.jsx)
  const isPaymentComplete = () => {
    switch (paymentMethod) {
      case 'carte-bleue':
        return paymentData.cardNumber.length === 19 && 
               paymentData.cardName.trim() !== '' && 
               paymentData.expiryDate.length === 5 && 
               paymentData.cvv.length === 3;
      case 'lydia':
        return paymentData.lydiaPhone.length === 12;
      case 'paypal':
        return paymentData.paypalEmail.includes('@') && paymentData.paypalEmail.includes('.');
      default:
        return false;
    }
  };

  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method);
    setPaymentData({
      cardNumber: '',
      cardName: '',
      expiryDate: '',
      cvv: '',
      lydiaPhone: '',
      paypalEmail: ''
    });
  };

  const handlePaymentInputChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    switch (name) {
      case 'cardNumber':
        formattedValue = value.replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1 ').substring(0, 19);
        break;
      case 'expiryDate':
        formattedValue = value.replace(/\D/g, '').replace(/(\d{2})(\d{1,2})/, '$1/$2').substring(0, 5);
        break;
      case 'cvv':
        formattedValue = value.replace(/\D/g, '').substring(0, 3);
        break;
      case 'cardName':
        formattedValue = value.replace(/[^a-zA-Z0-9\s\-']/g, '').toUpperCase();
        break;
      case 'lydiaPhone':
        const cleaned = value.replace(/\D/g, '');
        let phoneDigits = '';
        
        if (cleaned.startsWith('33')) {
          phoneDigits = cleaned.substring(2, 11);
        } else if (cleaned.startsWith('0')) {
          phoneDigits = cleaned.substring(1, 10);
        } else {
          phoneDigits = cleaned.substring(0, 9);
        }
        
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

  // Extension du stationnement - passer au mode paiement
  const handleExtension = async (e) => {
    e.preventDefault();
    
    if (!extensionDuration || parseInt(extensionDuration) <= 0) {
      setResult('❌ Veuillez sélectionner une durée d\'extension');
      setResultType('error');
      return;
    }

    // Passer au mode paiement
    setShowPayment(true);
    setResult('');
    setResultType('');
  };

  // Traitement du paiement et extension
  const handlePayment = async () => {
    if (!isPaymentComplete()) {
      setResult('❌ Veuillez compléter toutes les informations de paiement');
      setResultType('error');
      return;
    }

    setLoading(true);
    setResult('💳 Traitement du paiement...');
    setResultType('info');

    try {
      const extensionPrice = calculatePrice(parseInt(extensionDuration));
      
      // Appel API backend pour étendre la réservation
      const response = await fetch(ENDPOINTS.parking.extend, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reservationId: foundReservation.id,
          licencePlate: foundReservation.licencePlate,
          extensionMinutes: parseInt(extensionDuration),
          paymentToken: `${paymentMethod}-${Date.now()}`
        })
      });

      const backendResponse = await response.json();
      
      if (response.ok && backendResponse.success) {
        // Succès - redirection vers page de confirmation
        navigate('/extension-confirmation', {
          state: {
            reservation: foundReservation,
            extensionDuration: parseInt(extensionDuration),
            extensionPrice: backendResponse.paymentAmount || extensionPrice,
            paymentMethod,
            success: true,
            message: backendResponse.message,
            reservationId: backendResponse.reservationId
          }
        });
      } else {
        // Échec du paiement ou de l'extension
        setResult(`❌ ${backendResponse.message || 'Erreur lors de l\'extension'}`);
        setResultType('error');
      }
      
    } catch (error) {
      console.error('Erreur d\'extension:', error);
      setResult('❌ Erreur de connexion au serveur');
      setResultType('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rallonger-stationnement">
      <header>
        <div className="header-content">
          <button onClick={() => navigate('/parking-reservation')} className="back-button">
            ← Retour
          </button>
          <div className="header-text">
            <h1>⏰ Rallonger un Stationnement</h1>
            <p>Prolongez votre stationnement en cours</p>
          </div>
        </div>
      </header>

      <div className="content">
        {!foundReservation ? (
          // Étape 1 : Recherche de la réservation
          <form onSubmit={handleSearch} className="search-form">
            <h2>🔍 Identifier votre stationnement</h2>
            
            {/* Méthode de recherche */}
            <div className="form-group">
              <label>Méthode de recherche :</label>
              <div className="search-method-toggle">
                <button
                  type="button"
                  className={`method-btn ${searchMethod === 'licencePlate' ? 'active' : ''}`}
                  onClick={() => {setSearchMethod('licencePlate'); setSearchValue('');}}
                >
                  🚗 Plaque d'immatriculation
                </button>
                <button
                  type="button"
                  className={`method-btn ${searchMethod === 'reservationId' ? 'active' : ''}`}
                  onClick={() => {setSearchMethod('reservationId'); setSearchValue('');}}
                >
                  🎫 Numéro de réservation
                </button>
              </div>
            </div>

            {/* Champ de recherche */}
            <div className="form-group">
              <label htmlFor="searchValue">
                {searchMethod === 'licencePlate' ? 'Plaque d\'immatriculation :' : 'Numéro de réservation :'}
              </label>
              <input
                type="text"
                id="searchValue"
                name="searchValue"
                value={searchValue}
                onChange={handleInputChange}
                placeholder={searchMethod === 'licencePlate' ? 'Ex: AB-123-CD' : 'Ex: R-1234567890'}
                className={searchValue ? 'valid' : ''}
                required
              />
              {searchMethod === 'licencePlate' && (
                <small>Format : AB-123-CD</small>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`search-btn ${loading ? 'loading' : ''}`}
            >
              {loading ? '🔍 Recherche...' : '🔍 Rechercher'}
            </button>
          </form>
        ) : (
          // Étape 2 : Extension du stationnement
          <div className="extension-section">
            <div className="reservation-found">
              <h2>✅ Stationnement trouvé</h2>
              <div className="reservation-details">
                <div className="detail-item">
                  <span className="label">🚗 Véhicule :</span>
                  <span className="value">{foundReservation.licencePlate}</span>
                </div>
                <div className="detail-item">
                  <span className="label">🏢 Parking :</span>
                  <span className="value">{foundReservation.address}</span>
                </div>
                <div className="detail-item">
                  <span className="label">⏰ Fin actuelle :</span>
                  <span className="value">{new Date(foundReservation.endAt).toLocaleString('fr-FR')}</span>
                </div>
              </div>
            </div>

            <form onSubmit={handleExtension} className="extension-form">
              <h3>➕ Rallonger le stationnement</h3>
              
              {/* Durée d'extension */}
              <div className="form-group">
                <label htmlFor="extensionDuration">Durée d'extension :</label>
                <select
                  id="extensionDuration"
                  name="extensionDuration"
                  value={isCustomDuration ? 'custom' : extensionDuration}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">-- Sélectionnez une durée --</option>
                  <option value="30">30 min</option>
                  <option value="60">1h</option>
                  <option value="90">1h 30min</option>
                  <option value="120">2h</option>
                  <option value="150">2h 30min</option>
                  <option value="180">3h</option>
                  <option value="custom">🎛️ Personnaliser</option>
                </select>

                {/* Durée personnalisée */}
                {isCustomDuration && (
                  <div className="custom-duration">
                    <label>Durée personnalisée :</label>
                    <div className="duration-inputs">
                      <div className="duration-input-group">
                        <label htmlFor="customHours">Heures :</label>
                        <select 
                          id="customHours"
                          value={customHours}
                          onChange={(e) => setCustomHours(e.target.value)}
                          className="duration-select"
                        >
                          {[...Array(24)].map((_, i) => (
                            <option key={i + 1} value={i + 1}>{i + 1}h</option>
                          ))}
                        </select>
                      </div>
                      <div className="duration-input-group">
                        <label htmlFor="customMinutes">Minutes :</label>
                        <select 
                          id="customMinutes"
                          value={customMinutes}
                          onChange={(e) => setCustomMinutes(e.target.value)}
                          className="duration-select"
                        >
                          <option value="0">0 min</option>
                          <option value="30">30 min</option>
                        </select>
                      </div>
                    </div>
                    <p className="custom-duration-display">
                      Durée sélectionnée : {customHours}h {customMinutes === '0' ? '' : `${customMinutes}min`}
                    </p>
                  </div>
                )}

                {/* Informations tarifaires */}
                {extensionDuration && (
                  <div className="pricing-info">
                    <p className="price-reference">💰 Tarif : 1€50 les 30 minutes</p>
                    <p className="price-calculation">
                      <strong>Coût de l'extension : {calculatePrice(parseInt(extensionDuration))}€</strong>
                    </p>
                  </div>
                )}
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setFoundReservation(null)}
                >
                  🔍 Nouvelle recherche
                </button>
                <button
                  type="submit"
                  disabled={loading || !extensionDuration}
                  className={`extension-btn ${loading ? 'loading' : ''}`}
                >
                  {loading ? '⏰ Extension...' : '💳 Payer et Rallonger'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Section de paiement */}
        {showPayment && foundReservation && (
          <div className="payment-section">
            <h2>💳 Paiement de l'extension</h2>
            
            {/* Récapitulatif */}
            <div className="payment-summary">
              <h3>📋 Récapitulatif</h3>
              <div className="summary-details">
                <div className="detail-item">
                  <span className="label">⏰ Extension :</span>
                  <span className="value">{Math.floor(parseInt(extensionDuration) / 60)}h {parseInt(extensionDuration) % 60}min</span>
                </div>
                <div className="detail-item total">
                  <span className="label">💰 Montant :</span>
                  <span className="value">{calculatePrice(parseInt(extensionDuration))}€</span>
                </div>
              </div>
            </div>

            {/* Méthodes de paiement */}
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

            {/* Formulaires de paiement spécifiques */}
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
                    onChange={handlePaymentInputChange}
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
                    onChange={handlePaymentInputChange}
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
                      onChange={handlePaymentInputChange}
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
                      onChange={handlePaymentInputChange}
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
                    onChange={handlePaymentInputChange}
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
                    onChange={handlePaymentInputChange}
                    placeholder="votre.email@example.com"
                    required
                  />
                </div>
                
                <div className="paypal-info">
                  <p>ℹ️ Vous serez redirigé vers PayPal pour finaliser le paiement.</p>
                </div>
              </div>
            )}

            {/* Actions de paiement */}
            <div className="payment-actions">
              <button 
                className="cancel-btn"
                onClick={() => setShowPayment(false)}
              >
                ← Retour
              </button>
              <button 
                className="pay-button"
                onClick={handlePayment}
                disabled={!isPaymentComplete() || loading}
              >
                💳 Payer {calculatePrice(parseInt(extensionDuration))}€
              </button>
            </div>
          </div>
        )}

        {/* Affichage des résultats */}
        {result && (
          <div className={`result ${resultType}`}>
            {result}
          </div>
        )}
      </div>

      <footer>
        <p>Park & See - Extension de stationnement</p>
      </footer>
    </div>
  );
};

export default RallongerStationnement;