// Park & See - Frontend JavaScript
class ParkAndSeeAPI {
    constructor() {
        this.baseURL = 'http://localhost:8081/api';
        this.form = document.getElementById('reservationForm');
        this.resultDiv = document.getElementById('result');
        this.submitBtn = document.getElementById('submitBtn');
        this.btnText = document.getElementById('btnText');
        this.loadingSpinner = document.getElementById('loadingSpinner');
        
        this.initializeForm();
        this.setDefaultDateTime();
    }

    initializeForm() {
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        
        // Format automatique de la plaque d'immatriculation
        const licencePlateInput = document.getElementById('licencePlate');
        licencePlateInput.addEventListener('input', (e) => this.formatLicencePlate(e));
        licencePlateInput.addEventListener('keydown', (e) => this.handleLicencePlateKeydown(e));
        
        // Validation visuelle en temps réel pour tous les champs
        this.form.addEventListener('input', () => this.validateForm());
        this.form.addEventListener('change', () => this.validateForm());
        
        // Validation visuelle pour les selects
        ['vehicleType', 'durationMinutes', 'address'].forEach(fieldId => {
            const field = document.getElementById(fieldId);
            field.addEventListener('change', (e) => this.validateSelectField(e));
        });
    }

    setDefaultDateTime() {
        const now = new Date();
        now.setMinutes(now.getMinutes() + 30); // 30 minutes dans le futur
        const formatted = now.toISOString().slice(0, 16);
        document.getElementById('startAt').value = formatted;
    }

    handleLicencePlateKeydown(event) {
        const input = event.target;
        const cursorPos = input.selectionStart;
        const value = input.value;
        
        // Gestion de la touche Suppr (Delete) et Backspace
        if (event.key === 'Delete' || event.key === 'Backspace') {
            // Si on est sur un tiret, on passe au caractère suivant/précédent
            if (event.key === 'Delete' && value[cursorPos] === '-') {
                event.preventDefault();
                // Supprime le caractère après le tiret
                if (cursorPos + 1 < value.length) {
                    const newValue = value.slice(0, cursorPos + 1) + value.slice(cursorPos + 2);
                    input.value = newValue;
                    input.setSelectionRange(cursorPos, cursorPos);
                    this.formatLicencePlate({ target: input });
                }
                return;
            }
            
            if (event.key === 'Backspace' && cursorPos > 0 && value[cursorPos - 1] === '-') {
                event.preventDefault();
                // Supprime le caractère avant le tiret
                if (cursorPos >= 2) {
                    const newValue = value.slice(0, cursorPos - 2) + value.slice(cursorPos - 1);
                    input.value = newValue;
                    input.setSelectionRange(cursorPos - 2, cursorPos - 2);
                    this.formatLicencePlate({ target: input });
                }
                return;
            }
        }
    }

    formatLicencePlate(event) {
        const input = event.target;
        const cursorPos = input.selectionStart;
        let value = input.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
        
        // Formatage automatique : XX-XXX-XX
        let formattedValue = '';
        if (value.length >= 2) {
            formattedValue = value.slice(0, 2) + '-' + value.slice(2);
        } else {
            formattedValue = value;
        }
        
        if (value.length >= 5) {
            formattedValue = value.slice(0, 2) + '-' + value.slice(2, 5) + '-' + value.slice(5);
        }
        
        if (value.length > 7) {
            formattedValue = value.slice(0, 2) + '-' + value.slice(2, 5) + '-' + value.slice(5, 7);
        }
        
        // Calcul de la nouvelle position du curseur
        let newCursorPos = cursorPos;
        if (input.value.length < formattedValue.length) {
            // Un tiret a été ajouté
            if (formattedValue[cursorPos] === '-') {
                newCursorPos = cursorPos + 1;
            }
        }
        
        input.value = formattedValue;
        
        // Repositionner le curseur
        setTimeout(() => {
            input.setSelectionRange(newCursorPos, newCursorPos);
        }, 0);
        
        // Validation visuelle en temps réel
        const isValidFormat = /^[A-Z]{2}-[0-9]{3}-[A-Z]{2}$/.test(formattedValue);
        if (formattedValue.length === 0) {
            input.style.borderColor = '#e1e5e9'; // Neutre si vide
        } else if (isValidFormat) {
            input.style.borderColor = '#28a745'; // Vert si valide
        } else {
            input.style.borderColor = '#dc3545'; // Rouge si invalide
        }
    }

    validateForm() {
        const formData = new FormData(this.form);
        const licencePlate = formData.get('licencePlate');
        const vehicleType = formData.get('vehicleType');
        const startAt = formData.get('startAt');
        const durationMinutes = formData.get('durationMinutes');
        const address = formData.get('address');
        
        const isValid = licencePlate && 
                       licencePlate.match(/^[A-Z]{2}-[0-9]{3}-[A-Z]{2}$/) &&
                       vehicleType &&
                       startAt && 
                       durationMinutes &&
                       address;
                       
        this.submitBtn.disabled = !isValid;
        return isValid;
    }

    validateSelectField(event) {
        const field = event.target;
        if (field.value === '') {
            field.style.borderColor = '#dc3545'; // Rouge si vide
        } else {
            field.style.borderColor = '#28a745'; // Vert si sélectionné
        }
    }

