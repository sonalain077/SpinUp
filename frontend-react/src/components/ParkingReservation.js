import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ParkingReservation.css';

const ParkingReservation = () => {
  const navigate = useNavigate();
  
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

  // Initialisation de la date par défaut
  useEffect(() => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 30); // 30 minutes dans le futur
    const formatted = now.toISOString().slice(0, 16);
    setFormData(prev => ({ ...prev, startAt: formatted }));
  }, []);

  // Validation du formulaire
  useEffect(() => {
    const isValid = 
      validateLicencePlate(formData.licencePlate) &&
      formData.vehicleType &&
      formData.startAt &&
      formData.durationMinutes &&
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
    console.log('🚀 Envoi vers:', 'http://localhost:8081/api/parking/reserve');
    console.log('📤 Données:', data);
    
    const response = await fetch('http://localhost:8081/api/parking/reserve', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(data)
    });

    console.log('📥 Status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erreur serveur:', errorText);
      throw new Error(`Erreur ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    console.log('✅ Réponse:', result);
    return result;
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
      // Formatage de la date pour le backend (identique à la version HTML)
      let startAtValue = formData.startAt;
      if (startAtValue && !startAtValue.includes('T')) {
        startAtValue += ':00';
      } else if (startAtValue && !startAtValue.includes('.')) {
        startAtValue += ':00';
      }
      
      const reservationData = {
        licencePlate: formData.licencePlate,
        vehicleType: formData.vehicleType,
        startAt: startAtValue,
        durationMinutes: parseInt(formData.durationMinutes),
        address: formData.address,
        paymentToken: formData.paymentToken || 'demo'
      };
      
      console.log('🚀 Envoi de la réservation:', reservationData);
      
      const response = await reserveParking(reservationData);
      console.log('✅ Réponse reçue:', response);
      
      setResult(
        `✅ Réservation confirmée !
        Numéro: ${response.reservationId}
        Montant: ${response.amount}€
        Statut: ${response.status}`
      );
      setResultType('success');
      
      // Reset du formulaire après succès
      setTimeout(() => {
        setFormData({
          licencePlate: '',
          vehicleType: '',
          startAt: '',
          durationMinutes: '',
          address: '',
          paymentToken: 'demo'
        });
        // Remettre la date par défaut
        const now = new Date();
        now.setMinutes(now.getMinutes() + 30);
        const formatted = now.toISOString().slice(0, 16);
        setFormData(prev => ({ ...prev, startAt: formatted }));
      }, 3000);
      
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
            <option value="2_roues">2 roues (moto, scooter)</option>
            <option value="voiture">Voiture</option>
            <option value="camionnette">Camionnette</option>
            <option value="camion">Camion</option>
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
            <option value="Parking Centre Ville">Parking Centre Ville</option>
            <option value="Parking Souterrain">Parking Souterrain</option>
            <option value="Parking Mairie">Parking Mairie</option>
          </select>
        </div>

        {/* Token de paiement */}
        <div className="form-group">
          <label htmlFor="paymentToken">Token de paiement :</label>
          <input
            type="text"
            id="paymentToken"
            name="paymentToken"
            value={formData.paymentToken}
            onChange={handleInputChange}
            readOnly
          />
          <small>Mode démo - paiement simulé</small>
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