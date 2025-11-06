/**
 * Configuration des parkings pour Park & See.
 * Mapping entre les noms d'adresse et les UUIDs des parkings.
 */

export const PARKINGS = [
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    name: 'Parking Centre Ville',
    capacity: 40
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440002',
    name: 'Parking Gare',
    capacity: 50
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440003',
    name: 'Parking République',
    capacity: 30
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440004',
    name: 'Parking Liberté',
    capacity: 25
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440005',
    name: 'Parking Mairie',
    capacity: 35
  }
];

/**
 * Trouve l'ID d'un parking par son nom.
 * @param {string} name - Nom du parking
 * @returns {string|null} UUID du parking ou null si non trouvé
 */
export function getParkingIdByName(name) {
  const parking = PARKINGS.find(p => p.name === name);
  return parking ? parking.id : null;
}

/**
 * Trouve un parking par son ID.
 * @param {string} id - UUID du parking
 * @returns {Object|null} Objet parking ou null si non trouvé
 */
export function getParkingById(id) {
  return PARKINGS.find(p => p.id === id) || null;
}

/**
 * Calcule le prix en centimes pour une durée donnée.
 * Tarif: 1€50 les 30 minutes (arrondi au supérieur).
 * @param {number} durationMinutes - Durée en minutes
 * @returns {number} Prix en centimes
 */
export function calculatePriceCents(durationMinutes) {
  if (!durationMinutes || durationMinutes <= 0) return 0;
  const pricePerHalfHour = 150; // 1€50 en centimes
  const halfHours = Math.ceil(durationMinutes / 30);
  return halfHours * pricePerHalfHour;
}

/**
 * Formate le prix en euros.
 * @param {number} cents - Prix en centimes
 * @returns {string} Prix formaté (ex: "1.50")
 */
export function formatPrice(cents) {
  return (cents / 100).toFixed(2);
}
