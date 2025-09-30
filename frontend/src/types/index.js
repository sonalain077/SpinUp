// Types pour l'application Park & See
// Simulation TypeScript en JavaScript avec JSDoc

/**
 * @typedef {Object} PaymentRequest
 * @property {string} licencePlate - Format AB-123-CD
 * @property {string} vehicleType - Type de véhicule
 * @property {string} startAt - Date/heure de début (ISO string)
 * @property {number} durationMinutes - Durée en minutes
 * @property {string} address - Adresse du parking
 * @property {string} [paymentToken] - Token de paiement (optionnel)
 */

/**
 * @typedef {Object} PaymentResponse
 * @property {boolean} success - Succès de l'opération
 * @property {string} message - Message de retour
 * @property {string} [reservationId] - ID de réservation (optionnel)
 */

/**
 * @typedef {Object} FormData
 * @property {string} licencePlate
 * @property {string} vehicleType
 * @property {string} startAt
 * @property {number} durationMinutes
 * @property {string} address
 * @property {string} paymentToken
 */

// Export global pour les autres modules
window.ParkAndSeeTypes = {
    // Types disponibles globalement
};