# Park & See - Frontend React

## 🎯 Description
Frontend React pour l'application Park & See - Gestion intelligente du stationnement urbain (Phase 1: Parkings publics).

## 🚀 Lancement de l'application

### Prérequis
- Node.js 16+ installé
- Backend Spring Boot en cours d'exécution sur http://localhost:8081

### Installation et démarrage

1. **Installer les dépendances :**
   ```bash
   cd frontend-react
   npm install
   ```

2. **Démarrer l'application React :**
   ```bash
   npm start
   ```

3. **Ouvrir dans le navigateur :**
   L'application s'ouvre automatiquement sur http://localhost:3000

## 🏗️ Structure du projet

```
frontend-react/
├── public/
│   └── index.html          # Point d'entrée HTML
├── src/
│   ├── components/
│   │   ├── ParkingReservation.js    # Composant principal de réservation
│   │   └── ParkingReservation.css   # Styles du composant
│   ├── App.js              # Composant racine de l'application
│   ├── App.css             # Styles globaux de l'app
│   ├── index.js            # Point d'entrée React
│   └── index.css           # Styles de base
├── package.json            # Configuration et dépendances
└── README.md              # Ce fichier
```

## 🎨 Fonctionnalités

- ✅ **Réservation de parking** avec validation en temps réel
- ✅ **Formatage automatique** de la plaque d'immatriculation
- ✅ **Interface responsive** adaptée mobile/desktop
- ✅ **Connexion backend** avec indicateur de statut
- ✅ **Validation de formulaire** avancée
- ✅ **Gestion d'erreurs** complète

## 🔧 Technologies utilisées

- **React 18** avec Hooks (useState, useEffect)
- **JSX** pour le rendu des composants
- **CSS3** avec animations et design responsive
- **Fetch API** pour la communication avec le backend
- **React Scripts** pour le build et le développement

## 🌐 API Backend

L'application communique avec le backend Spring Boot :
- **URL:** http://localhost:8081
- **Endpoint de réservation:** POST /api/parking/reserve
- **Endpoint de statut:** GET /api/parking/status

## 📱 Interface utilisateur

L'application propose :
1. **Formulaire de réservation** avec :
   - Plaque d'immatriculation (format FR)
   - Type de véhicule
   - Date/heure de début
   - Durée de stationnement
   - Choix du parking

2. **Validation en temps réel** :
   - Formatage automatique de la plaque
   - Vérification des champs obligatoires
   - Feedback visuel (vert/rouge)

3. **Indicateur de connexion** backend en temps réel

## 🎯 Commandes disponibles

- `npm start` - Démarrage en mode développement
- `npm build` - Build pour la production
- `npm test` - Lancement des tests
- `npm eject` - Ejection de la configuration (non réversible)

---

**Note:** Ceci est une vraie application React avec JSX, pas du HTML qui charge React via CDN !