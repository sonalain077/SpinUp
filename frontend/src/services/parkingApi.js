// Service API pour Park & See
const ParkingAPI = {
    baseURL: 'http://localhost:8081/api/parking',

    /**
     * Effectue une réservation de parking
     * @param {PaymentRequest} data - Données de réservation
     * @returns {Promise<PaymentResponse>} Réponse de l'API
     */
    async reserveAndPay(data) {
        console.log('Tentative de réservation avec les données:', data);
        console.log('URL utilisée:', `${this.baseURL}/reserve`);
        console.log('Données JSON envoyées:', JSON.stringify(data, null, 2));
        
        try {
            const response = await fetch(`${this.baseURL}/reserve`, {
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
    },

    /**
     * Test de connectivité backend
     * @returns {Promise<boolean>} True si connecté
     */
    async testBackend() {
        console.log('Test de connectivité backend...');
        try {
            const response = await fetch(`${this.baseURL}/ping`, {
                method: 'GET'
            });
            console.log('Ping réussi:', response.status);
            return response.ok;
        } catch (error) {
            console.error('Erreur de connectivité:', error);
            return false;
        }
    }
};

// Export global
window.ParkingAPI = ParkingAPI;