import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getVehicleTypeOptions } from '../lib/vehicleTypes';
import { ENDPOINTS } from '../config';
import './ParkingReservation.css';

const ParkingReservation = () => {
  const navigate = useNavigate();
  
  // Fonctions utilitaires pour les dates
  const roundToNextQuarterHour = (date) => {
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
    
    // Si on est exactement sur un quart d'heure (0, 15, 30, 45) et pas de secondes, on garde cette heure
    if (seconds === 0 && (minutes === 0 || minutes === 15 || minutes === 30 || minutes === 45)) {
      return new Date(date);
    }
    
    // Sinon, arrondir au prochain quart d'heure
    let nextQuarterMinutes;
    if (minutes < 15) {
      nextQuarterMinutes = 15;
    } else if (minutes < 30) {
      nextQuarterMinutes = 30;
    } else if (minutes < 45) {
      nextQuarterMinutes = 45;
    } else {
      nextQuarterMinutes = 0; // Prochaine heure
    }
    
    const newDate = new Date(date);
    newDate.setMinutes(nextQuarterMinutes, 0, 0); // Remettre secondes et millisecondes à 0
    
    // Si on passe à l'heure suivante (minutes était > 45)
    if (nextQuarterMinutes === 0) {
      newDate.setHours(newDate.getHours() + 1);
    }
    
    return newDate;
  };

  const getCurrentDateTime = () => {
    const now = new Date();
    const roundedDate = roundToNextQuarterHour(now);
    
    const year = roundedDate.getFullYear();
    const month = String(roundedDate.getMonth() + 1).padStart(2, '0');
    const day = String(roundedDate.getDate()).padStart(2, '0');
    const hours = String(roundedDate.getHours()).padStart(2, '0');
    const minutes = String(roundedDate.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const getCurrentDate = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  };
  
  // État du formulaire
  const [formData, setFormData] = useState({
    licencePlate: '',
    vehicleType: '',
    startAt: '',
    durationMinutes: '',
    address: '',
    paymentToken: 'demo'
  });

  // État de l'interface
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [resultType, setResultType] = useState('');
  const [isFormValid, setIsFormValid] = useState(false);
  
  // État pour la durée personnalisée
  const [isCustomDuration, setIsCustomDuration] = useState(false);
  const [customHours, setCustomHours] = useState('1');
  const [customMinutes, setCustomMinutes] = useState('0');
  
  // Calcul du prix (1€50 les 30 minutes)
  const calculatePrice = (durationMinutes) => {
    if (!durationMinutes || durationMinutes <= 0) return 0;
    const pricePerHalfHour = 1.50; // 1.50€ pour 30 minutes
    const halfHours = Math.ceil(durationMinutes / 30); // Arrondi au supérieur à la demi-heure
    return (halfHours * pricePerHalfHour).toFixed(2);
  };

  // Gestion de la durée personnalisée
  const handleDurationModeChange = (value) => {
    if (value === 'custom') {
      setIsCustomDuration(true);
      // Calculer immédiatement la durée avec les valeurs par défaut
      const totalMinutes = parseInt(customHours) * 60 + parseInt(customMinutes);
      setFormData(prev => ({ ...prev, durationMinutes: totalMinutes.toString() }));
    } else {
      setIsCustomDuration(false);
      setFormData(prev => ({ ...prev, durationMinutes: value }));
    }
  };

  const handleCustomDurationChange = () => {
    const totalMinutes = parseInt(customHours) * 60 + parseInt(customMinutes);
    setFormData(prev => ({ ...prev, durationMinutes: totalMinutes.toString() }));
  };

  // Effet pour mettre à jour la durée quand les heures/minutes personnalisées changent
  useEffect(() => {
    if (isCustomDuration) {
      handleCustomDurationChange();
    }
  }, [customHours, customMinutes, isCustomDuration]);

  // Initialisation de la date par défaut (arrondie au quart d'heure supérieur)
  useEffect(() => {
    const formatted = getCurrentDateTime(); // Utilise la fonction qui arrondit automatiquement
    setFormData(prev => ({ ...prev, startAt: formatted }));
  }, []);

  // Validation du formulaire
  useEffect(() => {
    const isValid = 
      validateLicencePlate(formData.licencePlate) &&
      formData.vehicleType &&
      formData.startAt &&
      (formData.durationMinutes >= 0 || isCustomDuration) && // Accepter 0 pour mode démo et mode personnalisé
      formData.address;
    
    setIsFormValid(isValid);
  }, [formData, isCustomDuration]);

  // Validation de la plaque d'immatriculation
  const validateLicencePlate = (plate) => {
    const pattern = /^[A-Z]{2}-[0-9]{3}-[A-Z]{2}$/;
    return pattern.test(plate);
  };

  // Formatage automatique de la plaque (logique identique au HTML)
  const formatLicencePlate = (value) => {
    // Supprimer tous les caractères non alphanumériques et convertir en majuscules
    let cleaned = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    
    // Formatage automatique : XX-XXX-XX
    let formattedValue = '';
    if (cleaned.length >= 2) {
      formattedValue = cleaned.slice(0, 2) + '-' + cleaned.slice(2);
    } else {
      formattedValue = cleaned;
    }
    
    if (cleaned.length >= 5) {
      formattedValue = cleaned.slice(0, 2) + '-' + cleaned.slice(2, 5) + '-' + cleaned.slice(5);
    }
    
    if (cleaned.length > 7) {
      formattedValue = cleaned.slice(0, 2) + '-' + cleaned.slice(2, 5) + '-' + cleaned.slice(5, 7);
    }
    
    return formattedValue;
  };

  // Gestion des changements dans les champs
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'licencePlate') {
      const formatted = formatLicencePlate(value);
      setFormData(prev => ({ ...prev, [name]: formatted }));
    } else if (name === 'startAt') {
      // Validation de la date : doit être dans le futur et arrondie au quart d'heure
      const selectedDate = new Date(value);
      const now = new Date();
      
      if (selectedDate < now) {
        // Si la date est dans le passé, on la corrige au prochain quart d'heure
        const correctedValue = getCurrentDateTime();
        setFormData(prev => ({ ...prev, [name]: correctedValue }));
        
        // Afficher un message d'avertissement
        setResult('⚠️ La date sélectionnée est dans le passé. Ajustée au prochain quart d\'heure.');
        setResultType('warning');
        setTimeout(() => setResult(''), 3000);
      } else {
        // Toujours arrondir au quart d'heure, peu importe la saisie
        const roundedDate = roundToNextQuarterHour(selectedDate);
        const year = roundedDate.getFullYear();
        const month = String(roundedDate.getMonth() + 1).padStart(2, '0');
        const day = String(roundedDate.getDate()).padStart(2, '0');
        const hours = String(roundedDate.getHours()).padStart(2, '0');
        const roundedMinutes = String(roundedDate.getMinutes()).padStart(2, '0');
        
        const roundedValue = `${year}-${month}-${day}T${hours}:${roundedMinutes}`;
        
        // Vérifier si l'arrondi a changé la valeur
        if (roundedValue !== value) {
          setFormData(prev => ({ ...prev, [name]: roundedValue }));
          
          // Afficher un message d'information seulement si l'heure a été modifiée
          setResult('ℹ️ Heure automatiquement ajustée au quart d\'heure (00, 15, 30 ou 45 min).');
          setResultType('info');
          setTimeout(() => setResult(''), 3000);
        } else {
          setFormData(prev => ({ ...prev, [name]: value }));
        }
      }
    } else if (name === 'durationMinutes') {
      // Gestion de la durée avec mode personnalisé
      handleDurationModeChange(value);
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Gestion spéciale pour les touches de la plaque (logique identique au HTML)
  const handleLicencePlateKeyDown = (e) => {
    const input = e.target;
    const cursorPos = input.selectionStart;
    const value = input.value;
    
    // Gestion de la touche Suppr (Delete) et Backspace
    if (e.key === 'Delete' || e.key === 'Backspace') {
      // Si on est sur un tiret, on passe au caractère suivant/précédent
      if (e.key === 'Delete' && value[cursorPos] === '-') {
        e.preventDefault();
        // Supprime le caractère après le tiret
        if (cursorPos + 1 < value.length) {
          const newValue = value.slice(0, cursorPos + 1) + value.slice(cursorPos + 2);
          const formatted = formatLicencePlate(newValue);
          setFormData(prev => ({ ...prev, licencePlate: formatted }));
        }
        return;
      }
      
      if (e.key === 'Backspace' && cursorPos > 0 && value[cursorPos - 1] === '-') {
        e.preventDefault();
        // Supprime le caractère avant le tiret
        if (cursorPos >= 2) {
          const newValue = value.slice(0, cursorPos - 2) + value.slice(cursorPos - 1);
          const formatted = formatLicencePlate(newValue);
          setFormData(prev => ({ ...prev, licencePlate: formatted }));
        }
        return;
      }
    }
  };

  // Classes de validation CSS
  const getValidationClass = (fieldName) => {
    const value = formData[fieldName];
    
    if (fieldName === 'licencePlate') {
      return validateLicencePlate(value) ? 'valid' : 'invalid';
    }
    
    if (fieldName === 'durationMinutes') {
      // En mode personnalisé, on considère comme valide si on a une durée calculée
      if (isCustomDuration) {
        return (formData.durationMinutes && parseInt(formData.durationMinutes) > 0) ? 'valid' : '';
      }
      // En mode normal, on vérifie la valeur
      return value ? 'valid' : '';
    }
    
    if (!value) return '';
    return value ? 'valid' : 'invalid';
  };

  // ⚠️ FONCTION DÉSACTIVÉE - La réservation est maintenant créée dans Payment.jsx après le paiement
  // Service API pour communiquer avec le backend
  /*
  const reserveParking = async (data) => {
    console.log('🚀 DEBUT REQUETE API');
    console.log('📍 URL:', ENDPOINTS.parking.reserve);
    console.log('📤 Données brutes:', JSON.stringify(data, null, 2));
    
    try {
      const response = await fetch(ENDPOINTS.parking.reserve, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(data)
      });

      console.log('📥 Response status:', response.status);
      console.log('📥 Response headers:', response.headers);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Réponse d\'erreur complète:', errorText);
        console.error('❌ Status code:', response.status);
        console.error('❌ Status text:', response.statusText);
        throw new Error(`Erreur ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ Réponse succès:', result);
      return result;
    } catch (error) {
      console.error('❌ Erreur dans reserveParking:', error);
      throw error;
    }
  };
  */


  // Soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isFormValid) {
      setResult('❌ Veuillez remplir tous les champs correctement');
      setResultType('error');
      return;
    }
    
    setLoading(true);
    setResult('');
    
    try {
      // Formatage de la date pour le backend (format exact : yyyy-MM-dd'T'HH:mm:ss)
      let startAtValue = formData.startAt;
      
      console.log('🕐 Date originale du formulaire:', startAtValue);
      
      // Si c'est un datetime-local (format: 2025-10-15T23:30), ajouter les secondes
      if (startAtValue && startAtValue.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/)) {
        startAtValue += ':00';  // Ajouter :00 pour les secondes
        console.log('🕐 Date après ajout des secondes:', startAtValue);
      }
      // Si c'est déjà complet mais sans secondes (2025-10-15T23:30:), ajouter 00
      else if (startAtValue && startAtValue.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:$/)) {
        startAtValue += '00';
        console.log('🕐 Date après ajout final des secondes:', startAtValue);
      }
      
      // Validation finale du format
      const dateFormatRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/;
      if (!dateFormatRegex.test(startAtValue)) {
        throw new Error(`Format de date invalide: ${startAtValue}. Attendu: yyyy-MM-ddTHH:mm:ss`);
      }
      
      console.log('📅 Date finale formatée pour backend:', startAtValue);
      
      // Gestion spéciale pour "Démo infraction" (durée = 1 minute pour faciliter les tests)
      const isDemoInfraction = parseInt(formData.durationMinutes) === 0;
      const finalDuration = isDemoInfraction ? 1 : parseInt(formData.durationMinutes); // 1 min pour démo
      
      // Calcul du prix total AVANT la création de l'objet
      const totalPrice = calculatePrice(finalDuration);
      
      const reservationData = {
        licencePlate: formData.licencePlate,
        vehicleType: formData.vehicleType,
        startAt: startAtValue,
        durationMinutes: finalDuration,
        address: formData.address,
        paymentAmount: totalPrice, // ✅ Ajout du montant requis
        paymentToken: 'pending-payment' // Token temporaire en attente de paiement
      };
      
      // Validation des données avant envoi
      console.log('🔍 VALIDATION COMPLETE DES DONNEES:');
      console.log('- Mode:', isDemoInfraction ? '🎬 DEMO INFRACTION' : 'Normal');
      console.log('- Plaque:', `"${reservationData.licencePlate}"`);
      console.log('- Type véhicule:', `"${reservationData.vehicleType}"`);
      console.log('- Date:', `"${reservationData.startAt}"`);
      console.log('- Durée:', reservationData.durationMinutes, typeof reservationData.durationMinutes);
      console.log('- Adresse:', `"${reservationData.address}"`);
      
      // Vérifications critiques avec messages détaillés
      if (!reservationData.licencePlate || reservationData.licencePlate.trim() === '') {
        throw new Error('Plaque d\'immatriculation vide ou invalide');
      }
      if (!reservationData.vehicleType || reservationData.vehicleType.trim() === '') {
        throw new Error('Type de véhicule vide ou invalide');
      }
      if (!reservationData.startAt || reservationData.startAt.trim() === '') {
        throw new Error('Date de début vide ou invalide');
      }
      // Autoriser 0.167 pour démo infraction
      if (isNaN(reservationData.durationMinutes) || reservationData.durationMinutes < 0) {
        throw new Error(`Durée invalide: ${reservationData.durationMinutes}`);
      }
      if (!reservationData.address || reservationData.address.trim() === '') {
        throw new Error('Adresse vide ou invalide');
      }
      
      console.log('✅ Toutes les validations passées');
      
      // Préparation des données pour le paiement (SANS créer la réservation)
      console.log('� Préparation des données pour le paiement:', reservationData);
      
      // ⚠️ NOTE: La réservation sera créée APRÈS le paiement dans Payment.jsx
      // On ne fait plus l'appel API ici pour éviter la duplication
      
      // Redirection vers la page de paiement avec les détails de la réservation
      navigate('/payment', { 
        state: { 
          reservationData: reservationData,
          amount: totalPrice,
          formattedAmount: `${totalPrice}€`
        } 
      });
      
    } catch (error) {
      console.error('❌ Erreur lors de la réservation:', error);
      setResult(`❌ Erreur: ${error.message || 'Problème de connexion au serveur'}`);
      setResultType('error');
    } finally {
      setLoading(false);
    }
  };

  // Rendu du composant avec JSX (identique à la version HTML)
  return (
    <div className="parking-reservation">
      <header>
        <div className="header-content">
          <button onClick={() => navigate('/')} className="back-button">
            ← Retour
          </button>
          <div className="header-text">
            <h1>🚗 Park & See</h1>
            <p>Réservation de parking en temps réel</p>
          </div>
        </div>
      </header>
      
      {/* Boutons d'actions rapides */}
      <div className="quick-actions">
        <h2>🔧 Actions rapides</h2>
        <div className="action-buttons">
          <button 
            type="button"
            className="action-btn view-places-btn"
            onClick={() => navigate('/mes-places')}
          >
            <span className="btn-icon">👁️</span>
            <span className="btn-text">Voir mes places</span>
            <span className="btn-description">Consulter vos réservations actives</span>
          </button>
          
          <button 
            type="button"
            className="action-btn extend-parking-btn"
            onClick={() => navigate('/rallonger-stationnement')}
          >
            <span className="btn-icon">⏰</span>
            <span className="btn-text">Rallonger stationnement</span>
            <span className="btn-description">Prolonger une réservation en cours</span>
          </button>
        </div>
      </div>
      
      {/* Formulaire de nouvelle réservation */}
      <div className="new-reservation-section">
        <h2>📝 Nouvelle réservation</h2>
      
      <form className="reservation-form" onSubmit={handleSubmit}>
        {/* Plaque d'immatriculation */}
        <div className="form-group">
          <label htmlFor="licencePlate">Plaque d'immatriculation :</label>
          <input
            type="text"
            id="licencePlate"
            name="licencePlate"
            value={formData.licencePlate}
            onChange={handleInputChange}
            onKeyDown={handleLicencePlateKeyDown}
            pattern="[A-Z]{2}-[0-9]{3}-[A-Z]{2}"
            className={getValidationClass('licencePlate')}
            required
          />
          <small>Format : AB-123-CD</small>
        </div>

        {/* Type de véhicule */}
        <div className="form-group">
          <label htmlFor="vehicleType">Type de véhicule :</label>
          <select
            id="vehicleType"
            name="vehicleType"
            value={formData.vehicleType}
            onChange={handleInputChange}
            className={getValidationClass('vehicleType')}
            required
          >
            <option value="">-- Sélectionnez un type de véhicule --</option>
            {getVehicleTypeOptions().map(option => (
              <option key={option.value} value={option.value}>
                {option.icon} {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Date et heure de début */}
        <div className="form-group">
          <label htmlFor="startAt">Début du stationnement :</label>
          <input
            type="datetime-local"
            id="startAt"
            name="startAt"
            value={formData.startAt}
            onChange={handleInputChange}
            onBlur={(e) => {
              // Force l'arrondi quand l'utilisateur quitte le champ
              const event = { target: { name: 'startAt', value: e.target.value } };
              handleInputChange(event);
            }}
            className={getValidationClass('startAt')}
            min={getCurrentDateTime()}
            required
          />
          <small className="input-hint">⏰ L'heure sera automatiquement arrondie au quart d'heure supérieur (00, 15, 30, 45 min)</small>
        </div>

        {/* Durée en minutes */}
        <div className="form-group">
          <label htmlFor="durationMinutes">Durée :</label>
          <select
            id="durationMinutes"
            name="durationMinutes"
            value={isCustomDuration ? 'custom' : formData.durationMinutes}
            onChange={handleInputChange}
            className={getValidationClass('durationMinutes')}
            required
          >
            <option value="">-- Sélectionnez une durée --</option>
            <option value="0">🎬 Démo infraction (1 minute)</option>
            <option value="30">30 min</option>
            <option value="60">1h</option>
            <option value="90">1h 30min</option>
            <option value="120">2h</option>
            <option value="150">2h 30min</option>
            <option value="180">3h</option>
            <option value="210">3h 30min</option>
            <option value="240">4h</option>
            <option value="270">4h 30min</option>
            <option value="300">5h</option>
            <option value="330">5h 30min</option>
            <option value="360">6h</option>
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
          <div className="pricing-info">
            <p className="price-reference">💰 Tarif : 1€50 les 30 minutes</p>
            {formData.durationMinutes && (
              <p className="price-calculation">
                <strong>Prix total : {calculatePrice(formData.durationMinutes)}€</strong>
              </p>
            )}
          </div>
        </div>

        {/* Adresse */}
        <div className="form-group">
          <label htmlFor="address">Parking :</label>
          <select
            id="address"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            className={getValidationClass('address')}
            required
          >
            <option value="">-- Sélectionnez un parking --</option>
            <option value="Parking Centre Ville">🏙️ Parking Centre Ville</option>
            <option value="Parking Gare">🚉 Parking Gare</option>
            <option value="Parking République">🏢 Parking République</option>
            <option value="Parking Liberté">🌳 Parking Liberté</option>
            <option value="Parking Mairie">🏛️ Parking Mairie</option>
          </select>
        </div>

        {/* Bouton de soumission */}
        <button
          type="submit"
          disabled={!isFormValid || loading}
          className={`submit-btn ${(!isFormValid || loading) ? 'disabled' : ''}`}
        >
          {loading ? (
            <>
              <span className="spinner">⏳</span>
              <span>Réservation en cours...</span>
            </>
          ) : (
            <>🅿️ Réserver et Payer</>
          )}
        </button>
      </form>
      </div> {/* Fermeture de new-reservation-section */}

      {/* Affichage des résultats */}
      {result && (
        <div className={`result ${resultType}`}>
          {result}
        </div>
      )}
      
      <footer>
        <p>Park & See - Phase 1 : Stationnement en parkings publics</p>
      </footer>
    </div>
  );
};

export default ParkingReservation;
