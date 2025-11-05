/**
 * Utilitaires pour la gestion des types de véhicules
 * Centralise la correspondance entre les types backend et l'affichage frontend
 */

/**
 * Types de véhicules définis dans le backend (enum VehicleType)
 */
export const VEHICLE_TYPES = {
  CAR: 'CAR',
  MOTORCYCLE: 'MOTORCYCLE',
  VAN: 'VAN',
  BICYCLE: 'BICYCLE',
  ELECTRIC_SCOOTER: 'ELECTRIC_SCOOTER'
};

/**
 * Configuration complète des types de véhicules
 */
const vehicleTypeConfig = {
  CAR: {
    icon: '🚗',
    label: 'Voiture',
    shortLabel: 'Voiture',
    color: '#3B82F6' // Bleu
  },
  MOTORCYCLE: {
    icon: '🏍️',
    label: '2 roues',
    shortLabel: '2 roues',
    color: '#EF4444' // Rouge
  },
  VAN: {
    icon: '🚐',
    label: 'Camionnette',
    shortLabel: 'Camionnette',
    color: '#F59E0B' // Orange
  },
  BICYCLE: {
    icon: '🚴',
    label: 'Vélo',
    shortLabel: 'Vélo',
    color: '#10B981' // Vert
  },
  ELECTRIC_SCOOTER: {
    icon: '🛴',
    label: 'Trottinette électrique',
    shortLabel: 'Trottinette',
    color: '#8B5CF6' // Violet
  }
};

/**
 * Retourne l'icône emoji pour un type de véhicule
 * @param {string} type - Type de véhicule (CAR, MOTORCYCLE, etc.)
 * @returns {string} Emoji correspondant
 */
export function getVehicleTypeIcon(type) {
  if (!type) return '🚙'; // Icône par défaut
  
  const upperType = type.toUpperCase();
  return vehicleTypeConfig[upperType]?.icon || '🚙';
}

/**
 * Retourne le label français pour un type de véhicule
 * @param {string} type - Type de véhicule (CAR, MOTORCYCLE, etc.)
 * @param {boolean} short - Utiliser le label court
 * @returns {string} Label en français
 */
export function getVehicleTypeLabel(type, short = false) {
  if (!type) return 'Véhicule';
  
  const upperType = type.toUpperCase();
  const config = vehicleTypeConfig[upperType];
  
  if (!config) return type;
  
  return short ? config.shortLabel : config.label;
}

/**
 * Retourne la couleur associée à un type de véhicule
 * @param {string} type - Type de véhicule (CAR, MOTORCYCLE, etc.)
 * @returns {string} Code couleur hexadécimal
 */
export function getVehicleTypeColor(type) {
  if (!type) return '#6B7280'; // Gris par défaut
  
  const upperType = type.toUpperCase();
  return vehicleTypeConfig[upperType]?.color || '#6B7280';
}

/**
 * Retourne l'icône et le label formatés
 * @param {string} type - Type de véhicule
 * @param {boolean} short - Utiliser le label court
 * @returns {string} Format "🚗 Voiture"
 */
export function getVehicleTypeDisplay(type, short = false) {
  const icon = getVehicleTypeIcon(type);
  const label = getVehicleTypeLabel(type, short);
  return `${icon} ${label}`;
}

/**
 * Statistiques par type de véhicule
 * @param {Array} tickets - Liste des tickets/réservations
 * @returns {Object} Compte par type
 */
export function getVehicleTypeStats(tickets) {
  const stats = {
    CAR: 0,
    MOTORCYCLE: 0,
    VAN: 0,
    BICYCLE: 0,
    ELECTRIC_SCOOTER: 0
  };

  tickets.forEach(ticket => {
    const type = ticket.vehicleType?.toUpperCase();
    if (stats.hasOwnProperty(type)) {
      stats[type]++;
    }
  });

  return stats;
}

/**
 * Retourne une liste formatée des types de véhicules disponibles pour la réservation
 * Seuls les types autorisés sont retournés : Voiture, 2 roues, Camionnette
 * @returns {Array} [{value: 'CAR', label: 'Voiture', icon: '🚗'}, ...]
 */
export function getVehicleTypeOptions() {
  // Types autorisés pour la réservation
  const allowedTypes = ['CAR', 'MOTORCYCLE', 'VAN'];
  
  return allowedTypes.map(type => ({
    value: type,
    label: vehicleTypeConfig[type].label,
    shortLabel: vehicleTypeConfig[type].shortLabel,
    icon: vehicleTypeConfig[type].icon,
    color: vehicleTypeConfig[type].color
  }));
}
