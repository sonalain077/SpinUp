# Dashboard Agent - Architecture Visuelle

```
┌─────────────────────────────────────────────────────────────────────┐
│                         AGENT DASHBOARD                              │
│                   (AgentDashboard.jsx - 155 lignes)                  │
│                                                                       │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │  Header: Titre + Bouton Refresh + Dernière mise à jour         │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                       │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │  SECTION 1: Statistiques Globales (StatsGlobales.jsx)          │ │
│  │  ┌──────────┬──────────┬──────────┬──────────┐                 │ │
│  │  │ Véhicules│  Indice  │ Parking  │  Indice  │                 │ │
│  │  │  garés   │saturation│  le plus │répartition│                 │ │
│  │  │  [━━━]   │   45%    │  rempli  │  78/100  │                 │ │
│  │  │ (tooltip)│ (tooltip)│(tooltip) │(tooltip) │                 │ │
│  │  └──────────┴──────────┴──────────┴──────────┘                 │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                       │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │  SECTION 2: Occupation par Parking (OccupationGrid.jsx)        │ │
│  │  ┌──────────┬──────────┬──────────┬──────────┐                 │ │
│  │  │République│   Gare   │  Mairie  │  Centre  │                 │ │
│  │  │ 45/100 🟢│ 70/80 🟠│ 25/50 🟢│ 85/90 🔴│                 │ │
│  │  │ [━━━━  ] │ [━━━━━━]│ [━━   ]  │ [━━━━━━]│                 │ │
│  │  │ 📋 Détails│ 📋Détails│📋Détails│📋Détails │                 │ │
│  │  └──────────┴──────────┴──────────┴──────────┘                 │ │
│  │                                                                  │ │
│  │  └─→ Click "Détails" ouvre ParkingModal.jsx:                   │ │
│  │      ┌───────────────────────────────────────────────────────┐ │ │
│  │      │ 🅿️ République - Véhicules présents (45)        [✕]  │ │ │
│  │      │ ─────────────────────────────────────────────────── │ │ │
│  │      │ 🔍 [Rechercher...] | Trier par: [Statut ▼]        │ │ │
│  │      │ ─────────────────────────────────────────────────── │ │ │
│  │      │ Plaque    Type    Statut    Durée   Temps restant  │ │ │
│  │      │ AB-123-CD Voiture ✅Normal   30min   Reste 15min    │ │ │
│  │      │ XY-789-ZZ Voiture ⏰En excès 30min   Dépassé 10min  │ │ │
│  │      │ ...                                                 │ │ │
│  │      │ ─────────────────────────────────────────────────── │ │ │
│  │      │                                   [Fermer]          │ │ │
│  │      └───────────────────────────────────────────────────────┘ │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                       │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │  SECTION 3: KPI des Excès (OverdueKpis.jsx)                    │ │
│  │  ┌──────┬──────┬──────────┬──────┬──────┐                      │ │
│  │  │⏰ En │🚨Déjà│✅Régula- │📊Moy │⏱️Temps│                      │ │
│  │  │excès │signal│  risés   │excès │ total │                      │ │
│  │  │  12  │  8   │    45    │25min │ 5h30  │                      │ │
│  │  │      │      │📜Histo.  │      │       │                      │ │
│  │  └──────┴──────┴──────────┴──────┴──────┘                      │ │
│  │                                                                  │ │
│  │  └─→ Click "Historique" ouvre RegularizedHistoryModal.jsx:     │ │
│  │      ┌───────────────────────────────────────────────────────┐ │ │
│  │      │ 📜 Historique régularisations (45)            [✕]    │ │ │
│  │      │ ─────────────────────────────────────────────────── │ │ │
│  │      │ Trier: [Date ▼]                    [📥Export CSV]   │ │ │
│  │      │ ─────────────────────────────────────────────────── │ │ │
│  │      │ Plaque    Type  Parking  Excès   Date              │ │ │
│  │      │ AB-123-CD Voit. Républ.  45min   24/10 14:30       │ │ │
│  │      │ ...                                                 │ │ │
│  │      │ ─────────────────────────────────────────────────── │ │ │
│  │      │                                   [Fermer]          │ │ │
│  │      └───────────────────────────────────────────────────────┘ │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                       │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │  SECTION 4: Infractions par Parking (OverdueTicketsByParking)  │ │
│  │                                                                  │ │
│  │  🅿️ République                             [3 infractions]     │ │
│  │  ┌──────────────────────────────────────────────────────────┐  │ │
│  │  │ TicketCard.jsx                                           │  │ │
│  │  │ ┌────────────────────────────────────────────────────┐   │  │ │
│  │  │ │ 🚗 AB-123-CD               Voiture                 │   │  │ │
│  │  │ │ ⏱️ Durée payée: 30min   🕐 Début: 24/10 13:00     │   │  │ │
│  │  │ │ ⚠️ Excès: 45min                                    │   │  │ │
│  │  │ │ [🟠 Modéré]                                        │   │  │ │
│  │  │ │ [🚨 Signaler]  [✅ Excès régularisé]              │   │  │ │
│  │  │ └────────────────────────────────────────────────────┘   │  │ │
│  │  │ ┌────────────────────────────────────────────────────┐   │  │ │
│  │  │ │ 🚗 XY-789-ZZ               Voiture                 │   │  │ │
│  │  │ │ ⏱️ Durée payée: 30min   🕐 Début: 24/10 12:00     │   │  │ │
│  │  │ │ ⚠️ Excès: 90min                                    │   │  │ │
│  │  │ │ [🔴 Grave]                                         │   │  │ │
│  │  │ │ ⏰ En attente de régularisation                    │   │  │ │
│  │  │ │ [✅ Régulariser maintenant]                       │   │  │ │
│  │  │ └────────────────────────────────────────────────────┘   │  │ │
│  │  └──────────────────────────────────────────────────────────┘  │ │
│  │                                                                  │ │
│  │  🅿️ Gare                                   [2 infractions]     │ │
│  │  └─→ ...                                                        │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                       │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │  TOASTS (bottom-right)                                          │ │
│  │  ┌──────────────────────────────────────┐                       │ │
│  │  │ ✅ Véhicule signalé avec succès  [✕]│                       │ │
│  │  └──────────────────────────────────────┘                       │ │
│  └────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Flux de données

```
┌─────────────────────────────────────────────────────────────────┐
│                         useAgentData Hook                        │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  1. Fetch parallèle (initial + timer 30s)                │  │
│  │     • GET /api/agent/current-vehicles → tickets[]        │  │
│  │     • GET /api/agent/occupation       → parkings[]       │  │
│  │     • GET /api/agent/history          → history[]        │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              ↓                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  2. Calculs dérivés (lib/overdue.js)                     │  │
│  │     • computeOverdueKpis(tickets)      → kpis            │  │
│  │     • computeOccupationByParking(...)  → occupationBy... │  │
│  │     • computeGlobalStats(...)          → globalStats     │  │
│  │     • groupOverdueTicketsByParking(...)→ overdueGroups   │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              ↓                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  3. Export des données vers composants                   │  │
│  │     return {                                              │  │
│  │       tickets, parkings, history,  // Données brutes     │  │
│  │       kpis, occupationByParking,   // Calculées          │  │
│  │       globalStats, overdueGroups,  // Calculées          │  │
│  │       signalVehicle,               // Actions            │  │
│  │       regularizeVehicle,           // Actions            │  │
│  │       loading, error               // UI state           │  │
│  │     }                                                     │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                      AgentDashboard.jsx                          │
│                                                                  │
│  const { kpis, globalStats, ... } = useAgentData();            │
│                                                                  │
│  ┌──────────────────┬──────────────────┬──────────────────┐    │
│  │                  │                  │                  │    │
│  │  StatsGlobales   │  OccupationGrid  │  OverdueKpis     │    │
│  │  (globalStats)   │  (occupation...) │  (kpis, history) │    │
│  │                  │                  │                  │    │
│  └──────────────────┴──────────────────┴──────────────────┘    │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  OverdueTicketsByParking                                 │  │
│  │  (overdueGroups, onSignal, onRegularize)                 │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎬 Actions utilisateur

