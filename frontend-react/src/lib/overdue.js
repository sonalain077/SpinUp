/**
 * Utilitaires de calcul pour les excès de stationnement
 * Fonctions pures pour calculer les KPI, durées, sévérités
 */

/**
 * Calcule les minutes d'excès pour une réservation
 * @param {Object} reservation - Objet réservation avec startTime et duration
 * @returns {number} Minutes d'excès (0 si pas d'excès)
 */
export function calculateOverdueMinutes(reservation) {
  if (!reservation || !reservation.startTime || !reservation.duration) {
    return 0;
  }

  try {
    const start = new Date(reservation.startTime);
    const now = new Date();
    const elapsedMinutes = Math.floor((now - start) / (1000 * 60));
    const overdueMinutes = elapsedMinutes - reservation.duration;
    
    return Math.max(0, overdueMinutes);
  } catch (error) {
    console.error('❌ Erreur calcul overdueMinutes:', error);
    return 0;
  }
}

/**
 * Calcule le temps restant ou dépassé pour une réservation
 * @param {Object} reservation
 * @returns {Object} { remaining: number, isOverdue: boolean }
 */
export function calculateTimeRemaining(reservation) {
  if (!reservation || !reservation.startTime || !reservation.duration) {
    return { remaining: 0, isOverdue: false };
  }

  try {
    const start = new Date(reservation.startTime);
    const now = new Date();
    const elapsedMinutes = Math.floor((now - start) / (1000 * 60));
    const remaining = reservation.duration - elapsedMinutes;
    
    return {
      remaining: Math.abs(remaining),
      isOverdue: remaining < 0
    };
  } catch (error) {
    console.error('❌ Erreur calcul temps restant:', error);
    return { remaining: 0, isOverdue: false };
  }
}

/**
 * Détermine la sévérité d'un excès
 * @param {number} overdueMinutes
 * @returns {'none'|'light'|'moderate'|'severe'}
 */
export function getSeverity(overdueMinutes) {
  if (overdueMinutes === 0) return 'none';
  if (overdueMinutes <= 20) return 'light';
  if (overdueMinutes <= 60) return 'moderate';
  return 'severe';
}

/**
 * Obtient le label et l'emoji pour une sévérité
 * @param {'none'|'light'|'moderate'|'severe'} severity
 * @returns {Object} { label: string, emoji: string, color: string }
 */
export function getSeverityInfo(severity) {
  const map = {
    none: { label: 'Normal', emoji: '✅', color: 'green' },
    light: { label: 'Léger', emoji: '⚠️', color: 'orange' },
    moderate: { label: 'Modéré', emoji: '⏰', color: 'orange' },
    severe: { label: 'Grave', emoji: '🚨', color: 'red' }
  };
  return map[severity] || map.none;
}

/**
 * Formate une durée en minutes en chaîne lisible
 * @param {number} minutes
 * @returns {string} Format "1h 24min" ou "45min"
 */
