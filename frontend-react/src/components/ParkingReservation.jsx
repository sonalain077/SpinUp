import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getVehicleTypeOptions } from '../lib/vehicleTypes';
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
      
      // Création d'une pré-réservation avant le paiement
      console.log('🚀 Création de la pré-réservation:', reservationData);
      
      const response = await reserveParking(reservationData);
      console.log('✅ Pré-réservation créée:', response);
      
      // Redirection vers la page de paiement avec les détails de la réservation
      navigate('/payment', { 
        state: { 
          reservationData: reservationData,
          reservationResponse: response,
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

      {/* Bouton Voir mes places */}
      <div className="secondary-actions">
        <button
          type="button"
          className="secondary-btn"
          onClick={() => navigate('/mes-places')}
        >
          📋 Voir mes places
        </button>
      </div>

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
