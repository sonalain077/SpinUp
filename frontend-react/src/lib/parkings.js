/**
 * Utilitaires pour la gestion des parkings
 * Centralise les noms de parkings et leur normalisation
 */

/**
 * Liste des 5 parkings actifs du système
 * IMPORTANT: Ces noms DOIVENT correspondre exactement à ceux dans la base de données (champ 'address')
 */
export const PARKING_NAMES = {
  CENTRE_VILLE: 'Parking Centre Ville',
  GARE: 'Parking Gare',
  REPUBLIQUE: 'Parking République',
  LIBERTE: 'Parking Liberté',
  MAIRIE: 'Parking Mairie'
};

/**
 * Configuration complète des parkings
 */
const parkingConfig = {
  'Parking Centre Ville': {
    name: 'Parking Centre Ville',
    shortName: 'Centre Ville',
    icon: '🏙️',
    capacity: 40,
    color: '#3B82F6'
  },
  'Parking Gare': {
    name: 'Parking Gare',
    shortName: 'Gare',
    icon: '🚉',
    capacity: 50,
    color: '#10B981'
  },
  'Parking République': {
    name: 'Parking République',
    shortName: 'République',
    icon: '🏢',
    capacity: 30,
    color: '#8B5CF6'
  },
  'Parking Liberté': {
    name: 'Parking Liberté',
    shortName: 'Liberté',
    icon: '🌳',
    capacity: 25,
    color: '#F59E0B'
  },
  'Parking Mairie': {
    name: 'Parking Mairie',
    shortName: 'Mairie',
    icon: '🏛️',
    capacity: 35,
    color: '#EF4444'
  }
};

/**
 * Normalise un nom de parking (gère les variations d'encodage et de casse)
 * @param {string} parkingName - Nom du parking potentiellement mal encodé
 * @returns {string} Nom normalisé ou nom original si non reconnu
 */
export function normalizeParkingName(parkingName) {
  if (!parkingName) return parkingName;

  // Nettoyer et normaliser
  const cleaned = parkingName.trim();

  // Vérification directe
  if (parkingConfig[cleaned]) {
    return cleaned;
  }

  // Recherche insensible à la casse
  const lowerName = cleaned.toLowerCase();
  const found = Object.keys(parkingConfig).find(
    key => key.toLowerCase() === lowerName
  );

  return found || parkingName;
}

/**
 * Retourne l'icône d'un parking
 * @param {string} parkingName - Nom du parking
 * @returns {string} Emoji icône
 */
export function getParkingIcon(parkingName) {
  const normalized = normalizeParkingName(parkingName);
  return parkingConfig[normalized]?.icon || '🅿️';
}

/**
 * Retourne le nom court d'un parking
 * @param {string} parkingName - Nom du parking
 * @returns {string} Nom court
 */
export function getParkingShortName(parkingName) {
  const normalized = normalizeParkingName(parkingName);
  return parkingConfig[normalized]?.shortName || parkingName;
}

/**
 * Retourne la capacité d'un parking
 * @param {string} parkingName - Nom du parking
 * @returns {number} Capacité (nombre de places)
 */
export function getParkingCapacity(parkingName) {
  const normalized = normalizeParkingName(parkingName);
  return parkingConfig[normalized]?.capacity || 0;
}

/**
 * Retourne la couleur associée à un parking
 * @param {string} parkingName - Nom du parking
 * @returns {string} Code couleur hexadécimal
 */
export function getParkingColor(parkingName) {
  const normalized = normalizeParkingName(parkingName);
  return parkingConfig[normalized]?.color || '#6B7280';
}

/**
 * Retourne la liste de tous les parkings disponibles
 * @returns {Array} Liste des parkings avec toutes leurs infos
 */
export function getAllParkings() {
  return Object.values(parkingConfig);
}

/**
 * Vérifie si un nom de parking est valide
 * @param {string} parkingName - Nom du parking à vérifier
 * @returns {boolean} True si valide
 */
export function isValidParking(parkingName) {
  if (!parkingName) return false;
  const normalized = normalizeParkingName(parkingName);
  return parkingConfig.hasOwnProperty(normalized);
}

/**
 * Retourne l'affichage formaté d'un parking (icône + nom)
 * @param {string} parkingName - Nom du parking
 * @param {boolean} short - Utiliser le nom court
 * @returns {string} Format "🏙️ Parking Centre Ville"
 */
export function getParkingDisplay(parkingName, short = false) {
  const icon = getParkingIcon(parkingName);
  const name = short ? getParkingShortName(parkingName) : parkingName;
  return `${icon} ${name}`;
}
