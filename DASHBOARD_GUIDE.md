# Dashboard Agent - Guide de Démarrage Rapide

## 🚀 Lancement

### Backend
```bash
cd backend
mvn spring-boot:run
# Backend disponible sur http://localhost:8081
```

### Frontend
```bash
cd frontend-react
npm install  # Si première fois
npm run dev
# Frontend disponible sur http://localhost:5173
```

### Accès Dashboard Agent
```
http://localhost:5173/agent-dashboard
```

## 🧪 Lancer les tests

### Tests unitaires
```bash
cd frontend-react
npm test

# Mode watch (développement)
npm test -- --watch

# Coverage
npm test -- --coverage
```

### Tests spécifiques
```bash
# Tester uniquement lib/overdue.js
npm test -- overdue.test.js

# Tester avec verbose
npm test -- --verbose
```

## 📖 Structure du projet

```
frontend-react/src/
├── lib/
│   ├── overdue.js              # ✅ Utilitaires de calcul (340 lignes)
│   └── __tests__/
│       └── overdue.test.js     # ✅ 50+ tests unitaires
├── hooks/
│   └── useAgentData.jsx        # ✅ Hook de gestion d'état (180 lignes)
└── components/
    └── agent/
        ├── AgentDashboard.jsx           # ✅ Composant principal (155 lignes)
        ├── AgentDashboard.css           # ✅ Styles complets (1050 lignes)
        ├── StatsGlobales.jsx            # Section 1: Stats globales
        ├── OccupationGrid.jsx           # Section 2: Grille parkings
        ├── ParkingModal.jsx             # Modale détails parking
        ├── OverdueKpis.jsx              # Section 3: KPI excès
        ├── RegularizedHistoryModal.jsx  # Modale historique
        ├── OverdueTicketsByParking.jsx  # Section 4: Infractions
        └── TicketCard.jsx               # Carte ticket individuel
```

## 🎯 Scénario de test complet

### 1. Créer un véhicule en infraction
```
1. Aller sur http://localhost:5173/reservation
2. Remplir le formulaire:
   - Plaque: TEST-001
   - Type: Voiture
   - Parking: République
   - Cocher "🎬 Démo infraction (1 minute)"
3. Soumettre
```

### 2. Observer le dashboard
```
1. Aller sur http://localhost:5173/agent-dashboard
2. Attendre 1 minute (le véhicule expire)
3. Rafraîchir ou attendre le refresh auto (30s)
4. Le véhicule apparaît dans "Infractions par parking"
```

### 3. Tester les actions
```
1. Cliquer "🚨 Signaler" sur le ticket
   → Toast de succès
   → KPI "Déjà signalés" +1
   → Ticket change d'apparence

2. Cliquer "✅ Régulariser maintenant"
   → Toast de succès
   → KPI "Régularisés" +1
   → Ticket disparaît

3. Cliquer "📜 Voir l'historique" (sous KPI Régularisés)
   → Modale avec le véhicule régularisé
   → Trier par date/excès/parking
   → Cliquer "📥 Exporter CSV"
   → Fichier téléchargé
```

### 4. Tester les modales
```
1. Cliquer "📋 Détails" sur une carte parking
   → Modale avec liste des véhicules
   → Tester la recherche par plaque
   → Tester le tri (statut/plaque/excès)
   → Fermer avec ESC ou bouton ✕

2. Vérifier la navigation clavier
   → Tab pour naviguer entre les éléments
   → Focus visible sur tous les boutons
```

## 🔍 Vérification de la cohérence KPI

### Formules à vérifier manuellement
```
✅ "En excès maintenant" = Compter les tickets ACTIVE avec badge "⏰ En excès"
✅ "Déjà signalés" = Compter les tickets avec statut SIGNALE
✅ "Régularisés" = Nombre d'entrées dans l'historique
✅ "Véhicules garés" = Somme des occupations de tous les parkings
✅ Occupation parking = Exclut les COMPLETED/CANCELLED
```

### Exemple de calcul
```
Si vous voyez:
- 3 tickets ACTIVE en excès
- 2 tickets SIGNALE
- 5 tickets dans l'historique

Les KPI doivent afficher:
- En excès maintenant: 3
- Déjà signalés: 2
- Régularisés: 5
- Temps total excès: somme des excès des 5 tickets (3 actifs + 2 signalés)
```

## 📱 Test responsive

### Breakpoints à tester
```bash
# Mobile (320px - 767px)
- Toutes les grilles en 1 colonne
- Modales en largeur 95vw
- Boutons empilés verticalement

# Tablet (768px - 1023px)
- Grilles en 2 colonnes
- Modales centrées
- Header en ligne

# Desktop (1024px+)
- Grilles en 3-5 colonnes
- Layout optimisé
- Tous les espaces visibles
```

### Outils de test
```
Chrome DevTools:
1. F12 → Toggle device toolbar (Ctrl+Shift+M)
2. Sélectionner différents devices
3. Tester rotation portrait/paysage
```

