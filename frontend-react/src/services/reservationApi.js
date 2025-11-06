/**
 * Service API pour les réservations Park & See.
 * Gère la création de réservations via la nouvelle API REST.
 */

const API_BASE_URL = 'http://localhost:8081/api';

/**
 * Normalise une plaque d'immatriculation.
 * Format: trim().toUpperCase().replace(/\s+/g,'')
 * @param {string} plate - Plaque brute
 * @returns {string} Plaque normalisée (ex: "AB-123-CD")
 */
export function normalizePlate(plate) {
  if (!plate) return '';
  return plate.trim().toUpperCase().replace(/\s+/g, '');
}

/**
 * Convertit une date locale en ISO-8601 UTC.
 * @param {string} localDateTime - Date au format "2025-11-06T20:30" (local)
 * @returns {string} Date au format ISO-8601 UTC "2025-11-06T20:30:00Z"
 */
export function toUTCInstant(localDateTime) {
  if (!localDateTime) return null;
  const date = new Date(localDateTime);
  return date.toISOString(); // Format: "2025-11-06T19:30:00.000Z"
}

/**
 * Crée une nouvelle réservation de parking.
 * POST /api/reservations
 * 
 * @param {Object} params - Paramètres de la réservation
 * @param {string} params.plate - Plaque d'immatriculation (sera normalisée)
 * @param {string} params.vehicleType - Type de véhicule (CAR, MOTORCYCLE, VAN, etc.)
 * @param {string} params.parkingId - UUID du parking
 * @param {string} params.startAt - Date/heure de début (format local "YYYY-MM-DDTHH:mm")
 * @param {number} params.durationMinutes - Durée en minutes
 * @param {string} params.paymentMethod - Méthode de paiement (CARD, LYDIA, PAYPAL)
 * @param {number} params.amountCents - Montant en centimes
 * @returns {Promise<Object>} Réponse de l'API avec les détails de la réservation créée
 * @throws {Error} Si la requête échoue ou si les paramètres sont invalides
 */
export async function createReservation({
  plate,
  vehicleType,
  parkingId,
  startAt,
  durationMinutes,
  paymentMethod = 'CARD',
  amountCents
}) {
  // Validation côté client
  if (!plate || !vehicleType || !parkingId || !startAt || !durationMinutes) {
    throw new Error('Tous les champs sont obligatoires');
  }

  if (durationMinutes <= 0) {
    throw new Error('La durée doit être positive');
  }

  if (amountCents < 0) {
    throw new Error('Le montant ne peut pas être négatif');
  }

  // Normaliser la plaque
  const normalizedPlate = normalizePlate(plate);

  // Convertir la date locale en UTC (ISO-8601)
  const startAtUTC = toUTCInstant(startAt);

  // Construire le payload
  const payload = {
    plate: normalizedPlate,
    vehicleType: vehicleType.toUpperCase(),
    parkingId,
    startAt: startAtUTC,
    durationMinutes: parseInt(durationMinutes, 10),
    payment: {
      method: paymentMethod,
      amountCents: parseInt(amountCents, 10)
    }
  };

  console.log('📤 POST /api/reservations:', JSON.stringify(payload, null, 2));

  // Envoyer la requête
  const response = await fetch(`${API_BASE_URL}/reservations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  // Gérer les erreurs
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.message || `Erreur ${response.status}: ${response.statusText}`;
    throw new Error(errorMessage);
  }

  // Retourner les données de la réservation créée
  const data = await response.json();
  console.log('✅ Réservation créée:', data);
  return data;
}

/**
 * Récupère la liste des parkings disponibles.
 * GET /api/parkings (à implémenter si nécessaire)
 */
export async function getParkings() {
  // Données en dur pour le moment (à remplacer par un vrai appel API)
  return [
    { id: '550e8400-e29b-41d4-a716-446655440001', name: 'Parking Centre Ville', capacity: 40 },
    { id: '550e8400-e29b-41d4-a716-446655440002', name: 'Parking Gare', capacity: 50 },
    { id: '550e8400-e29b-41d4-a716-446655440003', name: 'Parking République', capacity: 30 },
    { id: '550e8400-e29b-41d4-a716-446655440004', name: 'Parking Liberté', capacity: 25 },
    { id: '550e8400-e29b-41d4-a716-446655440005', name: 'Parking Mairie', capacity: 35 }
  ];
}
