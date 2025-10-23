# Guide de Lancement du Backend - Park & See

## 🐳 Méthode Recommandée : Docker Compose

### Prérequis

1. **Docker Desktop** installé et lancé
   - Télécharger : https://www.docker.com/products/docker-desktop/
   - Version minimale : Docker Desktop 4.0+ (inclut Docker Compose V2)
   - Vérifier l'installation :
     ```powershell
     docker --version
     docker compose version
     ```

### 🚀 Lancement Rapide

**1. Ouvrir un terminal PowerShell dans le dossier du projet**

```powershell
cd C:\Users\kerie\Documents\Capgemini2\SpinUp
```

**2. Lancer tous les services (Backend + PostgreSQL)**

```powershell
docker compose up --build
```

**3. Vérifier que tout fonctionne**

- Backend : http://localhost:8081/api/agent/overdue/stats
- PostgreSQL : Port 5432 (accessible depuis le backend)

**4. Arrêter les services**

Appuyer sur `Ctrl+C` dans le terminal, puis :

```powershell
docker compose down
```

---

## 📋 Commandes Utiles

### Lancer en arrière-plan (mode detached)
```powershell
docker compose up -d --build
```

### Voir les logs en temps réel
```powershell
docker compose logs -f backend
docker compose logs -f db
```

### Arrêter et supprimer les conteneurs + volumes
```powershell
docker compose down -v
```

### Reconstruire uniquement le backend
```powershell
docker compose build backend
docker compose up backend
```

### Redémarrer un service spécifique
```powershell
docker compose restart backend
```

### Voir l'état des services
```powershell
docker compose ps
```

---

## 🔧 Architecture Docker

### Services lancés

1. **PostgreSQL (db)**
   - Port : 5432
   - Base de données : `parkandsee`
   - Utilisateur : `postgres`
   - Mot de passe : `example`
   - Volume persistant : `db_data`

2. **Backend Spring Boot**
   - Port : 8081
   - Build : Maven multi-stage dans Docker
   - Auto-restart si erreur
   - Dépend de PostgreSQL (attend que la DB soit prête)

### Avantages de Docker Compose

✅ **Pas besoin de configurer Java/Maven manuellement**  
✅ **Base de données PostgreSQL déjà configurée**  
✅ **Isolation complète (pas de conflit avec d'autres projets)**  
✅ **Reproductible sur toutes les machines**  
✅ **Même configuration que votre collègue**

---

## 🐛 Dépannage

### "docker : Le terme n'est pas reconnu"
➡️ Docker Desktop n'est pas installé ou pas démarré  
➡️ Redémarrer Docker Desktop et attendre qu'il soit prêt (icône Docker dans la barre des tâches)

### "port is already allocated"
➡️ Un service utilise déjà le port 8081 ou 5432  
➡️ Arrêter le service conflictuel ou changer le port dans `docker-compose.yml`

### "database connection failed"
➡️ Attendre quelques secondes que PostgreSQL démarre complètement  
➡️ Vérifier les logs : `docker compose logs db`

### Le backend ne démarre pas
➡️ Vérifier les logs : `docker compose logs backend`  
➡️ Reconstruire l'image : `docker compose build --no-cache backend`

---

## 📊 Endpoints API Disponibles

| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/api/agent/overdue` | GET | Liste des véhicules en excès |
| `/api/agent/overdue/stats` | GET | Statistiques globales |
| `/api/agent/overdue/{id}/mark` | POST | Marquer un véhicule en infraction |

**Test rapide :**
```powershell
curl http://localhost:8081/api/agent/overdue/stats
```

---

## 🎯 Workflow Complet (Backend + Frontend)

### 1. Lancer le Backend (Docker Compose)
```powershell
cd C:\Users\kerie\Documents\Capgemini2\SpinUp
docker compose up -d
```

### 2. Lancer le Frontend (React)
```powershell
cd frontend-react
npm start
```

### 3. Accéder à l'application
- Frontend : http://localhost:3000
- Backend API : http://localhost:8081/api

### 4. Arrêter tout
```powershell
# Arrêter le frontend : Ctrl+C dans le terminal React
# Arrêter le backend et la DB :
docker compose down
```

---

## 📝 Notes Techniques

- **Base de données H2 (mémoire) :** Désactivée en faveur de PostgreSQL
- **Configuration :** Définie dans `docker-compose.yml` (variables d'environnement)
- **Données de test :** Chargées automatiquement depuis `backend/src/main/resources/data.sql`
- **Hot reload :** Non disponible en Docker (redémarrer le conteneur pour voir les changements)

Pour le développement actif, vous pouvez utiliser Maven localement si besoin, mais **Docker Compose est la méthode recommandée pour la production et le déploiement**.

---

**Dernière mise à jour :** 23 octobre 2025
