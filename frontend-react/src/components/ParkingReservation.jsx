import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getVehicleTypeOptions } from '../lib/vehicleTypes';
import { createReservation } from '../services/reservationApi';
import { getParkingIdByName, calculatePriceCents, formatPrice } from '../services/parkingConfig';
import './ParkingReservation.css';

const ParkingReservation = () => {
  const navigate = useNavigate();
  
  // Fonctions utilitaires pour les dates
  const getCurrentDateTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    
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
  
  // Calcul du prix (1€50 les 30 minutes)
  const calculatePrice = (durationMinutes) => {
    if (!durationMinutes || durationMinutes <= 0) return 0;
    const pricePerHalfHour = 1.50;
    const halfHours = Math.ceil(durationMinutes / 30); // Arrondi au supérieur
    return (halfHours * pricePerHalfHour).toFixed(2);
  };

  // Initialisation de la date par défaut (heure actuelle + 30 minutes minimum)
  useEffect(() => {
    const now = new Date();
    // Pour la démo : commencer immédiatement (pas de +30 min)
    // now.setMinutes(now.getMinutes() + 30); // Désactivé pour permettre des démonstrations immédiates
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    
    const formatted = `${year}-${month}-${day}T${hours}:${minutes}`;
    setFormData(prev => ({ ...prev, startAt: formatted }));
  }, []);

  // Validation du formulaire
  useEffect(() => {
    const isValid = 
      validateLicencePlate(formData.licencePlate) &&
      formData.vehicleType &&
      formData.startAt &&
      formData.durationMinutes >= 0 && // Accepter 0 pour mode démo
      formData.address;
    
    setIsFormValid(isValid);
  }, [formData]);

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
      // Validation de la date : doit être dans le futur
      const selectedDate = new Date(value);
      const now = new Date();
      
      if (selectedDate < now) {
        // Si la date est dans le passé, on la corrige à maintenant + 30 minutes
        const futureDate = new Date(now.getTime() + 30 * 60000); // +30 minutes
        const correctedValue = getCurrentDateTime();
        setFormData(prev => ({ ...prev, [name]: correctedValue }));
        
        // Afficher un message d'avertissement
        setResult('⚠️ La date sélectionnée est dans le passé. Ajustée automatiquement.');
        setResultType('warning');
        setTimeout(() => setResult(''), 3000);
      } else {
        setFormData(prev => ({ ...prev, [name]: value }));
      }
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
    if (!value) return '';
    
    if (fieldName === 'licencePlate') {
      return validateLicencePlate(value) ? 'valid' : 'invalid';
    }
    
    return value ? 'valid' : 'invalid';
  };

  // Service API pour communiquer avec le backend
  const reserveParking = async (data) => {
    console.log('🚀 DEBUT REQUETE API');
    console.log('📍 URL:', 'http://localhost:8081/api/parking/reserve');
    console.log('📤 Données brutes:', JSON.stringify(data, null, 2));
    
    try {
      const response = await fetch('http://localhost:8081/api/parking/reserve', {
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

  // Soumission du formulaire - Redirection vers page de paiement
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
      // 1. Mapper l'adresse vers parkingId
      const parkingId = getParkingIdByName(formData.address);
      if (!parkingId) {
        throw new Error(`Parking inconnu: ${formData.address}`);
      }
      
      // 2. Gérer la durée spéciale pour démo infraction
      const isDemoInfraction = parseInt(formData.durationMinutes) === 0;
      const finalDuration = isDemoInfraction ? 1 : parseInt(formData.durationMinutes);
      
      // 3. Calculer le montant en centimes
      const amountCents = calculatePriceCents(finalDuration);
      
      console.log('� Préparation des données pour paiement:');
      console.log('- Plaque:', formData.licencePlate);
      console.log('- Type:', formData.vehicleType);
      console.log('- Parking:', formData.address, '→', parkingId);
      console.log('- Début:', formData.startAt);
      console.log('- Durée:', finalDuration, 'min');
      console.log('- Prix:', formatPrice(amountCents), '€', `(${amountCents} centimes)`);
      console.log('- Mode:', isDemoInfraction ? '🎬 DEMO INFRACTION' : 'Normal');
      
      // 4. Préparer les données de réservation pour la page de paiement
      const reservationDataForPayment = {
        licencePlate: formData.licencePlate,
        vehicleType: formData.vehicleType,
        address: formData.address,
        parkingId,
        startAt: formData.startAt,
        durationMinutes: finalDuration,
        amountCents
      };
      
      // 5. Rediriger vers la page de paiement avec les données
      navigate('/payment', {
        state: {
          reservationData: reservationDataForPayment,
          amount: amountCents,
          reservationResponse: null // Sera rempli après le paiement
        }
      });
      
    } catch (error) {
      console.error('❌ Erreur lors de la préparation:', error);
      setResult(`❌ Erreur: ${error.message || 'Problème de préparation des données'}`);
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
            className={getValidationClass('startAt')}
            min={getCurrentDateTime()}
            required
          />
        </div>

        {/* Durée en minutes */}
        <div className="form-group">
          <label htmlFor="durationMinutes">Durée :</label>
          <select
            id="durationMinutes"
            name="durationMinutes"
            value={formData.durationMinutes}
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
            <option value="390">6h 30min</option>
            <option value="420">7h</option>
            <option value="450">7h 30min</option>
            <option value="480">8h</option>
          </select>
          
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
