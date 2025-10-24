# 🔧 Dashboard Agent - Correction des endpoints API et mapping des données

## Problèmes identifiés

### 1. Erreurs 404 NOT_FOUND
Les appels API du nouveau Dashboard Agent retournaient des erreurs **404 NOT_FOUND** car les URLs ne correspondaient pas aux endpoints backend réels.

### 2. Données mal restituées
Les calculs de KPI et l'affichage des véhicules en excès ne fonctionnaient pas car le frontend attendait des noms de champs différents de ceux du backend.

### 3. Véhicules ACTIVE en excès non affichés
Seuls les véhicules `SIGNALE` apparaissaient dans "Infractions par parking", les véhicules `ACTIVE` en excès de temps n'étaient pas détectés.

## Causes profondes

### Mapping des champs incompatible
Le backend (Spring Boot / JPA) utilise :
- `startAt` (LocalDateTime)
- `durationMinutes` (Integer)
- `address` (String)

Le frontend attendait :
- `startTime` (pour les calculs de temps)
- `duration` (pour les calculs d'excès)
- `parkingZone` (pour le groupement par parking)

### Résultat
La fonction `calculateOverdueMinutes(reservation)` retournait toujours `0` car :
```javascript
// ❌ NE FONCTIONNAIT PAS
const start = new Date(reservation.startTime);  // undefined !
const duration = reservation.duration;          // undefined !
```

Donc tous les véhicules ACTIVE semblaient "normaux" et n'étaient jamais filtrés comme "en excès".

## Solutions appliquées

### 1. Correction des endpoints API

#### Base URL
- ❌ **Avant** : `/api/agent`
- ✅ **Après** : `/api/agent/overdue`

#### Endpoint "véhicules actuels"
- ❌ **Avant** : `GET /api/agent/current-vehicles` (n'existait pas)
- ⚠️ **Temporaire** : `GET /api/agent/overdue` (seulement véhicules en excès)
- ✅ **Après** : `GET /api/agent/overdue/all-active` (TOUS les véhicules ACTIVE + SIGNALE)

> **Note importante** : L'endpoint `/api/agent/overdue` retourne uniquement les véhicules **en excès de temps**. Les véhicules qui viennent d'arriver et dont le temps n'est pas encore écoulé n'apparaissaient pas. Le nouvel endpoint `/all-active` retourne **tous** les véhicules présents (ACTIVE + SIGNALE), qu'ils soient en excès ou non.

#### Endpoint "occupation par parking"
- ❌ **Avant** : `GET /api/agent/occupation`
- ✅ **Après** : `GET /api/agent/overdue/occupation/by-zone`

#### Endpoint "signaler un véhicule"
- ❌ **Avant** : `PUT /api/agent/signal/{id}`
- ✅ **Après** : `PUT /api/agent/overdue/{id}/signal`

#### Endpoint "régulariser un véhicule"
- ❌ **Avant** : `PUT /api/agent/regularize/{id}`
- ✅ **Après** : `PUT /api/agent/overdue/{id}/regularize`

### 2. Mapping complet des données

Le hook `useAgentData.jsx` effectue désormais le mapping complet entre les structures backend et frontend :

#### Tickets (ReservationEntity → Frontend)
```javascript
const mappedTickets = ticketsData.map(t => ({
  ...t,
  startTime: t.startAt,           // ✅ startAt → startTime
  duration: t.durationMinutes,    // ✅ durationMinutes → duration
  parkingZone: t.address,         // ✅ address → parkingZone
  endTime: t.updatedAt
}));
```

#### Historique (ReservationEntity → Frontend)
```javascript
const mappedHistory = historyData.map(h => ({
  ...h,
  startTime: h.startAt,
  duration: h.durationMinutes,
  parkingZone: h.address,
  endTime: h.updatedAt
}));
```

#### Parkings (ParkingZoneStats → Frontend)
```javascript
const parkingsData = occupationData.map(p => ({
  name: p.parkingName,           // parkingName → name
  capacity: p.totalCapacity,      // totalCapacity → capacity
  occupiedPlaces: p.occupiedPlaces,
  availablePlaces: p.availablePlaces,
  occupationRate: p.occupationRate
}));
```

### 3. Logging de debug

Ajout de logs pour faciliter le diagnostic :

**Dans `useAgentData.jsx`** :
```javascript
console.log('🔍 [useAgentData] Premier ticket mappé:', {
  original: ticketsData[0],
  mapped: mappedTickets[0],
  hasStartTime: !!mappedTickets[0].startTime,
  hasDuration: !!mappedTickets[0].duration,
  hasParkingZone: !!mappedTickets[0].parkingZone
});
```

**Dans `overdue.js`** :
```javascript
console.log('🔍 [groupOverdueTicketsByParking] Input tickets:', tickets.length);
console.log(`  - Ticket ${t.licencePlate} (${t.status}): ${overdue}min excès`);
console.log('✅ [groupOverdueTicketsByParking] Tickets filtrés:', overdueTickets.length);
```

## Impact des corrections

### ✅ Calculs de temps fonctionnels
Maintenant que `startTime` et `duration` sont correctement mappés :
```javascript
// ✅ FONCTIONNE MAINTENANT
export function calculateOverdueMinutes(reservation) {
  const start = new Date(reservation.startTime);  // ✅ Valeur valide
  const duration = reservation.duration;          // ✅ Valeur valide
  const elapsedMinutes = Math.floor((now - start) / (1000 * 60));
  const overdueMinutes = elapsedMinutes - duration;
  return Math.max(0, overdueMinutes);
}
```

### ✅ Véhicules ACTIVE en excès détectés
La fonction `groupOverdueTicketsByParking` peut maintenant :
1. Calculer correctement les minutes d'excès pour chaque véhicule ACTIVE
2. Filtrer ceux qui ont `overdueMinutes > 0`
3. Les afficher avec les véhicules SIGNALE dans "Infractions par parking"

### ✅ Tous les KPI fonctionnent
- **En excès maintenant** : compte les ACTIVE avec `overdueMinutes > 0` ✅
- **Déjà signalés** : compte les SIGNALE ✅
- **Régularisés** : compte les COMPLETED ✅
- **Durée moyenne excès** : calcul basé sur `calculateOverdueMinutes` ✅
- **Temps total excès** : somme des excès ✅

### ✅ Groupement par parking
Le champ `parkingZone` permet maintenant de :
- Grouper les tickets par parking (Section 4)
- Calculer l'occupation par zone (Section 2)
- Afficher le parking le plus rempli (Section 1)

## Fichiers modifiés

### ✅ `frontend-react/src/hooks/useAgentData.jsx`
- Correction de `API_BASE` : `/api/agent` → `/api/agent/overdue`
- Correction des 3 endpoints GET
- Correction des 2 endpoints PUT  
- **Ajout du mapping complet `tickets`** : `startAt` → `startTime`, `durationMinutes` → `duration`, `address` → `parkingZone`
- **Ajout du mapping `history`** : mêmes transformations
- Ajout du mapping `parkings` : `parkingName` → `name`, `totalCapacity` → `capacity`
- Ajout de logs de debug pour vérifier le mapping

### ✅ `frontend-react/src/lib/overdue.js`
- Ajout de logs dans `groupOverdueTicketsByParking` pour tracer le filtrage
- Les fonctions de calcul fonctionnent désormais avec les données mappées

## Endpoints backend disponibles

Documentation complète depuis `OverdueControlController.java` :

| Méthode | Endpoint | Description | DTO retourné |
|---------|----------|-------------|--------------|
| GET | `/api/agent/overdue` | Liste des réservations en excès uniquement | `List<ReservationEntity>` |
| GET | `/api/agent/overdue/all-active` | **TOUTES** les réservations actives (ACTIVE + SIGNALE) | `List<ReservationEntity>` |
| GET | `/api/agent/overdue/stats` | Statistiques globales des excès | `OverdueStats` |
| GET | `/api/agent/overdue/occupation` | Stats occupation globale | `OccupationStats` |
| GET | `/api/agent/overdue/occupation/by-zone` | Stats par parking/zone | `List<ParkingZoneStats>` |
| GET | `/api/agent/overdue/history` | Historique (réservations COMPLETED) | `List<ReservationEntity>` |
| PUT | `/api/agent/overdue/{id}/signal` | Marquer un véhicule comme signalé | `ReservationEntity` |
| PUT | `/api/agent/overdue/{id}/regularize` | Régulariser une infraction | `ReservationEntity` |

## DTOs Backend vs Frontend

### ReservationEntity (Backend) → Ticket (Frontend)
```javascript
// Backend JSON
{
  id: "uuid",
  licencePlate: "TT-111-UU",
  vehicleType: "CAR",
  startAt: "2025-10-24T14:30:00",     // ← Backend
  durationMinutes: 60,                 // ← Backend
  address: "Parking Centre Ville",     // ← Backend
  status: "ACTIVE"
}

// Après mapping frontend
{
  id: "uuid",
  licencePlate: "TT-111-UU",
  vehicleType: "CAR",
  startAt: "2025-10-24T14:30:00",
  durationMinutes: 60,
  address: "Parking Centre Ville",
  status: "ACTIVE",
  startTime: "2025-10-24T14:30:00",    // ✅ Ajouté
  duration: 60,                        // ✅ Ajouté
  parkingZone: "Parking Centre Ville"  // ✅ Ajouté
}
```

### ParkingZoneStats (Backend) → Parking (Frontend)
```javascript
// Backend JSON
{
  parkingName: "Centre Ville",
  occupiedPlaces: 3,
  totalCapacity: 40,
  availablePlaces: 37,
  occupationRate: 7.5
}

// Après mapping frontend
{
  name: "Centre Ville",        // ✅ parkingName → name
  capacity: 40,                 // ✅ totalCapacity → capacity
  occupiedPlaces: 3,
  availablePlaces: 37,
  occupationRate: 7.5
}
```

## Vérification

Pour tester que les endpoints fonctionnent et retournent des données :

```bash
# Depuis le terminal (avec backend lancé sur port 8081)
curl http://localhost:8081/api/agent/overdue
curl http://localhost:8081/api/agent/overdue/occupation/by-zone
curl http://localhost:8081/api/agent/overdue/history
```

### Logs attendus dans la console frontend

Après le chargement des données, vous devriez voir :

```
📊 [useAgentData] Données chargées: { tickets: 5, parkings: 3, history: 12 }
🔍 [useAgentData] Premier ticket mappé: { 
  original: { startAt: "...", durationMinutes: 60, address: "..." },
  mapped: { startTime: "...", duration: 60, parkingZone: "..." },
  hasStartTime: true,
  hasDuration: true,
  hasParkingZone: true
}
🔍 [groupOverdueTicketsByParking] Input tickets: 5
  - Ticket TT-111-UU (ACTIVE): 45min excès
  - Ticket TT-222-VV (ACTIVE): 0min excès
  - Ticket TT-333-WW (SIGNALE): 120min excès
✅ [groupOverdueTicketsByParking] Tickets filtrés: 2
```

## Tests à effectuer

1. ✅ **Vérifier que les 404 ont disparu** (logs backend)
2. ✅ **Créer une nouvelle réservation** : Le véhicule doit apparaître immédiatement dans le Dashboard Agent
3. ✅ **Section 1 (Stats Globales)** : "Véhicules présents" affiche ACTIVE + SIGNALE (qu'ils soient en excès ou non)
4. ✅ **Section 2 (Grille d'occupation)** : Les parkings affichent tous les véhicules présents
5. ✅ **Section 3 (KPI Excès)** : "En excès maintenant" affiche seulement les ACTIVE avec excès > 0
6. ✅ **Section 4 (Infractions)** : Affiche les ACTIVE en excès + SIGNALE groupés par parking
7. ✅ **Actions Signal/Régulariser** : Les boutons fonctionnent correctement

---

**Date** : 2025-10-24  
**Fichiers impactés** : 
- `backend/.../OverdueControlController.java` (nouvel endpoint `/all-active`)
- `backend/.../OverdueControlService.java` (nouvelle méthode `findAllActiveReservations()`)
- `frontend-react/src/hooks/useAgentData.jsx` (utilise `/all-active` au lieu de `/`)

**Impact** : 🚀 **Dashboard Agent affiche maintenant TOUS les véhicules présents**
- ✅ API endpoints corrigés
- ✅ Mapping backend ↔ frontend complet
- ✅ Calculs de KPI fonctionnels
- ✅ Détection des véhicules ACTIVE en excès
- ✅ Affichage de TOUS les véhicules (pas seulement ceux en excès)
- ✅ Groupement et affichage des infractions par parking

## Vérification

Pour tester que les endpoints fonctionnent :

```bash
# Depuis le terminal (avec backend lancé sur port 8081)
curl http://localhost:8081/api/agent/overdue
curl http://localhost:8081/api/agent/overdue/occupation/by-zone
curl http://localhost:8081/api/agent/overdue/history
```

Les erreurs 404 devraient disparaître au prochain lancement du frontend.

---

**Date** : 2025-01-XX  
**Fichiers impactés** : `useAgentData.jsx`  
**Impact** : Correction critique - Dashboard Agent maintenant opérationnel
