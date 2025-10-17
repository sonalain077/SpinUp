# 🛠️ Gestion des Conflits de Ports - SpinUp

Ce document explique comment résoudre les conflits de ports courants lors du démarrage de l'application SpinUp.

## 🚨 Problème Courant

**Erreur typique :**
```
BUILD FAILURE
Failed to execute goal org.springframework.framework.boot:spring-boot-maven-plugin:3.1.4:run
Process terminated with exit code: 1
Action: Identify and stop the process that's listening on port 8081 or configure this application to listen on another port.
```

## ✅ Solutions Automatiques

### 1. **Script de démarrage amélioré** 
Le script `start-quick.ps1` détecte automatiquement les conflits de ports et trouve un port libre :

```powershell
.\start-quick.ps1
```

**Fonctionnalités :**
- ✅ Détection automatique des ports occupés
- ✅ Recherche automatique d'un port libre (8082, 8083, etc.)
- ✅ Configuration automatique du backend
- ✅ Messages informatifs sur le port utilisé

### 2. **Script de libération de ports**
Pour libérer manuellement un port occupé :

```powershell
# Vérifier quels processus utilisent le port 8081
.\free-port.ps1

# Arrêter automatiquement les processus utilisant le port 8081
.\free-port.ps1 -Port 8081 -Force

# Vérifier un autre port
.\free-port.ps1 -Port 3000
```

## 🔧 Solutions Manuelles

### Option 1 : Trouver et arrêter le processus
```powershell
# Trouver le processus utilisant le port 8081
netstat -ano | findstr :8081

# Arrêter le processus (remplacer XXXX par le PID)
taskkill /PID XXXX /F
```

### Option 2 : Changer le port du backend
Modifier le fichier `backend/src/main/resources/application.properties` :
```properties
server.port=8082
```

Ou utiliser une variable d'environnement :
```powershell
$env:SERVER_PORT = "8082"
mvn spring-boot:run
```

## 🎯 Ports Utilisés par l'Application

| Service | Port par défaut | Port alternatif | Description |
|---------|----------------|-----------------|-------------|
| Frontend React | 3000 | 3001, 3002... | Interface utilisateur |
| Backend Spring Boot | 8081 | 8082, 8083... | API REST |
| PostgreSQL (Docker) | 5432 | 5433, 5434... | Base de données |

## 🚀 Workflow Recommandé

### Pour un démarrage quotidien :
1. **Utiliser le script automatique :**
   ```powershell
   .\start-quick.ps1
   ```

2. **Si problème persistant :**
   ```powershell
   # Libérer les ports
   .\free-port.ps1 -Force
   
   # Puis redémarrer
   .\start-quick.ps1
   ```

### Pour un nettoyage complet :
```powershell
# Arrêter tous les services
.\stop-app.ps1

# Libérer tous les ports courants
.\free-port.ps1 -Port 3000 -Force
.\free-port.ps1 -Port 8081 -Force
.\free-port.ps1 -Port 5432 -Force

# Redémarrer proprement
.\start-quick.ps1
```

## 🐛 Dépannage Avancé

### Processus Java zombies
Si des processus Java restent bloqués :
```powershell
# Lister tous les processus Java
Get-Process java

# Arrêter tous les processus Java (ATTENTION : arrête tout Java)
Get-Process java | Stop-Process -Force
```

### Containers Docker bloqués
```powershell
# Arrêter tous les containers
docker stop $(docker ps -q)

# Nettoyer les containers arrêtés
docker container prune -f
```

### Reset complet du projet
```powershell
# Arrêter l'application
.\stop-app.ps1

# Nettoyer Docker
docker compose down -v

# Libérer les ports
.\free-port.ps1 -Port 3000 -Force
.\free-port.ps1 -Port 8081 -Force

# Nettoyer les builds
cd backend
mvn clean
cd ..\frontend-react
npm run clean 2>$null  # Si script existe

# Redémarrer
cd ..
.\start-quick.ps1
```

## 📋 Scripts Disponibles

| Script | Description | Usage |
|--------|-------------|-------|
| `start-quick.ps1` | Démarrage rapide avec gestion automatique des ports | `.\start-quick.ps1` |
| `start-app.ps1` | Démarrage complet avec validations | `.\start-app.ps1` |
| `stop-app.ps1` | Arrêt propre de tous les services | `.\stop-app.ps1` |
| `free-port.ps1` | Gestion des conflits de ports | `.\free-port.ps1 -Port 8081 -Force` |

## 💡 Bonnes Pratiques

1. **Toujours utiliser `stop-app.ps1`** pour arrêter l'application proprement
2. **Vérifier les ports** avec `free-port.ps1` avant de déboguer
3. **Noter le port utilisé** si différent de 8081 pour les tests API
4. **Redémarrer Docker Desktop** si problèmes persistants avec PostgreSQL

## 🔗 Configuration Frontend

Si le backend utilise un port différent de 8081, mettre à jour les appels API dans le frontend :

```javascript
// Dans les services frontend
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8081';
```

Ou utiliser une variable d'environnement :
```bash
REACT_APP_API_URL=http://localhost:8082
```

---

**✅ Avec ces outils, les conflits de ports ne devraient plus être un problème !**