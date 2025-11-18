/**
 * Utilitaires pour la gestion des parkings
 * VERSION DYNAMIQUE - Charge les parkings depuis l'API backend
 */

import { ENDPOINTS } from '../services/config';

// Cache pour éviter trop de requêtes
let parkingsCache = null;
let lastFetchTime = 0;
const CACHE_DURATION = 60000; // 1 minute

/**
 * Récupère la liste des parkings depuis l'API backend
 * @returns {Promise<Array>} Liste des parkings [{id, name, address, totalSpots}]
 */
export async function fetchParkings() {
  const now = Date.now();
  
  // Utiliser le cache si valide
  if (parkingsCache && (now - lastFetchTime) < CACHE_DURATION) {
    return parkingsCache;
  }

  try {
    const response = await fetch(ENDPOINTS.parking.list);
    
    if (!response.ok) {
      throw new Error(`Erreur HTTP ${response.status}`);
    }
    
    const parkings = await response.json();
    
    // Mettre à jour le cache
    parkingsCache = parkings;
    lastFetchTime = now;
    
    console.log('✅ Parkings chargés depuis l\'API:', parkings.length);
    return parkings;
  } catch (error) {
    console.error('❌ Erreur chargement parkings:', error);
    
    // Retourner le cache même expiré si erreur réseau
    if (parkingsCache) {
      console.warn('⚠️ Utilisation du cache expiré');
      return parkingsCache;
    }
    
    return [];
  }
}

/**
 * Retourne l'icône d'un parking basée sur son nom
 * @param {string} parkingName - Nom du parking
 * @returns {string} Emoji icône
 */
export function getParkingIcon(parkingName) {
  if (!parkingName) return '🅿️';
  
  const name = parkingName.toLowerCase();
  
  // Mapping basé sur les mots-clés
  if (name.includes('centre') || name.includes('ville')) return '🏙️';
  if (name.includes('gare')) return '🚉';
  if (name.includes('république')) return '🏢';
  if (name.includes('hôtel') || name.includes('mairie')) return '🏛️';
  if (name.includes('cité') || name.includes('judiciaire')) return '⚖️';
  if (name.includes('arts') || name.includes('artiste')) return '🎨';
  
  return '🅿️'; // Icône par défaut
}

/**
 * Retourne le nom court d'un parking (sans "Parking")
 * @param {string} parkingName - Nom du parking
 * @returns {string} Nom court
 */
export function getParkingShortName(parkingName) {
  if (!parkingName) return '';
  return parkingName.replace(/^Parking\s+/i, '').trim();
}

/**
 * Retourne la couleur associée à un parking
 * @param {number} index - Index du parking dans la liste
 * @returns {string} Code couleur hexadécimal
 */
export function getParkingColor(index) {
  const colors = [
    '#3B82F6', // Bleu
    '#10B981', // Vert
    '#8B5CF6', // Violet
    '#F59E0B', // Orange
    '#EF4444', // Rouge
    '#EC4899', // Rose
    '#6366F1', // Indigo
    '#14B8A6'  // Teal
  ];
  return colors[index % colors.length];
}

/**
 * Retourne l'affichage formaté d'un parking (icône + nom)
 * @param {string} parkingName - Nom du parking
 * @param {boolean} short - Utiliser le nom court
 * @returns {string} Format "🏙️ Parking Centre-Ville"
 */
export function getParkingDisplay(parkingName, short = false) {
  const icon = getParkingIcon(parkingName);
  const name = short ? getParkingShortName(parkingName) : parkingName;
  return `${icon} ${name}`;
}

/**
 * Invalide le cache (forcer rechargement)
 */
export function clearParkingsCache() {
  parkingsCache = null;
  lastFetchTime = 0;
}
