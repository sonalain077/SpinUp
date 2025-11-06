# Feature: Suivi en Temps Réel - Liste Véhicules & Occupation Parkings

## 📋 Description

Cette feature ajoute deux nouvelles fonctionnalités essentielles pour le dashboard Agent :
1. **Liste complète des véhicules stationnés** (pas seulement ceux en retard)
2. **Occupation en temps réel des parkings** (places disponibles/occupées)

## 🎯 Fonctionnalités Implémentées

### 1. Liste des Véhicules Stationnés

**Endpoint Backend** : `/api/vehicles/active`

**Données affichées** :
- ✅ Plaque d'immatriculation
- ✅ Type de véhicule (🚗 Voiture, 🏍️ Moto, 🚲 Vélo, 🛴 Trottinette)
- ✅ Parking et adresse
- ✅ Heure de début et fin prévue
- ✅ Durée totale et temps restant
- ✅ Statut en temps réel (ACTIF / EN RETARD)
- ✅ Montant payé

**Filtres disponibles** :
- Tous les véhicules
- Véhicules actifs uniquement
- Véhicules en retard uniquement

**Actualisation** : Auto-refresh toutes les 30 secondes

### 2. Occupation des Parkings

**Endpoint Backend** : `/api/parking/occupancy`

**Données affichées** :
- ✅ Nom et adresse du parking
- ✅ Places totales / occupées / disponibles
- ✅ Taux d'occupation en pourcentage
- ✅ Barre de progression colorée (vert/orange/rouge)
- ✅ Nombre de véhicules en retard par parking

**Indicateurs visuels** :
- 🟢 Vert : < 70% (Disponible)
- 🟠 Orange : 70-90% (Attention)
- 🔴 Rouge : > 90% (Complet)

**Actualisation** : Auto-refresh toutes les 30 secondes

## 🗄️ Base de Données

### Nouvelle Table : `parkings`

```sql
CREATE TABLE parkings (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address VARCHAR(500) NOT NULL,
    total_spots INTEGER NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);
```

### Données de Test (6 parkings)

1. **Parking Centre-Ville** - 150 places - 10 Rue de la République
2. **Parking Gare Nord** - 200 places - 25 Avenue de la Gare
3. **Parking République** - 100 places - 5 Place de la République
4. **Parking Hôtel de Ville** - 80 places - 15 Rue du Maire
5. **Parking Cité Judiciaire** - 120 places - 30 Boulevard des Tribunaux
6. **Parking des Arts** - 90 places - 8 Avenue des Artistes

## 🔧 Architecture Backend

### DTOs Créés
- `ActiveVehicleDTO` - Représente un véhicule stationné
- `ParkingOccupancyDTO` - Représente l'occupation d'un parking

### Entités
- `ParkingEntity` - Entité JPA pour les parkings

### Repositories
- `ParkingRepository` - Accès aux données des parkings

### Services
- `ActiveVehicleService` - Logique métier pour les véhicules
- `ParkingOccupancyService` - Calcul de l'occupation en temps réel

### Controllers
- `ActiveVehicleController` - Endpoints `/api/vehicles/*`
- `ParkingOccupancyController` - Endpoint `/api/parking/occupancy`

## 🎨 Architecture Frontend

### Composants React Créés

#### ActiveVehiclesList
- **Fichier** : `ActiveVehiclesList.js` + `ActiveVehiclesList.css`
- **Props** : Aucun (auto-suffisant)
- **State** : vehicles, loading, error, filter
- **Hooks** : useState, useEffect
- **Features** : Filtres, auto-refresh, indicateurs visuels

#### ParkingOccupancy
- **Fichier** : `ParkingOccupancy.js` + `ParkingOccupancy.css`
- **Props** : Aucun (auto-suffisant)
- **State** : parkings, loading, error, lastUpdate
- **Hooks** : useState, useEffect
- **Features** : Barres de progression, alertes retard, légende

### Intégration
Les deux composants sont intégrés dans `AgentDashboard.js` avec des séparateurs visuels.

## 📡 API Endpoints

### Véhicules

```http
GET /api/vehicles/active
Response: ActiveVehicleDTO[]
```

```http
GET /api/vehicles/overdue
Response: ActiveVehicleDTO[]
```

```http
GET /api/vehicles/count
Response: { total: number, active: number, overdue: number }
```

### Parkings

```http
GET /api/parking/occupancy
Response: ParkingOccupancyDTO[]
```

## 🚀 Lancement

### Backend
```bash
cd backend
.\start-backend.ps1
# ou
mvn spring-boot:run
```

**URL** : http://localhost:8081

### Frontend
```bash
cd frontend-react
npm start
```

**URL** : http://localhost:3000

### Accès Dashboard Agent
http://localhost:3000/agent

## ✅ Checklist de Vérification

### Backend
- [x] DTOs créés avec Lombok
- [x] Entity ParkingEntity avec JPA
- [x] Repository ParkingRepository
- [x] Services avec logique métier
- [x] Controllers avec endpoints REST
- [x] CORS configuré pour React
- [x] Schema SQL avec données de test
- [x] Compilation sans erreur

### Frontend
- [x] Composants React créés
- [x] CSS avec design responsive
- [x] Appels API avec fetch
- [x] Gestion d'état (useState, useEffect)
- [x] Auto-refresh toutes les 30s
- [x] Feedback utilisateur (loading, error)
- [x] Intégration dans AgentDashboard

### Connexion Base de Données
- [x] Schema SQL créé
- [x] Données de test insérées (6 parkings)
- [x] Relations entre réservations et parkings (via address)
- [x] Requêtes JPA fonctionnelles

## 🔍 Points de Vérification Importants

### Connexion Backend ↔ Base de Données
✅ **H2 (développement)** : Utilise `schema.sql` automatiquement au démarrage  
✅ **PostgreSQL (production)** : Via `docker-compose.yml`

### Connexion Frontend ↔ Backend
✅ **CORS** : Configuré avec `@CrossOrigin(origins = "*")`  
✅ **Base URL** : `http://localhost:8081/api`  
✅ **Fetch** : Utilisé dans les composants React

### Logique Métier
✅ **Calcul occupation** : Basé sur les réservations ACTIVE par parking  
✅ **Détection retard** : Compare l'heure actuelle avec `startAt + durationMinutes`  
✅ **Tarification** : 0.05€/minute

## 🐛 Troubleshooting

### Backend ne démarre pas
1. Vérifier Java 17 installé : `java -version`
2. Vérifier Maven configuré : `mvn -version`
3. Vérifier Lombok dans pom.xml

### Frontend n'affiche pas les données
1. Vérifier backend lancé sur port 8081
2. Vérifier CORS dans les controllers
3. Vérifier console navigateur (F12)

### Données de test absentes
1. Vérifier `schema.sql` dans `src/main/resources`
2. Vérifier logs Spring Boot au démarrage
3. Vérifier configuration H2 dans `application.properties`

## 📝 Notes Techniques

- **Lombok** : Requis pour les getters/setters automatiques
- **Auto-refresh** : Utilise `setInterval` avec cleanup dans `useEffect`
- **Responsive** : Grid CSS avec `repeat(auto-fill, minmax())`
- **Performance** : Données mises en cache côté client entre les refreshs

---

**Branch** : `feat/suivitemps`  
**Date** : 2025-10-23  
**Status** : ✅ Prêt pour tests
