# Connexion Agent Dashboard au Backend

## ✅ Résumé des Modifications

Le **Agent Dashboard** est maintenant entièrement connecté à la base de données PostgreSQL via l'API REST backend Spring Boot.

## 🔗 Endpoints Connectés

### 1. Liste des véhicules en excès
- **Endpoint**: `GET /api/agent/overdue`
- **Service**: `OverdueControlService.findAllOverdueReservations()`
- **Données**: Tous les véhicules en excès (statut ACTIVE en dépassement + SIGNALE)
- **Affichage**: Liste détaillée par parking avec badges de sévérité

### 2. Statistiques d'occupation globale
- **Endpoint**: `GET /api/agent/occupation`
- **Service**: `OverdueControlService.getOccupationStats()`
- **Données**: 
  - Total véhicules garés (ACTIVE + SIGNALE)
  - Capacité totale (180 places)
  - Taux d'occupation
  - Places disponibles
- **Affichage**: Carte "Véhicules garés" avec barre de progression

### 3. Occupation par parking (5 parkings)
- **Endpoint**: `GET /api/agent/occupation/by-zone`
- **Service**: `OverdueControlService.getOccupationByZone()`
- **Données**: Pour chaque parking:
  - Nom du parking
  - Places occupées
  - Capacité totale
  - Places disponibles
  - Taux d'occupation (%)
- **Affichage**: Grille de 5 cartes avec barres de progression et indicateurs colorés

### 4. Historique des régularisations
- **Endpoint**: `GET /api/agent/overdue/history`
- **Service**: `OverdueControlService.getRegularizedHistory()`
- **Données**: Véhicules avec statut COMPLETED
- **Affichage**: Modal avec tableau historique

### 5. Véhicules d'un parking spécifique
- **Endpoint**: `GET /api/agent/parking/{parkingName}/vehicles`
- **Service**: `OverdueControlService.findVehiclesByParking()`
- **Données**: Tous véhicules présents (ACTIVE + SIGNALE) dans ce parking
- **Affichage**: Modal au clic sur une carte parking

### 6. Signaler une infraction
- **Endpoint**: `PUT /api/agent/overdue/{reservationId}/signal`
- **Service**: `OverdueControlService.signalInfraction()`
- **Action**: Change statut ACTIVE → SIGNALE
- **UI**: Bouton "🚨 Signaler l'infraction"

### 7. Régulariser un excès
- **Endpoint**: `PUT /api/agent/overdue/{reservationId}/regularize`
- **Service**: `OverdueControlService.regularizeInfraction()`
- **Action**: Change statut ACTIVE/SIGNALE → COMPLETED
- **UI**: Bouton "✅ Excès régularisé"

## 📊 Données Affichées

### Depuis ReservationEntity (base de données)
Chaque véhicule affiché contient les données réelles :

```json
{
  "id": "uuid-v4",
  "licencePlate": "AB-123-CD",
  "vehicleType": "CAR|MOTORCYCLE|BICYCLE|TRUCK|ELECTRIC_SCOOTER",
  "startAt": "2025-10-31T14:30:00",
  "durationMinutes": 60,
  "address": "Parking Centre Ville",
  "status": "ACTIVE|SIGNALE|COMPLETED",
  "createdAt": "2025-10-31T14:30:00",
  "updatedAt": "2025-10-31T15:45:00"
}
```

### Calculs en Temps Réel
- **Temps d'excès** : `Math.max(0, now - (startAt + durationMinutes))`
- **Sévérité** :
  - LÉGER : 1-30 minutes d'excès
  - MODÉRÉ : 31-60 minutes d'excès
  - GRAVE : > 60 minutes d'excès
  - SIGNALÉ : Statut SIGNALE (déjà marqué par agent)

### Statistiques Calculées
1. **En excès maintenant** : Nombre de véhicules ACTIVE avec temps dépassé
2. **Déjà signalés** : Nombre de véhicules SIGNALE
3. **Régularisés** : Nombre de véhicules COMPLETED
4. **Temps total excès** : Somme des dépassements de tous les véhicules
5. **Moyenne excès** : Temps moyen par véhicule en infraction

### Indices Avancés
- **Indice de saturation** : Critique si ≥2 parkings >85% OU ≥30% parkings critiques
- **Indice de répartition** : Basé sur l'écart-type des taux d'occupation

## 🔄 Flux de Données

