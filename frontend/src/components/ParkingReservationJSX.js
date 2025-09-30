// Composant React avec JSX pour la réservation de parking
const { useState, useEffect } = React;

const ParkingReservation = () => {
    // État du formulaire
    const [formData, setFormData] = useState({
        licencePlate: '',
        vehicleType: 'voiture',
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

    // Formatage automatique de la plaque
    const formatLicencePlate = (value) => {
        // Supprimer tous les caractères non alphanumériques
        let clean = value.replace(/[^A-Z0-9]/gi, '').toUpperCase();
        
        // Limiter à 7 caractères
        clean = clean.substring(0, 7);
        
        // Ajouter les tirets automatiquement
        if (clean.length > 2) {
            clean = clean.substring(0, 2) + '-' + clean.substring(2);
        }
        if (clean.length > 6) {
            clean = clean.substring(0, 6) + '-' + clean.substring(6);
        }
        
        return clean;
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

    // Gestion spéciale pour les touches de la plaque
    const handleLicencePlateKeyDown = (e) => {
        // Permettre les touches de navigation
        const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'];
        if (allowedKeys.includes(e.key)) return;
        
        // Permettre seulement lettres et chiffres
        if (!/^[a-zA-Z0-9]$/.test(e.key)) {
            e.preventDefault();
        }
    };

    // Classes de validation CSS
    const getValidationClass = (fieldName) => {
        const value = formData[fieldName];
        if (!value) return '';
        
        if (fieldName === 'licencePlate') {
            return validateLicencePlate(value) ? 'valid' : 'invalid';
        }
        
        return value ? 'valid' : '';
    };

    // Soumission du formulaire
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!isFormValid) return;
        
        setLoading(true);
        setResult('');
        
        try {
            console.log('🚀 Envoi de la réservation:', formData);
            
            const response = await ParkingAPI.reserve(formData);
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
                    vehicleType: 'voiture',
                    startAt: '',
                    durationMinutes: '',
                    address: '',
                    paymentToken: 'demo'
                });
            }, 3000);
            
        } catch (error) {
            console.error('❌ Erreur lors de la réservation:', error);
            setResult(`❌ Erreur: ${error.message || 'Problème de connexion au serveur'}`);
            setResultType('error');
        } finally {
            setLoading(false);
        }
    };

    // Rendu du composant avec JSX
    return (
        <div className="parking-reservation">
            <h1>Réservation de Parking</h1>
            <p className="subtitle">Réservez votre place de parking en quelques clics</p>
            
            <form className="reservation-form" onSubmit={handleSubmit}>
                {/* Plaque d'immatriculation */}
                <div className="form-group">
                    <label htmlFor="licencePlate">Plaque d'immatriculation *</label>
                    <input
                        type="text"
                        id="licencePlate"
                        name="licencePlate"
                        value={formData.licencePlate}
                        onChange={handleInputChange}
                        onKeyDown={handleLicencePlateKeyDown}
                        placeholder="AB-123-CD"
                        className={`form-input ${getValidationClass('licencePlate')}`}
                        maxLength="9"
                        required
                    />
                    <small>Format: XX-123-XX (2 lettres, 3 chiffres, 2 lettres)</small>
                </div>

                {/* Type de véhicule */}
                <div className="form-group">
                    <label htmlFor="vehicleType">Type de véhicule</label>
                    <select
                        id="vehicleType"
                        name="vehicleType"
                        value={formData.vehicleType}
                        onChange={handleInputChange}
                        className={`form-input ${getValidationClass('vehicleType')}`}
                    >
                        <option value="voiture">Voiture</option>
                        <option value="moto">Moto</option>
                        <option value="camion">Camion</option>
                        <option value="velo">Vélo électrique</option>
                    </select>
                </div>

                {/* Date et heure de début */}
                <div className="form-group">
                    <label htmlFor="startAt">Date et heure de début *</label>
                    <input
                        type="datetime-local"
                        id="startAt"
                        name="startAt"
                        value={formData.startAt}
                        onChange={handleInputChange}
                        className={`form-input ${getValidationClass('startAt')}`}
                        required
                    />
                    <small>Sélectionnez la date et l'heure de début de votre réservation</small>
                </div>

                {/* Durée en minutes */}
                <div className="form-group">
                    <label htmlFor="durationMinutes">Durée (minutes) *</label>
                    <select
                        id="durationMinutes"
                        name="durationMinutes"
                        value={formData.durationMinutes}
                        onChange={handleInputChange}
                        className={`form-input ${getValidationClass('durationMinutes')}`}
                        required
                    >
                        <option value="">Choisir une durée</option>
                        <option value="30">30 minutes (2€)</option>
                        <option value="60">1 heure (3€)</option>
                        <option value="120">2 heures (5€)</option>
                        <option value="240">4 heures (8€)</option>
                        <option value="480">8 heures (12€)</option>
                    </select>
                    <small>Sélectionnez la durée de votre stationnement</small>
                </div>

                {/* Adresse */}
                <div className="form-group">
                    <label htmlFor="address">Adresse du parking *</label>
                    <select
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        className={`form-input ${getValidationClass('address')}`}
                        required
                    >
                        <option value="">Choisir un parking</option>
                        <option value="Parking Centre-Ville - 1 Place de la Mairie">Centre-Ville - 1 Place de la Mairie</option>
                        <option value="Parking Gare SNCF - 15 Avenue de la Gare">Gare SNCF - 15 Avenue de la Gare</option>
                        <option value="Parking Commercial - 8 Rue du Commerce">Commercial - 8 Rue du Commerce</option>
                        <option value="Parking Université - 22 Boulevard Universitaire">Université - 22 Boulevard Universitaire</option>
                        <option value="Parking Hôpital - 5 Rue de la Santé">Hôpital - 5 Rue de la Santé</option>
                    </select>
                    <small>Sélectionnez le parking où vous souhaitez stationner</small>
                </div>

                {/* Bouton de soumission */}
                <button
                    type="submit"
                    disabled={!isFormValid || loading}
                    className={`submit-btn ${(!isFormValid || loading) ? 'disabled' : ''}`}
                >
                    {loading ? 'Traitement en cours...' : 'Réserver et Payer'}
                </button>
            </form>

            {/* Affichage des résultats */}
            {result && (
                <div className={`result ${resultType}`}>
                    {result}
                </div>
            )}
        </div>
    );
};

// Export global pour utilisation via CDN
window.ParkingReservation = ParkingReservation;