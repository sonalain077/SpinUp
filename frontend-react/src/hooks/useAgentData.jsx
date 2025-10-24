import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  computeOverdueKpis, 
  computeOccupationByParking,
  computeGlobalStats,
  groupOverdueTicketsByParking
} from '../lib/overdue';
import { normalizeParkingName } from '../lib/parkings';

const API_BASE = '/api/agent/overdue';
const REFRESH_INTERVAL = 30000; // 30 secondes

/**
 * Hook personnalisé pour gérer toutes les données du Dashboard Agent
 * Gère le fetching, le rafraîchissement automatique, et les mises à jour optimistes
 */
export function useAgentData() {
  // États des données brutes
  const [tickets, setTickets] = useState([]);
  const [parkings, setParkings] = useState([]);
  const [history, setHistory] = useState([]);
  
  // États UI
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  // Ref pour le timer
  const timerRef = useRef(null);

  /**
   * Fetch toutes les données en parallèle
   */
  const fetchAllData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setError(null);

    try {
      // Tentative avec le nouvel endpoint /all-active (tous les véhicules)
      let ticketsRes = await fetch(`${API_BASE}/all-active`);
      
      // Fallback : Si 404, utiliser l'ancien endpoint / (seulement véhicules en excès)
      if (ticketsRes.status === 404) {
        console.warn('⚠️ [useAgentData] Endpoint /all-active non disponible, fallback vers /');
        ticketsRes = await fetch(`${API_BASE}`);
      }

      const [occupationRes, historyRes] = await Promise.all([
        fetch(`${API_BASE}/occupation/by-zone`), // Stats par parking
        fetch(`${API_BASE}/history`) // Historique COMPLETED
      ]);

      if (!ticketsRes.ok || !occupationRes.ok || !historyRes.ok) {
        throw new Error('Erreur lors du chargement des données');
      }

      const [ticketsData, occupationData, historyData] = await Promise.all([
        ticketsRes.json(),
        occupationRes.json(),
        historyRes.json()
      ]);

      // Mapper les données backend vers format attendu par le frontend
      // Backend: startAt, durationMinutes, address
      // Frontend: startTime, duration, parkingZone
      const mappedTickets = ticketsData.map(t => ({
        ...t,
        startTime: t.startAt,           // startAt → startTime
        duration: t.durationMinutes,    // durationMinutes → duration
        parkingZone: normalizeParkingName(t.address),  // address → parkingZone (normalisé)
        endTime: t.updatedAt            // Pour l'historique
      }));

      const mappedHistory = historyData.map(h => ({
        ...h,
        startTime: h.startAt,
        duration: h.durationMinutes,
        parkingZone: normalizeParkingName(h.address),  // Normaliser aussi l'historique
        endTime: h.updatedAt
      }));

      const parkingsData = occupationData.map(p => ({
        name: normalizeParkingName(p.parkingName),  // Normaliser le nom du parking
        capacity: p.totalCapacity,
        occupiedPlaces: p.occupiedPlaces,
        availablePlaces: p.availablePlaces,
        occupationRate: p.occupationRate
      }));

      console.log('📊 [useAgentData] Données chargées:', {
        tickets: mappedTickets.length,
        parkings: parkingsData.length,
        history: mappedHistory.length
      });

      // Debug: Afficher la répartition des véhicules par parking
      const ticketsByParking = mappedTickets.reduce((acc, t) => {
        const parking = t.parkingZone || 'Inconnu';
        acc[parking] = (acc[parking] || 0) + 1;
        return acc;
      }, {});
      console.log('🚗 [useAgentData] Véhicules par parking (tickets):', ticketsByParking);
      console.log('🅿️ [useAgentData] Parkings reçus du backend:', parkingsData.map(p => `${p.name} (${p.occupiedPlaces}/${p.capacity})`));

      // Debug: vérifier le mapping des champs
      if (mappedTickets.length > 0) {
        console.log('🔍 [useAgentData] Premier ticket mappé:', {
          original: ticketsData[0],
          mapped: mappedTickets[0],
          hasStartTime: !!mappedTickets[0].startTime,
          hasDuration: !!mappedTickets[0].duration,
          hasParkingZone: !!mappedTickets[0].parkingZone
        });
      }

      setTickets(mappedTickets);
      setParkings(parkingsData);
      setHistory(mappedHistory);
      setLastUpdate(new Date());

    } catch (err) {
      console.error('❌ [useAgentData] Erreur fetch:', err);
      
      // Message d'erreur plus explicite
      let errorMessage = 'Erreur lors du chargement des données';
      if (err.message.includes('fetch')) {
        errorMessage = 'Impossible de se connecter au serveur backend';
      } else if (err.message.includes('JSON')) {
        errorMessage = 'Format de données invalide reçu du serveur';
      }
      
      setError(errorMessage);
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  /**
   * Signaler un véhicule (optimistic UI)
   */
  const signalVehicle = useCallback(async (reservationId) => {
    console.log('🚨 [useAgentData] Signalement véhicule:', reservationId);

    // Sauvegarde pour rollback
    const previousTickets = [...tickets];

    // Mise à jour optimiste
    setTickets(prevTickets => 
      prevTickets.map(t => 
        t.id === reservationId 
          ? { ...t, status: 'SIGNALE' }
          : t
      )
    );

    try {
      const res = await fetch(`${API_BASE}/${reservationId}/signal`, {
        method: 'PUT'
      });

      if (!res.ok) {
        throw new Error('Échec du signalement');
      }

      console.log('✅ [useAgentData] Véhicule signalé avec succès');
      
      // Rafraîchir pour être sûr de la cohérence
      await fetchAllData(true);

      return { success: true };

    } catch (err) {
      console.error('❌ [useAgentData] Erreur signalement:', err);
      
      // Rollback
      setTickets(previousTickets);
      
      return { success: false, error: err.message };
    }
  }, [tickets, fetchAllData]);

  /**
   * Régulariser un véhicule (optimistic UI)
   */
  const regularizeVehicle = useCallback(async (reservationId) => {
    console.log('✅ [useAgentData] Régularisation véhicule:', reservationId);

    // Sauvegarde pour rollback
    const previousTickets = [...tickets];
    const previousHistory = [...history];

    // Trouver le ticket à régulariser
    const ticketToRegularize = tickets.find(t => t.id === reservationId);

    // Mise à jour optimiste
    setTickets(prevTickets => 
      prevTickets.filter(t => t.id !== reservationId)
    );

    if (ticketToRegularize) {
      setHistory(prevHistory => [
        { ...ticketToRegularize, status: 'COMPLETED', endTime: new Date().toISOString() },
        ...prevHistory
      ]);
    }

    try {
      const res = await fetch(`${API_BASE}/${reservationId}/regularize`, {
        method: 'PUT'
      });

      if (!res.ok) {
        throw new Error('Échec de la régularisation');
      }

      console.log('✅ [useAgentData] Véhicule régularisé avec succès');
      
      // Rafraîchir pour être sûr de la cohérence
      await fetchAllData(true);

      return { success: true };

    } catch (err) {
      console.error('❌ [useAgentData] Erreur régularisation:', err);
      
      // Rollback
      setTickets(previousTickets);
      setHistory(previousHistory);
      
      return { success: false, error: err.message };
    }
  }, [tickets, history, fetchAllData]);

  /**
   * Démarrage et cleanup du timer de rafraîchissement
   */
  useEffect(() => {
    // Chargement initial
    fetchAllData();

    // Timer de rafraîchissement
    timerRef.current = setInterval(() => {
      console.log('🔄 [useAgentData] Rafraîchissement automatique...');
      fetchAllData(true); // Silent refresh
    }, REFRESH_INTERVAL);

    // Cleanup
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [fetchAllData]);

  /**
   * Calcul des données dérivées (mémoïsées implicitement par les deps)
   */
  const kpis = computeOverdueKpis(tickets, history); // Passer l'historique pour le compteur
  const occupationByParking = computeOccupationByParking(tickets, parkings);
  const globalStats = computeGlobalStats(occupationByParking, tickets); // Passer tickets pour comptage exact
  const overdueGroups = groupOverdueTicketsByParking(tickets);

  return {
    // Données brutes
    tickets,
    parkings,
    history,
    
    // Données calculées
    kpis,
    occupationByParking,
    globalStats,
    overdueGroups,
    
    // États UI
    loading,
    error,
    lastUpdate,
    
    // Actions
    signalVehicle,
    regularizeVehicle,
    refresh: () => fetchAllData(false)
  };
}