```
┌─────────────────────────────────────────────────────────┐
│ Utilisateur paye sur ParkingReservation                │
│ (frontend-react/src/components/ParkingReservation.jsx) │
└─────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│ POST /api/parking/reserve-and-pay                       │
│ (backend/controller/ParkingController.java)             │
└─────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│ ParkingService.reserveAndPay()                          │
│ Crée ReservationEntity avec status=ACTIVE               │
│ (backend/service/ParkingService.java)                   │
└─────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│ ReservationRepository.save()                            │
│ INSERT INTO reservations (...)                          │
│ (backend/repository/ReservationRepository.java)         │
└─────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│ PostgreSQL Database                                     │
│ Table: reservations                                     │
└─────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│ Agent Dashboard (toutes les 30 secondes)                │
│ GET /api/agent/overdue                                  │
│ GET /api/agent/occupation                               │
│ GET /api/agent/occupation/by-zone                       │
│ (frontend-react/src/components/AgentDashboard.jsx)     │
└─────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│ OverdueControlService                                   │
│ - findAllOverdueReservations()                          │
│ - getOccupationStats()                                  │
│ - getOccupationByZone()                                 │
│ (backend/service/OverdueControlService.java)            │
└─────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│ Dashboard affiche les données en temps réel             │
│ - Véhicules garés par parking                           │
│ - Infractions en cours                                  │
│ - Statistiques d'excès                                  │
└─────────────────────────────────────────────────────────┘
```

## 🎨 Affichage Préservé

L'affichage et la logique du dashboard ont été **entièrement conservés** :

✅ **Design glassmorphism** intact  
✅ **Animations et transitions** préservées  
✅ **Calculs de sévérité** (LÉGER/MODÉRÉ/GRAVE) maintenus  
✅ **Groupement par parking** conservé  
✅ **Statistiques avancées** (indice saturation, répartition) inchangées  
✅ **Logs console détaillés** pour debugging  
✅ **Actualisation automatique** toutes les 30 secondes  
✅ **Modals** (historique, véhicules par parking) fonctionnels  

## 🔍 Logs Backend

Le backend produit des logs détaillés pour chaque requête :

```
🔍 ===== findAllOverdueReservations() =====
📊 Total réservations ACTIVE: 3
  ✅ ACTIVE en excès: AB-123-CD @ Parking Centre Ville
  ❌ ACTIVE OK (pas en excès): EF-456-GH
📊 ACTIVE en excès: 1
📊 Réservations SIGNALE: 2
  🚨 SIGNALE: IJ-789-KL @ Parking Gare
  🚨 SIGNALE: MN-012-OP @ Parking République
✅ Total tickets retournés: 3
=========================================

📊 ========== CALCUL OCCUPATION PAR ZONE ==========
🏗️ Parkings configurés: [Parking Centre Ville, Parking Gare, ...]
📊 Total réservations actives (ACTIVE + SIGNALE): 5
  🚗 AB-123-CD @ "Parking Centre Ville" (ACTIVE)
  🚗 EF-456-GH @ "Parking Gare" (ACTIVE)
  ...
✅ Stats finales:
   Parking Centre Ville: 2/40 (5%)
   Parking Gare: 3/50 (6%)
========== FIN CALCUL OCCUPATION ==========
```

## ✅ Tests à Effectuer

1. **Lancer le backend** : `.\scripts\start-backend-once.ps1`
2. **Lancer le frontend** : `npm run dev` (dans frontend-react)
3. **Créer une réservation** sur l'interface utilisateur
4. **Vérifier Agent Dashboard** :
   - [ ] Occupation globale s'incrémente
   - [ ] Parking concerné montre +1 véhicule
   - [ ] Véhicule apparaît dans la liste (si en excès)
   - [ ] Statistiques se mettent à jour
5. **Signaler une infraction** (bouton 🚨)
   - [ ] Badge passe à "SIGNALÉ"
   - [ ] Compteur "Déjà signalés" s'incrémente
6. **Régulariser** (bouton ✅)
   - [ ] Véhicule disparaît de la liste active
   - [ ] Apparaît dans l'historique
   - [ ] Compteur "Régularisés" s'incrémente

## 📦 Fichiers Modifiés

- `frontend-react/src/components/AgentDashboard.jsx` (3 lignes)
  - Correction des endpoints API

## 🎯 Endpoints Backend Existants

**Tous les endpoints nécessaires existaient déjà** dans `OverdueControlController.java` :

- ✅ GET `/api/agent/overdue`
- ✅ GET `/api/agent/occupation`
- ✅ GET `/api/agent/occupation/by-zone`
- ✅ GET `/api/agent/overdue/history`
- ✅ GET `/api/agent/parking/{parkingName}/vehicles`
- ✅ PUT `/api/agent/overdue/{reservationId}/signal`
- ✅ PUT `/api/agent/overdue/{reservationId}/regularize`

**Aucun endpoint supplémentaire n'a été créé.**

## 🔒 Sécurité

Les endpoints `/api/agent/**` sont configurés avec `permitAll()` dans `SecurityConfig.java` pour permettre l'accès sans authentification (mode développement).

En production, il faudra :
- Ajouter une authentification JWT
- Restreindre l'accès aux agents autorisés uniquement
- Ajouter des logs d'audit pour les actions sensibles

## 🚀 Prochaines Étapes

1. ✅ Connexion backend terminée
2. 🔄 Tests en conditions réelles
3. ⏳ Ajout authentification JWT (optionnel)
4. ⏳ Déploiement production

---

**Date de connexion** : 31 octobre 2025  
**Branche** : `fix/backend_connexion_agent`  
**Commit** : `062e4eb`  