    async handleSubmit(event) {
        event.preventDefault();
        
        if (!this.validateForm()) {
            this.showResult('❌ Veuillez remplir tous les champs correctement', 'error');
            return;
        }

        const formData = new FormData(this.form);
        
        // Formatage de la date pour le backend (ISO format)
        let startAtValue = formData.get('startAt');
        if (startAtValue && !startAtValue.includes('T')) {
            // Si pas de T, ajouter les secondes
            startAtValue += ':00';
        } else if (startAtValue && !startAtValue.includes('.')) {
            // Ajouter les secondes si manquantes
            startAtValue += ':00';
        }
        
        const reservationData = {
            licencePlate: formData.get('licencePlate'),
            vehicleType: formData.get('vehicleType'),
            startAt: startAtValue, // Format: 2025-09-30T15:00:00
            durationMinutes: parseInt(formData.get('durationMinutes')),
            address: formData.get('address'),
            paymentToken: formData.get('paymentToken') || 'demo'
        };

        // Validation côté client avant envoi
        console.log('Données avant validation:', reservationData);
        
        if (!reservationData.licencePlate || !reservationData.licencePlate.match(/^[A-Z]{2}-[0-9]{3}-[A-Z]{2}$/)) {
            this.showResult('❌ Format de plaque invalide', 'error');
            return;
        }
        
        if (!reservationData.vehicleType) {
            this.showResult('❌ Type de véhicule requis', 'error');
            return;
        }
        
        if (!reservationData.startAt) {
            this.showResult('❌ Date/heure de début requise', 'error');
            return;
        }
        
        if (!reservationData.durationMinutes || isNaN(reservationData.durationMinutes)) {
            this.showResult('❌ Durée invalide', 'error');
            return;
        }
        
        if (!reservationData.address) {
            this.showResult('❌ Parking requis', 'error');
            return;
        }

        this.setLoading(true);
        
        try {
            const response = await this.makeReservation(reservationData);
            
            if (response.success) {
                this.showResult(
                    `✅ ${response.message}${response.reservationId ? ' - ID: ' + response.reservationId : ''}`,
                    'success'
                );
                this.form.reset();
                this.setDefaultDateTime();
            } else {
                this.showResult(`❌ ${response.message}`, 'error');
            }
        } catch (error) {
            console.error('Erreur lors de la réservation:', error);
            this.showResult(`❌ Erreur de connexion: ${error.message}`, 'error');
        } finally {
            this.setLoading(false);
        }
    }

    async makeReservation(data) {
        console.log('Tentative de réservation avec les données:', data);
        console.log('URL utilisée:', `${this.baseURL}/parking/reserve`);
        console.log('Données JSON envoyées:', JSON.stringify(data, null, 2));
        
        try {
            const response = await fetch(`${this.baseURL}/parking/reserve`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            console.log('Réponse reçue:', response);
            console.log('Status:', response.status);
            console.log('Headers:', [...response.headers.entries()]);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Erreur de réponse:', errorText);
                
                // Tentative de parse JSON pour plus de détails
                let errorDetails = errorText;
                try {
                    const errorJson = JSON.parse(errorText);
                    if (errorJson.message) {
                        errorDetails = errorJson.message;
                    } else if (errorJson.error) {
                        errorDetails = errorJson.error;
                    }
                } catch (e) {
                    // Si ce n'est pas du JSON, garder le texte brut
                }
                
                throw new Error(`Erreur HTTP ${response.status}: ${response.statusText} - ${errorDetails}`);
            }

            const result = await response.json();
            console.log('Données de réponse:', result);
            return result;
        } catch (error) {
            console.error('Erreur lors de la requête:', error);
            throw error;
        }
    }

    setLoading(isLoading) {
        this.submitBtn.disabled = isLoading;
        
        if (isLoading) {
            this.btnText.style.display = 'none';
            this.loadingSpinner.style.display = 'inline';
            document.querySelector('main').classList.add('loading');
        } else {
            this.btnText.style.display = 'inline';
            this.loadingSpinner.style.display = 'none';
            document.querySelector('main').classList.remove('loading');
        }
    }

    showResult(message, type) {
        this.resultDiv.textContent = message;
        this.resultDiv.className = `result ${type}`;
        this.resultDiv.style.display = 'block';
        
        // Scroll vers le résultat
        this.resultDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        
        // Auto-hide après 10 secondes pour les succès
        if (type === 'success') {
            setTimeout(() => {
                this.resultDiv.style.display = 'none';
            }, 10000);
        }
    }

    // Méthode pour tester la connectivité backend
    async testBackend() {
        console.log('Test de connectivité backend...');
        try {
            // Test simple avec fetch
            console.log('Test avec fetch...');
            const response = await fetch(`${this.baseURL}/parking/reserve`, {
                method: 'OPTIONS',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            console.log('Réponse OPTIONS:', response.status, response.statusText);
            
            // Test ping simple
            const pingResponse = await fetch(`${this.baseURL}/ping`, {
                method: 'GET'
            }).catch(() => null);
            
            if (pingResponse) {
                console.log('Ping réussi:', pingResponse.status);
            }
            
            return response.ok || response.status === 405 || response.status === 404; // 405/404 = OK pour nos tests
        } catch (error) {
            console.error('Erreur de connectivité:', error);
            return false;
        }
    }
}

// Initialisation de l'application
document.addEventListener('DOMContentLoaded', () => {
    const app = new ParkAndSeeAPI();
    
    // Test de connectivité au démarrage
    app.testBackend().then(isConnected => {
        if (!isConnected) {
            app.showResult(
                '⚠️ Impossible de se connecter au backend. Vérifiez que le serveur Spring Boot est démarré sur le port 8081.',
                'error'
            );
        }
    });
});

// Gestion des erreurs globales
window.addEventListener('error', (event) => {
    console.error('Erreur globale:', event.error);
});

// Service Worker pour le cache (optionnel, pour une PWA future)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // navigator.serviceWorker.register('/sw.js'); // Uncomment when SW is ready
    });
}