```
┌────────────────────────────────────────────────────────────┐
│  USER: Click "🚨 Signaler" sur un ticket                  │
└────────────────────────────────────────────────────────────┘
                    ↓
┌────────────────────────────────────────────────────────────┐
│  TicketCard → handleSignal()                               │
│    ├─→ setProcessing(true)  // Désactive bouton           │
│    └─→ onSignal(ticket.id)  // Appelle le hook            │
└────────────────────────────────────────────────────────────┘
                    ↓
┌────────────────────────────────────────────────────────────┐
│  useAgentData → signalVehicle(id)                          │
│    1. Sauvegarde: previousTickets = [...tickets]           │
│    2. OPTIMISTIC UPDATE:                                   │
│       setTickets(tickets.map(t =>                          │
│         t.id === id ? {...t, status:'SIGNALE'} : t         │
│       ))                                                    │
│    3. API CALL: PUT /api/agent/signal/:id                 │
│    4. SUCCESS:                                             │
│       ✅ fetchAllData(silent=true) // Re-sync              │
│       ✅ return { success: true }                          │
│    5. ERROR:                                               │
│       ❌ setTickets(previousTickets) // Rollback           │
│       ❌ return { success: false, error }                  │
└────────────────────────────────────────────────────────────┘
                    ↓
┌────────────────────────────────────────────────────────────┐
│  AgentDashboard → handleSignal()                           │
│    if (result.success)                                     │
│      showToast('✅ Véhicule signalé', 'success')          │
│    else                                                    │
│      showToast('❌ Erreur: ...', 'error')                 │
└────────────────────────────────────────────────────────────┘
                    ↓
┌────────────────────────────────────────────────────────────┐
│  UI UPDATE                                                 │
│    • Ticket change de section (ACTIVE → SIGNALE)          │
│    • KPI "Déjà signalés" +1                               │
│    • KPI "En excès maintenant" -1                          │
│    • Toast apparaît bottom-right                           │
│    • Auto-dismiss après 5s                                 │
└────────────────────────────────────────────────────────────┘
```

