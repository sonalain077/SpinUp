# Park & See - Gestion du Stationnement Urbain

Projet Capgemini - Modernisation de la gestion du stationnement dans une grande agglomération française.

## 🚀 Démarrage Rapide

### Prérequis

1. **Docker Desktop** (inclut Docker Compose)
   - **[Télécharger Docker Desktop](https://www.docker.com/products/docker-desktop/)**
   - Installer et lancer l'application
   - Attendre que Docker soit prêt (icône verte dans la barre des tâches)

2. **Node.js 16+** pour le frontend
   - Télécharger : https://nodejs.org/

### Installation en 3 étapes

#### 1️⃣ Lancer le Backend avec Docker Compose

```powershell
# Depuis la racine du projet
docker compose up -d --build
```

Cela démarre :
- ✅ PostgreSQL (port 5432)
- ✅ Backend Spring Boot (port 8081)

**Vérification** : http://localhost:8081/api/agent/overdue/stats

#### 2️⃣ Lancer le Frontend React

```powershell
cd frontend-react
npm install
npm start
```

Le frontend démarre sur : http://localhost:3000

#### 3️⃣ Accéder à l'application

- **Interface Usager** : http://localhost:3000
- **Dashboard Agent** : http://localhost:3000/agent
- **API Backend** : http://localhost:8081/api

---

## 📚 Documentation

- **[GUIDE_LANCEMENT_DOCKER.md](./GUIDE_LANCEMENT_DOCKER.md)** - Guide complet Docker Compose
- **[TESTS.md](./TESTS.md)** - Documentation des tests (120 tests unitaires)
- **[PORTS.md](./PORTS.md)** - Configuration des ports

---

## 🏗️ Architecture

### Stack Technique

- **Frontend** : React 18.2.0
- **Backend** : Spring Boot 3.1.4 (Java 17)
- **Base de données** : PostgreSQL 15
- **ORM** : JPA / Hibernate
- **Containerisation** : Docker + Docker Compose

### Structure du Projet

```
SpinUp/
├── backend/                 # API Spring Boot
│   ├── src/
│   │   ├── main/java/      # Code source
│   │   ├── test/java/      # Tests unitaires (120 tests)
│   │   └── resources/      # Configuration + data.sql
│   ├── Dockerfile          # Image Docker backend
│   └── pom.xml
├── frontend-react/          # Application React
│   ├── src/
│   │   ├── components/     # Composants réutilisables
│   │   └── pages/          # Pages (User, Agent)
│   └── package.json
├── scripts/                 # Scripts utilitaires
├── docker-compose.yml       # Configuration Docker
└── README.md
```

---

## 🎯 Fonctionnalités (Phase 1)

### Interface Usager
- Réservation de places de parking
- Paiement en ligne
- Suivi en temps réel

### Interface Agent (Contrôleurs)
- ✅ Dashboard avec statistiques en temps réel
- ✅ Liste des véhicules en excès de durée
- ✅ Contrôle du paiement
- ✅ Marquage des infractions
- ✅ Analytics (types de véhicules, zones critiques)

---

## 🛠️ Commandes Utiles

### Docker Compose

```powershell
# Démarrer les services
docker compose up -d

# Voir les logs
docker compose logs -f backend
docker compose logs -f db

# Arrêter les services
docker compose down

# Reconstruire les images
docker compose build --no-cache

# Supprimer volumes (reset DB)
docker compose down -v
```

### Tests Backend

```powershell
cd backend
mvn test
```

**Résultat** : 120/120 tests passent ✅

---

## 🐛 Dépannage

### Docker ne démarre pas
- Vérifier que Docker Desktop est lancé
- Redémarrer Docker Desktop
- Vérifier les prérequis système (WSL2 pour Windows)

### Port déjà utilisé
```powershell
# Libérer le port 8081 ou 5432
docker compose down
# Ou changer le port dans docker-compose.yml
```

### Backend ne se connecte pas à PostgreSQL
```powershell
# Vérifier que la DB est prête
docker compose logs db
# Attendre le message "database system is ready to accept connections"
```

---

## 👥 Équipe & Contact

Projet développé par l'équipe Capgemini pour la modernisation du stationnement urbain.

**Stack choisie** : Spring Boot + React + PostgreSQL + Docker  
**Phase actuelle** : Phase 1 (Parkings publics)  
**Statut** : En développement actif

---

## 📝 Notes de Développement

- **Tests** : 120 tests unitaires couvrant controllers, services, repositories
- **Base de données de test** : 13 réservations pré-chargées (10 en excès)
- **API REST** : Endpoints documentés dans GUIDE_LANCEMENT_DOCKER.md
- **Configuration** : Variables d'environnement dans docker-compose.yml

---

**Dernière mise à jour** : 23 octobre 2025

