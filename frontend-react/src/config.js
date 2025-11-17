/**
 * Configuration centralisée de l'application
 * L'URL de l'API est récupérée depuis les variables d'environnement Vite
 */

// Récupération de l'URL API depuis .env (VITE_API_URL)
// Fallback sur localhost:8080 si non définie
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

// URL complète de l'API
export const API_URL = `${API_BASE_URL}/api`;

// Endpoints spécifiques
export const ENDPOINTS = {
  health: `${API_BASE_URL}/health`,
  parking: {
    reserve: `${API_URL}/parking/reserve`,
    search: `${API_URL}/parking/search`,
    payOverdue: `${API_URL}/parking/pay-overdue`,
    confirmExit: `${API_URL}/parking/confirm-exit`,
    checkExit: `${API_URL}/parking/check-exit`,
    extend: `${API_URL}/parking/extend`,
    occupancy: `${API_URL}/parking/occupancy`,
  },
  agent: {
    overview: `${API_URL}/agent/overview`,
    infringements: `${API_URL}/agent/infringements`,
    regularizedHistory: `${API_URL}/agent/regularized-history`,
    parkingVehicles: (parkingName) => `${API_URL}/agent/parking/${encodeURIComponent(parkingName)}/vehicles`,
  },
};

export default {
  API_BASE_URL,
  API_URL,
  ENDPOINTS,
};
