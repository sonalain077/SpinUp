// Composant React pour la réservation de parking
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
        const isValid = formData.licencePlate &&
                       formData.licencePlate.match(/^[A-Z]{2}-[0-9]{3}-[A-Z]{2}$/) &&
                       formData.vehicleType &&
                       formData.startAt &&
                       formData.durationMinutes &&
                       formData.address;
        setIsFormValid(isValid);
    }, [formData]);

    // Formatage automatique de la plaque d'immatriculation
    const formatLicencePlate = (value) => {
        let cleanValue = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
        
        // Formatage automatique : XX-XXX-XX
        let formattedValue = '';
        if (cleanValue.length >= 2) {
            formattedValue = cleanValue.slice(0, 2) + '-' + cleanValue.slice(2);
        } else {
            formattedValue = cleanValue;
        }
        
        if (cleanValue.length >= 5) {
            formattedValue = cleanValue.slice(0, 2) + '-' + cleanValue.slice(2, 5) + '-' + cleanValue.slice(5);
        }
        
        if (cleanValue.length > 7) {
            formattedValue = cleanValue.slice(0, 2) + '-' + cleanValue.slice(2, 5) + '-' + cleanValue.slice(5, 7);
        }
        
        return formattedValue;
    };

    // Gestion des changements de champs
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        
        if (name === 'licencePlate') {
            const formatted = formatLicencePlate(value);
            setFormData(prev => ({ ...prev, [name]: formatted }));
        } else if (name === 'durationMinutes') {
            setFormData(prev => ({ ...prev, [name]: parseInt(value) || '' }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    // Gestion de la soumission
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!isFormValid) {
            showResult('❌ Veuillez remplir tous les champs correctement', 'error');
            return;
        }

        // Préparation des données avec format de date correct
        let startAtValue = formData.startAt;
        if (startAtValue && !startAtValue.includes(':00')) {
            startAtValue += ':00';
        }

        const reservationData = {
            ...formData,
            startAt: startAtValue,
            durationMinutes: parseInt(formData.durationMinutes)
        };

        setLoading(true);
        
        try {
            const response = await ParkingAPI.reserveAndPay(reservationData);
            
            if (response.success) {
                showResult(
                    `✅ ${response.message}${response.reservationId ? ' - ID: ' + response.reservationId : ''}`,
                    'success'
                );
                // Reset du formulaire
                setFormData({
                    licencePlate: '',
                    vehicleType: 'voiture',
                    startAt: new Date(Date.now() + 30 * 60000).toISOString().slice(0, 16),
                    durationMinutes: '',
                    address: '',
                    paymentToken: 'demo'
                });
            } else {
                showResult(`❌ ${response.message}`, 'error');
            }
        } catch (error) {
            console.error('Erreur lors de la réservation:', error);
            showResult(`❌ Erreur de connexion: ${error.message}`, 'error');
        } finally {
            setLoading(false);
        }
    };

    // Affichage des résultats
    const showResult = (message, type) => {
        setResult(message);
        setResultType(type);
        
        // Auto-hide après 10 secondes pour les succès
        if (type === 'success') {
            setTimeout(() => {
                setResult('');
                setResultType('');
            }, 10000);
        }
    };

    // Validation visuelle des champs
    const getFieldClass = (fieldName, value, validation = null) => {
        if (!value) return 'form-input invalid';
        if (validation && !validation(value)) return 'form-input invalid';
        return 'form-input valid';
    };

    return React.createElement('div', { className: 'parking-reservation' },
        React.createElement('h1', null, '🚗 Park & See'),
        React.createElement('p', { className: 'subtitle' }, 'Réservation de parking en temps réel'),
        
        React.createElement('form', { onSubmit: handleSubmit, className: 'reservation-form' },
            // Plaque d'immatriculation
            React.createElement('div', { className: 'form-group' },
                React.createElement('label', { htmlFor: 'licencePlate' }, 'Plaque d\'immatriculation :'),
                React.createElement('input', {
                    type: 'text',
                    id: 'licencePlate',
                    name: 'licencePlate',
                    value: formData.licencePlate,
                    onChange: handleInputChange,
                    className: getFieldClass('licencePlate', formData.licencePlate, (v) => /^[A-Z]{2}-[0-9]{3}-[A-Z]{2}$/.test(v)),
                    required: true
                }),
                React.createElement('small', null, 'Format : AB-123-CD')
            ),

            // Type de véhicule
            React.createElement('div', { className: 'form-group' },
                React.createElement('label', { htmlFor: 'vehicleType' }, 'Type de véhicule :'),
                React.createElement('select', {
                    id: 'vehicleType',
                    name: 'vehicleType',
                    value: formData.vehicleType,
                    onChange: handleInputChange,
                    className: getFieldClass('vehicleType', formData.vehicleType),
                    required: true
                },
                    React.createElement('option', { value: '' }, '-- Sélectionnez un type de véhicule --'),
                    React.createElement('option', { value: '2_roues' }, '2 roues (moto, scooter)'),
                    React.createElement('option', { value: 'voiture' }, 'Voiture'),
                    React.createElement('option', { value: 'camionnette' }, 'Camionnette'),
                    React.createElement('option', { value: 'camion' }, 'Camion')
                )
            ),

            // Début du stationnement
            React.createElement('div', { className: 'form-group' },
                React.createElement('label', { htmlFor: 'startAt' }, 'Début du stationnement :'),
                React.createElement('input', {
                    type: 'datetime-local',
                    id: 'startAt',
                    name: 'startAt',
                    value: formData.startAt,
                    onChange: handleInputChange,
                    className: getFieldClass('startAt', formData.startAt),
                    required: true
                })
            ),

            // Durée
            React.createElement('div', { className: 'form-group' },
                React.createElement('label', { htmlFor: 'durationMinutes' }, 'Durée :'),
                React.createElement('select', {
                    id: 'durationMinutes',
                    name: 'durationMinutes',
                    value: formData.durationMinutes,
                    onChange: handleInputChange,
                    className: getFieldClass('durationMinutes', formData.durationMinutes),
                    required: true
                },
                    React.createElement('option', { value: '' }, '-- Sélectionnez une durée --'),
                    React.createElement('option', { value: 30 }, '30 min'),
                    React.createElement('option', { value: 60 }, '1h'),
                    React.createElement('option', { value: 90 }, '1h 30min'),
                    React.createElement('option', { value: 120 }, '2h'),
                    React.createElement('option', { value: 150 }, '2h 30min'),
                    React.createElement('option', { value: 180 }, '3h'),
                    React.createElement('option', { value: 210 }, '3h 30min'),
                    React.createElement('option', { value: 240 }, '4h'),
                    React.createElement('option', { value: 270 }, '4h 30min'),
                    React.createElement('option', { value: 300 }, '5h'),
                    React.createElement('option', { value: 330 }, '5h 30min'),
                    React.createElement('option', { value: 360 }, '6h'),
                    React.createElement('option', { value: 390 }, '6h 30min'),
                    React.createElement('option', { value: 420 }, '7h'),
                    React.createElement('option', { value: 450 }, '7h 30min'),
                    React.createElement('option', { value: 480 }, '8h')
                )
            ),

            // Parking
            React.createElement('div', { className: 'form-group' },
                React.createElement('label', { htmlFor: 'address' }, 'Parking :'),
                React.createElement('select', {
                    id: 'address',
                    name: 'address',
                    value: formData.address,
                    onChange: handleInputChange,
                    className: getFieldClass('address', formData.address),
                    required: true
                },
                    React.createElement('option', { value: '' }, '-- Sélectionnez un parking --'),
                    React.createElement('option', { value: 'Parking Centre Ville' }, 'Parking Centre Ville'),
                    React.createElement('option', { value: 'Parking Souterrain' }, 'Parking Souterrain'),
                    React.createElement('option', { value: 'Parking Mairie' }, 'Parking Mairie')
                )
            ),

            // Token de paiement (masqué)
            React.createElement('div', { className: 'form-group' },
                React.createElement('label', { htmlFor: 'paymentToken' }, 'Token de paiement :'),
                React.createElement('input', {
                    type: 'text',
                    id: 'paymentToken',
                    name: 'paymentToken',
                    value: formData.paymentToken,
                    onChange: handleInputChange,
                    readOnly: true,
                    className: 'form-input'
                }),
                React.createElement('small', null, 'Mode démo - paiement simulé')
            ),

            // Bouton de soumission
            React.createElement('button', {
                type: 'submit',
                disabled: !isFormValid || loading,
                className: `submit-btn ${(!isFormValid || loading) ? 'disabled' : ''}`
            },
                loading ? '⏳ Réservation en cours...' : '🅿️ Réserver et Payer'
            )
        ),

        // Affichage des résultats
        result && React.createElement('div', {
            className: `result ${resultType}`,
            style: { display: 'block' }
        }, result)
    );
};

// Export global
window.ParkingReservation = ParkingReservation;