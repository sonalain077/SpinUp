# Park & See - Gestion du Stationnement Urbain

Projet Capgemini - Modernisation de la gestion du stationnement dans une grande agglomération française.

## 🚀 Démarrage Rapide

### Scripts de Lancement Automatiques

Utilisez les scripts PowerShell pour un démarrage simplifié :

```powershell
# Lancement rapide backend + frontend
.\start-app.ps1

# Arrêt des services
.\stop-app.ps1

# Tests automatisés
.\run-tests.ps1
```

### Prérequis

1. **Java 23** et **Maven 3.9+**
   - Java : https://jdk.java.net/
   - Maven : https://maven.apache.org/

2. **Node.js 18+** pour le frontend
   - Télécharger : https://nodejs.org/

### Installation manuelle

#### 1️⃣ Lancer le Backend Spring Boot

```powershell
# Depuis la racine du projet
cd backend
mvn spring-boot:run
```

Le backend démarre sur : http://localhost:8081

**Vérification** : http://localhost:8081/api/parking/status

#### 2️⃣ Lancer le Frontend React

```powershell
cd frontend-react
npm install
npm run dev
```

Le frontend démarre sur : http://localhost:5174

#### 3️⃣ Accéder à l'application

- **Interface Usager** : http://localhost:5174
- **Dashboard Agent** : http://localhost:5174/agent
- **API Backend** : http://localhost:8081/api

## 📚 Documentation

- **[TESTS.md](./TESTS.md)** - Tests automatisés complets
- **[RESUME_TESTS.md](./RESUME_TESTS.md)** - Résumé des tests avec statistiques
- **[PORTS.md](./PORTS.md)** - Configuration des ports

---

## 🏗️ Architecture

### Stack Technique

- **Frontend** : React 18.2.0 + Vite 7.1.12
- **Backend** : Spring Boot 3.1.4 (Java 23)
- **Base de données** : H2 en mémoire (développement)
- **ORM** : JPA / Hibernate
- **Sécurité** : Spring Security 6.x avec CORS
- **Tests** : JUnit 5 + Mockito + Spring Boot Test

### Structure du Projet

```
SpinUp/
├── backend/                 # API Spring Boot
│   ├── src/
│   │   ├── main/java/      # Code source
│   │   │   ├── controller/ # Controllers REST
│   │   │   ├── service/    # Logique métier
│   │   │   ├── entity/     # Entités JPA
│   │   │   ├── dto/        # Data Transfer Objects
│   │   │   ├── repository/ # Accès données
│   │   │   ├── security/   # Configuration sécurité
│   │   │   └── config/     # Configuration Spring
│   │   ├── test/java/      # Tests unitaires
│   │   └── resources/      # Configuration + data.sql
│   └── pom.xml
├── frontend-react/          # Application React Vite
│   ├── src/
│   │   ├── components/     # Composants réutilisables
│   │   │   ├── AgentDashboard.js
│   │   │   ├── ParkingReservation.js
│   │   │   ├── RallongerStationnement.js
│   │   │   └── ...
│   │   └── index.js
│   ├── package.json
│   └── vite.config.js
├── scripts/                 # Scripts PowerShell
│   ├── start-app.ps1       # Lancement automatique
│   ├── stop-app.ps1        # Arrêt des services
│   └── run-tests.ps1       # Tests automatisés
└── README.md
```

## 🎯 Fonctionnalités (Phase 1)

### Interface Usager - Réservation et Extension

#### 🚗 Réservation de Parking
- **Types de véhicules** : Voiture, 2 roues, Camionnette
- **Gestion du temps** : 
  - Début de stationnement arrondi au quart d'heure supérieur
  - Durée par tranches de 30 minutes (de 1h à 24h)
  - Sélecteur personnalisé heures + minutes (0 ou 30 min)
- **Moyens de paiement** : Carte Bleue, Lydia, PayPal
- **Validation** : Contrôles en temps réel des données

#### 🔄 Extension de Stationnement (Nouvelle Fonctionnalité)
- **Recherche de réservation** :
  - Par plaque d'immatriculation
  - Par ID de réservation
- **Extension payante** :
  - Durée flexible (par tranches de 30 min)
  - Paiement intégré (3 moyens de paiement)
  - Tarification : 1,50€ par demi-heure
- **Interface dédiée** : Boutons d'action rapide en haut de page
- **Confirmation** : Page de récapitulatif détaillée

#### 📱 Interface Utilisateur
- **Design responsive** : Optimisé mobile et desktop
- **Contraste amélioré** : Meilleure lisibilité des textes
- **Actions rapides** : 
  - "Voir mes places" 
  - "Rallonger stationnement"
- **Formulaires intelligents** : Validation en temps réel

### Interface Agent (Contrôleurs)
- ✅ Dashboard avec statistiques en temps réel
- ✅ Liste des véhicules en excès de durée
- ✅ Contrôle du paiement
- ✅ Marquage des infractions
- ✅ Analytics (types de véhicules, zones critiques)

### API REST Backend

#### Endpoints de Parking
- `POST /api/parking/reserve` - Créer une réservation
- `GET /api/parking/search` - Rechercher une réservation active
- `POST /api/parking/extend` - Étendre une réservation
- `GET /api/parking/status` - Statut du service