## ⚡ Performance

### Métriques attendues
```
✅ Chargement initial: < 1s
✅ Refresh auto (30s): silencieux, pas de lag
✅ Actions (signaler/régulariser): feedback immédiat
✅ Animations: fluides (60 FPS)
✅ Modales: ouverture instantanée
```

### Vérifier les optimisations
```javascript
// Les calculs KPI sont mémoïsés automatiquement par les deps du hook
// Pas de re-calcul si les tickets n'ont pas changé
```

## 🐛 Debugging

### Logs de développement
```javascript
// Les logs sont déjà en place dans le code:
console.log('📊 [useAgentData] Données chargées:', ...)
console.log('📊 [AgentDashboard] État actuel:', ...)
```

### Ouvrir la console
```
Chrome: F12 → Console
Firefox: F12 → Console
```

### Vérifier les appels API
```
Chrome DevTools → Network
Filtrer par XHR
Vérifier:
- /api/agent/current-vehicles
- /api/agent/occupation
- /api/agent/history
- /api/agent/signal/:id
- /api/agent/regularize/:id
```

## 📊 Couverture de tests

### Objectifs
```
✅ lib/overdue.js: > 90% coverage
✅ Tous les cas nominaux testés
✅ Tous les cas d'erreur testés
✅ Tous les cas limites testés
```

### Lancer avec coverage
```bash
npm test -- --coverage --watchAll=false
```

### Résultats attendus
```
File                | % Stmts | % Branch | % Funcs | % Lines
--------------------|---------|----------|---------|--------
lib/overdue.js      |   95+   |   90+    |   100   |   95+
```

## 🎨 Personnalisation des styles

### Variables CSS à modifier
```css
/* frontend-react/src/components/agent/AgentDashboard.css */

:root {
  --color-primary: #3b82f6;    /* Bleu principal */
  --color-success: #10b981;    /* Vert succès */
  --color-warning: #f59e0b;    /* Orange avertissement */
  --color-danger: #ef4444;     /* Rouge danger */
  
  --spacing-md: 1rem;          /* Espacement standard */
  --border-radius-lg: 12px;    /* Coins arrondis */
}
```

### Modifier les seuils
```javascript
// frontend-react/src/lib/overdue.js

// Seuils de sévérité (ligne ~55)
export function getSeverity(overdueMinutes) {
  if (overdueMinutes === 0) return 'none';
  if (overdueMinutes <= 20) return 'light';     // ← Modifier ici
  if (overdueMinutes <= 60) return 'moderate';  // ← Modifier ici
  return 'severe';
}

// Seuils d'occupation (ligne ~200)
let state = 'low';
if (percentage >= 70) state = 'high';      // ← Modifier ici
else if (percentage >= 30) state = 'medium'; // ← Modifier ici
```

## 📚 Documentation API

### Endpoints utilisés
```
GET  /api/agent/current-vehicles  → Liste des tickets ACTIVE + SIGNALE
GET  /api/agent/occupation         → Liste des parkings avec capacité
GET  /api/agent/history            → Liste des tickets COMPLETED
PUT  /api/agent/signal/:id         → Marquer un ticket comme SIGNALE
PUT  /api/agent/regularize/:id     → Marquer un ticket comme COMPLETED
```

### Format de réponse attendu
```json
// current-vehicles
[
  {
    "id": 1,
    "licencePlate": "AB-123-CD",
    "vehicleType": "Voiture",
    "parkingZone": "République",
    "status": "ACTIVE",
    "startTime": "2025-10-24T10:00:00",
    "duration": 30
  }
]

// occupation
[
  {
    "name": "République",
    "capacity": 100
  }
]
```

## 🔐 Sécurité

### Points vérifiés
```
✅ Pas de données sensibles loggées
✅ Validation des données d'entrée (backend)
✅ CORS configuré correctement
✅ Pas de XSS (React échappe automatiquement)
```

## 🚀 Prochaines étapes

### Améliorations suggérées
```
1. [ ] Ajouter des filtres (parking, sévérité, statut)
2. [ ] Implémenter la virtualisation pour >50 tickets
3. [ ] Ajouter des graphiques (Chart.js ou Recharts)
4. [ ] Mode sombre (dark mode)
5. [ ] Internationalisation (react-i18next)
6. [ ] Tests E2E (Playwright/Cypress)
7. [ ] PWA (Service Worker pour offline)
```

## 📞 Support

Pour toute question sur le Dashboard Agent:
1. Consulter `DASHBOARD_REFONTE_PR.md` (documentation complète)
2. Consulter `RESUME_DASHBOARD_AGENT.txt` (contexte technique)
3. Vérifier les logs de la console navigateur
4. Vérifier les logs du backend Spring Boot

---

✨ **Dashboard Agent modernisé - Octobre 2025**