export function formatDuration(minutes) {
  if (!minutes || minutes < 0) return '0min';
  
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours === 0) return `${mins}min`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}min`;
}

/**
 * Calcule tous les KPI d'excès à partir d'une liste de tickets
 * @param {Array} tickets - Liste des réservations ACTIVES (ACTIVE + SIGNALE)
 * @param {Array} history - Liste de l'historique (COMPLETED)
 * @returns {Object} KPI calculés
 */
export function computeOverdueKpis(tickets, history = []) {
  if (!tickets || tickets.length === 0) {
    return {
      activeOverdue: 0,           // En excès maintenant
      signaled: 0,                // Déjà signalés
      regularized: history.length, // Régularisés (depuis l'historique)
      averageOverdue: 0,          // Moyenne excès
      totalOverdueMinutes: 0      // Temps total excès
    };
  }

  // Filtres par statut
  const activeTickets = tickets.filter(t => t.status === 'ACTIVE');
  const signaledTickets = tickets.filter(t => t.status === 'SIGNALE');

  // Tickets actifs en excès
  const activeOverdueTickets = activeTickets.filter(t => {
    const overdue = calculateOverdueMinutes(t);
    return overdue > 0;
  });

  // Calcul moyenne et total des excès (ACTIVE en excès + SIGNALE)
  const overdueTickets = [...activeOverdueTickets, ...signaledTickets];
  const totalOverdueMinutes = overdueTickets.reduce((sum, t) => {
    return sum + calculateOverdueMinutes(t);
  }, 0);

  const averageOverdue = activeOverdueTickets.length > 0
    ? Math.round(totalOverdueMinutes / overdueTickets.length)
    : 0;

  return {
    activeOverdue: activeOverdueTickets.length,
    signaled: signaledTickets.length,
    regularized: history.length, // Utiliser la taille de l'historique
    averageOverdue,
    totalOverdueMinutes
  };
}

/**
 * Calcule l'occupation totale (ACTIVE + SIGNALE)
 * @param {Array} tickets
 * @returns {number}
 */
export function computeTotalOccupation(tickets) {
  if (!tickets || tickets.length === 0) return 0;
  
  return tickets.filter(t => 
    t.status === 'ACTIVE' || t.status === 'SIGNALE'
  ).length;
}

/**
 * Calcule l'occupation par parking
 * @param {Array} tickets
 * @param {Array} parkings - Liste des parkings avec capacity
 * @returns {Array} Parkings enrichis avec occupation
 */
export function computeOccupationByParking(tickets, parkings) {
  if (!parkings || parkings.length === 0) return [];

  console.log('📊 [computeOccupationByParking] Calcul occupation...');
  console.log('  Tickets reçus:', tickets.length);
  console.log('  Parkings reçus:', parkings.length);

  return parkings.map(parking => {
    const vehiclesInParking = tickets.filter(t => {
      const matches = t.parkingZone === parking.name && 
                     (t.status === 'ACTIVE' || t.status === 'SIGNALE');
      
      // Debug: afficher les correspondances
      if (matches) {
        console.log(`  ✅ Match: ${t.licencePlate} → ${parking.name} (${t.status})`);
      }
      
      return matches;
    });

    const occupation = vehiclesInParking.length;
    const capacity = parking.capacity || 100;
    const percentage = capacity > 0 ? Math.round((occupation / capacity) * 100) : 0;

    console.log(`  🅿️ ${parking.name}: ${occupation}/${capacity} véhicules (${percentage}%)`);

    // Déterminer l'état selon les seuils
    let state = 'low';
    if (percentage >= 70) state = 'high';
    else if (percentage >= 30) state = 'medium';

    return {
      ...parking,
      occupation,
      percentage,
      state,
      vehicles: vehiclesInParking
    };
  });
}

/**
 * Calcule les statistiques globales d'occupation
 * @param {Array} occupationByParking - Données d'occupation par parking
 * @param {Array} allTickets - Tous les tickets actifs (pour le comptage total exact)
 * @returns {Object}
 */
export function computeGlobalStats(occupationByParking, allTickets = []) {
  if (!occupationByParking || occupationByParking.length === 0) {
    return {
      totalVehicles: 0,
      totalCapacity: 0,
      globalPercentage: 0,
      saturationIndex: 0,
      mostFilledParking: null,
      distributionIndex: 0
    };
  }

  // Compter TOUS les véhicules actifs (directement depuis tickets pour éviter les doublons/oublis)
  const totalVehicles = allTickets.filter(t => 
    t.status === 'ACTIVE' || t.status === 'SIGNALE'
  ).length;
  
  const totalCapacity = occupationByParking.reduce((sum, p) => sum + (p.capacity || 0), 0);
  const globalPercentage = totalCapacity > 0 
    ? Math.round((totalVehicles / totalCapacity) * 100) 
    : 0;

  // Indice de saturation (moyenne des pourcentages)
  const saturationIndex = occupationByParking.length > 0
    ? Math.round(
        occupationByParking.reduce((sum, p) => sum + p.percentage, 0) / 
        occupationByParking.length
      )
    : 0;

  // Parking le plus rempli
  const mostFilledParking = occupationByParking.reduce((max, p) => 
    (!max || p.percentage > max.percentage) ? p : max
  , null);

  // Indice de répartition (écart-type des pourcentages, normalisé 0-100)
  const avgPercentage = saturationIndex;
  const variance = occupationByParking.reduce((sum, p) => 
    sum + Math.pow(p.percentage - avgPercentage, 2), 0
  ) / occupationByParking.length;
  const stdDev = Math.sqrt(variance);
  // Plus l'écart-type est faible, meilleure est la répartition
  // On inverse: 100 = parfaitement réparti, 0 = très déséquilibré
  const distributionIndex = Math.max(0, Math.min(100, Math.round(100 - stdDev)));

  return {
    totalVehicles,
    totalCapacity,
    globalPercentage,
    saturationIndex,
    mostFilledParking,
    distributionIndex
  };
}

/**
 * Filtre et groupe les tickets d'infraction par parking
 * @param {Array} tickets
 * @returns {Array} Groupes { parkingName, tickets: [...] }
 */
export function groupOverdueTicketsByParking(tickets) {
  if (!tickets || tickets.length === 0) return [];

  console.log('🔍 [groupOverdueTicketsByParking] Input tickets:', tickets.length);

  // Filtrer les tickets avec excès (ACTIVE en excès OU SIGNALE)
  const overdueTickets = tickets.filter(t => {
    if (t.status === 'SIGNALE') {
      console.log(`  ✅ Ticket ${t.licencePlate} (SIGNALE) → ${t.parkingZone}`);
      return true;
    }
    if (t.status === 'ACTIVE') {
      const overdue = calculateOverdueMinutes(t);
      if (overdue > 0) {
        console.log(`  ✅ Ticket ${t.licencePlate} (ACTIVE, ${overdue}min excès) → ${t.parkingZone}`);
      }
      return overdue > 0;
    }
    return false;
  });

  console.log('✅ [groupOverdueTicketsByParking] Tickets en excès:', overdueTickets.length);

  // Grouper par parking (parkingZone déjà normalisé dans useAgentData)
  const groups = {};
  overdueTickets.forEach(ticket => {
    const parkingName = ticket.parkingZone || 'Inconnu';
    if (!groups[parkingName]) {
      groups[parkingName] = [];
    }
    groups[parkingName].push(ticket);
  });

  console.log('🅿️ [groupOverdueTicketsByParking] Groupes créés:', Object.keys(groups));

  // Convertir en tableau
  return Object.entries(groups).map(([parkingName, parkingTickets]) => ({
    parkingName,
    count: parkingTickets.length,
    tickets: parkingTickets.sort((a, b) => {
      // Trier: ACTIVE en excès d'abord, puis SIGNALE
      if (a.status !== b.status) {
        return a.status === 'ACTIVE' ? -1 : 1;
      }
      // Par durée d'excès décroissante
      return calculateOverdueMinutes(b) - calculateOverdueMinutes(a);
    })
  })).sort((a, b) => b.count - a.count); // Parkings avec le plus d'infractions d'abord
}

/**
 * Exporte l'historique des régularisations en CSV
 * @param {Array} history - Réservations COMPLETED
 * @returns {string} Contenu CSV
 */
export function exportRegularizedToCSV(history) {
  if (!history || history.length === 0) {
    return 'Plaque,Type,Parking,Durée Excès,Date Régularisation\n';
  }

  const headers = 'Plaque,Type,Parking,Durée Excès,Date Régularisation\n';
  const rows = history.map(item => {
    const overdue = calculateOverdueMinutes(item);
    const date = item.endTime ? new Date(item.endTime).toLocaleString('fr-FR') : 'N/A';
    return `${item.licencePlate},${item.vehicleType},${item.parkingZone},${formatDuration(overdue)},${date}`;
  }).join('\n');

  return headers + rows;
}

/**
 * Télécharge un fichier CSV
 * @param {string} content - Contenu CSV
 * @param {string} filename - Nom du fichier
 */
export function downloadCSV(content, filename = 'export.csv') {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}