---

## 📁 Structure des fichiers

```
frontend-react/src/
│
├── lib/
│   ├── overdue.js                    # 📊 Utilitaires de calcul
│   │   ├── calculateOverdueMinutes()
│   │   ├── calculateTimeRemaining()
│   │   ├── getSeverity()
│   │   ├── formatDuration()
│   │   ├── computeOverdueKpis()
│   │   ├── computeTotalOccupation()
│   │   ├── computeOccupationByParking()
│   │   ├── computeGlobalStats()
│   │   ├── groupOverdueTicketsByParking()
│   │   └── exportRegularizedToCSV()
│   │
│   └── __tests__/
│       └── overdue.test.js           # 🧪 50+ tests unitaires
│
├── hooks/
│   └── useAgentData.jsx              # 🎣 Hook de gestion d'état
│       ├── fetchAllData()
│       ├── signalVehicle()
│       ├── regularizeVehicle()
│       └── useEffect() → refresh 30s
│
├── components/
│   └── agent/
│       ├── AgentDashboard.jsx        # 🏠 Composant principal
│       ├── AgentDashboard.css        # 🎨 Styles (1050 lignes)
│       │
│       ├── StatsGlobales.jsx         # 📊 Section 1
│       │   └── Tooltip()
│       │
│       ├── OccupationGrid.jsx        # 🅿️ Section 2
│       │   └── ParkingCard()
│       ├── ParkingModal.jsx          # 📋 Modale détails parking
│       │   └── VehicleRow()
│       │
│       ├── OverdueKpis.jsx           # 📈 Section 3
│       │   ├── KpiCard()
│       │   └── AnimatedNumber()
│       ├── RegularizedHistoryModal.jsx # 📜 Modale historique
│       │   └── HistoryRow()
│       │
│       ├── OverdueTicketsByParking.jsx # 🚨 Section 4
│       │   └── ParkingGroup()
│       └── TicketCard.jsx            # 🎫 Carte ticket
│
└── App.jsx                           # 🔀 Routage
    └── import AgentDashboard from './components/agent/AgentDashboard'
```

---

## 🧮 Calculs KPI détaillés

### KPI "En excès maintenant"
```javascript
tickets
  .filter(t => t.status === 'ACTIVE')
  .filter(t => calculateOverdueMinutes(t) > 0)
  .length
```

### KPI "Déjà signalés"
```javascript
tickets
  .filter(t => t.status === 'SIGNALE')
  .length
```

### KPI "Régularisés"
```javascript
history
  .filter(t => t.status === 'COMPLETED')
  .length
```

### KPI "Moyenne excès"
```javascript
const activeOverdueTickets = tickets.filter(t => 
  t.status === 'ACTIVE' && calculateOverdueMinutes(t) > 0
);

const totalOverdue = activeOverdueTickets.reduce((sum, t) => 
  sum + calculateOverdueMinutes(t), 0
);

Math.round(totalOverdue / activeOverdueTickets.length)
```

### KPI "Temps total excès"
```javascript
const overdueTickets = [
  ...tickets.filter(t => t.status === 'ACTIVE' && calculateOverdueMinutes(t) > 0),
  ...tickets.filter(t => t.status === 'SIGNALE')
];

overdueTickets.reduce((sum, t) => 
  sum + calculateOverdueMinutes(t), 0
)
```

### Occupation
```javascript
tickets
  .filter(t => t.status === 'ACTIVE' || t.status === 'SIGNALE')
  .length
```

---

## 🎯 Points clés de validation

### ✅ À vérifier avant merge
1. **Cohérence KPI** : Compter manuellement les tickets affichés = KPI
2. **Optimistic UI** : Actions instantanées avec rollback en cas d'erreur
3. **Responsive** : Tester sur mobile (320px), tablet (768px), desktop (1024px)
4. **Accessibilité** : Navigation au clavier, focus visible, ESC ferme modales
5. **Tests unitaires** : `npm test` → tous les tests passent
6. **Performance** : Pas de lag, animations fluides

### ⚠️ Dépendances backend
- Endpoints `/api/agent/*` doivent renvoyer les bonnes données
- CORS configuré pour accepter `http://localhost:5173`
- Statuts : ACTIVE, SIGNALE, COMPLETED, CANCELLED (OVERDUE obsolète)

---

**Architecture visuelle v1.0 - Dashboard Agent modernisé**  
**Date**: 24 octobre 2025
