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
        
        // Validation en temps réel
        this.form.addEventListener('input', () => this.validateForm());
    }

    setDefaultDateTime() {
        const now = new Date();
        now.setMinutes(now.getMinutes() + 30); // 30 minutes dans le futur
        const formatted = now.toISOString().slice(0, 16);
        document.getElementById('startAt').value = formatted;
    }

    formatLicencePlate(event) {
        let value = event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
        
        if (value.length > 2) {
            value = value.slice(0, 2) + '-' + value.slice(2);
        }
        if (value.length > 6) {
            value = value.slice(0, 6) + '-' + value.slice(6);
        }
        if (value.length > 9) {
            value = value.slice(0, 9);
        }
        
        event.target.value = value;
    }

    validateForm() {
        const formData = new FormData(this.form);
        const licencePlate = formData.get('licencePlate');
        const startAt = formData.get('startAt');
        const address = formData.get('address');
        
        const isValid = licencePlate && 
                       licencePlate.match(/^[A-Z]{2}-[0-9]{3}-[A-Z]{2}$/) &&
                       startAt && 
                       address;
                       
        this.submitBtn.disabled = !isValid;
        return isValid;
    }

    async handleSubmit(event) {
        event.preventDefault();
        
        if (!this.validateForm()) {
            this.showResult('❌ Veuillez remplir tous les champs correctement', 'error');
            return;
        }

        const formData = new FormData(this.form);
        const reservationData = {
            licencePlate: formData.get('licencePlate'),
            startAt: formData.get('startAt'),
            durationMinutes: parseInt(formData.get('durationMinutes')),
            address: formData.get('address'),
            paymentToken: formData.get('paymentToken')
        };

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
                throw new Error(`Erreur HTTP ${response.status}: ${response.statusText} - ${errorText}`);
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