#### Endpoints Agent
- `GET /api/agent/overdue` - Véhicules en infraction
- `GET /api/agent/overdue/stats` - Statistiques temps réel
- ✅ Contrôle du paiement
- ✅ Marquage des infractions
- ✅ Analytics (types de véhicules, zones critiques)

## 🛠️ Commandes Utiles

### Scripts PowerShell Automatiques

```powershell
# Démarrage complet (backend + frontend)
.\start-app.ps1

# Démarrage rapide sans tests
.\start-quick.ps1

# Version corrigée avec gestion d'erreurs
.\start-fixed.ps1

# Arrêt propre des services
.\stop-app.ps1

# Tests automatisés complets
.\run-tests.ps1

# Tests simplifiés
.\run-tests-simple.ps1
```

### Backend Spring Boot

```powershell
cd backend

# Démarrage
mvn spring-boot:run

# Tests complets
mvn test

# Tests spécifiques
mvn test -Dtest=ExtensionRequestTest
mvn test -Dtest=ParkingServiceExtensionTest
mvn test -Dtest=ParkingExtensionControllerTest

# Compilation
mvn compile

# Nettoyage
mvn clean
```

### Frontend React + Vite

```powershell
cd frontend-react

# Installation des dépendances
npm install

# Démarrage en mode développement
npm run dev

# Build de production
npm run build

# Preview du build
npm run preview
```

### Tests Backend - Détails

**Suite de tests complète** :
- ✅ Tests de validation DTO (ExtensionRequestTest)
- ✅ Tests de service (ParkingServiceExtensionTest) 
- ✅ Tests de contrôleur (ParkingExtensionControllerTest)
- ✅ Tests d'intégration (ExtensionIntegrationTest)

**Couverture** :
- Validation des données d'entrée
- Logique métier des extensions
- Calculs de tarification
- Gestion des erreurs
- Endpoints REST

## 🐛 Dépannage

### Problèmes de Démarrage

#### Backend ne démarre pas
```powershell
# Vérifier Java
java --version

# Vérifier Maven
mvn --version

# Nettoyer et recompiler
cd backend
mvn clean compile
mvn spring-boot:run
```

#### Frontend ne démarre pas
```powershell
# Vérifier Node.js
node --version
npm --version

# Réinstaller les dépendances
cd frontend-react
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Problèmes de Port

#### Port 8081 déjà utilisé (Backend)
```powershell
# Arrêter le processus utilisant le port
netstat -ano | findstr :8081
taskkill /PID <PID> /F

# Ou changer le port dans application.properties
server.port=8082
```

#### Port 5174 déjà utilisé (Frontend)
```powershell
# Vite choisira automatiquement le port suivant (5175, 5176...)
# Ou spécifier un port dans vite.config.js
```

### Base de Données H2

#### Accès à la console H2
- URL : http://localhost:8081/h2-console
- JDBC URL : `jdbc:h2:mem:testdb`
- Username : `sa`
- Password : (vide)

#### Réinitialiser les données
```powershell
# Redémarrer le backend (H2 en mémoire se vide automatiquement)
# Les données de test sont rechargées depuis data.sql
```

### Tests qui Échouent

#### Problèmes de compilation des tests
```powershell
# Nettoyer et recompiler les tests
mvn clean test-compile
mvn test
```

#### Tests d'intégration
```powershell
# Exécuter les tests individuellement
mvn test -Dtest=ExtensionRequestTest
mvn test -Dtest=ParkingServiceExtensionTest
```

## 👥 Équipe & Contact

Projet développé par l'équipe Capgemini pour la modernisation du stationnement urbain.

**Stack choisie** : Spring Boot + React + Vite + H2 + Maven  
**Phase actuelle** : Phase 1 (Parkings publics) - Fonctionnalités d'extension  
**Statut** : En développement actif

---

## 📝 Notes de Développement

### Fonctionnalités Récentes (Novembre 2024)
- ✅ **Extension de stationnement** : Recherche et prolongation payante
- ✅ **Interface utilisateur améliorée** : Boutons d'action rapide, contraste
- ✅ **Gestion du temps** : Arrondi au quart d'heure, durées demi-heures
- ✅ **Types de véhicules** : Limitation à 3 types (Voiture, 2 roues, Camionnette)
- ✅ **Suite de tests complète** : DTO, Service, Controller, Integration

### Architecture Technique
- **Tests** : Suite complète avec validation, service, contrôleur, intégration
- **Base de données de test** : Données pré-chargées avec réservations actives
- **API REST** : Endpoints pour réservation, recherche et extension
- **Sécurité** : Spring Security 6.x avec CORS configuré pour Vite
- **Frontend** : React 18 + Vite pour un développement rapide

### Données de Test
- **13 réservations** pré-chargées dans H2
- **Véhicules actifs** pour tester les fonctionnalités
- **Différents états** : actif, expiré, en cours
- **Types variés** : voitures, 2 roues, camionnettes

### Configuration Ports
- **Backend** : http://localhost:8081
- **Frontend** : http://localhost:5174 (Vite)
- **H2 Console** : http://localhost:8081/h2-console

---

**Dernière mise à jour** : 4 novembre 2024

