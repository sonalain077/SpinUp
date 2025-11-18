# 📦 GUIDE PRÉPARATION ZIP POUR LE PROFESSEUR

## ✅ Fichiers à CONSERVER

### Structure complète du projet
```
SpinUp/
├── backend/
│   ├── src/
│   ├── pom.xml
│   ├── Dockerfile
│   └── README_BACKEND.md
├── frontend-react/
│   ├── src/
│   ├── public/
│   ├── package.json
│   ├── package-lock.json   ← GARDER (pour npm install)
│   ├── vite.config.js
│   ├── Dockerfile
│   ├── .env
│   ├── .env.development
│   ├── .env.docker
│   └── CONFIG_ENV.md
├── docker-compose.yml
├── README.md
├── CORRECTION_CONNEXION_FRONTEND.md
└── scripts/
```

## ❌ Fichiers à SUPPRIMER avant le ZIP

### 1. Dépendances (ÉNORMES)
```powershell
# Frontend
Remove-Item -Recurse -Force frontend-react/node_modules/

# Backend
Remove-Item -Recurse -Force backend/target/
```

### 2. Environnements virtuels Python
```powershell
Remove-Item -Recurse -Force .venv/
Remove-Item -Recurse -Force venv/
```

### 3. Configuration IDE
```powershell
Remove-Item -Recurse -Force .idea/
Remove-Item -Recurse -Force .vscode/
Remove-Item -Force *.iml
```

### 4. Volumes Docker
```powershell
# Pas dans le dépôt normalement, mais au cas où :
Remove-Item -Recurse -Force db_data/
```

### 5. Fichiers de build temporaires
```powershell
Remove-Item -Recurse -Force frontend-react/build/
Remove-Item -Recurse -Force frontend-react/dist/
Remove-Item -Force *.log
```

## 🚀 Commande PowerShell unique

Exécuter depuis la racine du projet :

```powershell
# Nettoyer tout en une commande
Remove-Item -Recurse -Force -ErrorAction SilentlyContinue `
  frontend-react/node_modules, `
  backend/target, `
  .venv, `
  venv, `
  .idea, `
  .vscode, `
  db_data, `
  frontend-react/build, `
  frontend-react/dist

# Vérifier la taille du dossier
Get-ChildItem -Recurse | Measure-Object -Property Length -Sum | Select-Object @{Name="Size (MB)";Expression={[math]::Round($_.Sum / 1MB, 2)}}
```

## 📊 Taille attendue

**Avant nettoyage** : 300-500 MB (avec node_modules)  
**Après nettoyage** : 5-15 MB

## 🗜️ Créer le ZIP

### Méthode 1 : PowerShell
```powershell
# Depuis le dossier parent de SpinUp
Compress-Archive -Path SpinUp -DestinationPath SpinUp_DOCKER.zip -Force
```

### Méthode 2 : Windows Explorer
1. Clic droit sur le dossier `SpinUp`
2. **Envoyer vers** → **Dossier compressé**
3. Renommer en `SpinUp_DOCKER.zip`

## ✅ Vérification avant envoi

### 1. Contenu du ZIP
Le professeur doit pouvoir :
```powershell
# Décompresser
Expand-Archive SpinUp_DOCKER.zip

# Installer les dépendances
cd SpinUp
cd frontend-react
npm install

# Lancer Docker
docker compose up --build
```

### 2. Checklist fichiers essentiels
- [ ] `docker-compose.yml` présent
- [ ] `backend/Dockerfile` présent
- [ ] `frontend-react/Dockerfile` présent
- [ ] `backend/pom.xml` présent
- [ ] `frontend-react/package.json` présent
- [ ] **`frontend-react/package-lock.json`** présent ← IMPORTANT
- [ ] `README.md` avec instructions Docker
- [ ] `CORRECTION_CONNEXION_FRONTEND.md` (explications)

### 3. Checklist fichiers absents
- [ ] **PAS** de `node_modules/`
- [ ] **PAS** de `backend/target/`
- [ ] **PAS** de `.venv/` ou `venv/`
- [ ] **PAS** de `.idea/` ou `.vscode/`

## 📝 README pour le prof

Ajouter dans le README principal :

```markdown
## 🚀 Installation et démarrage

### Prérequis
- Docker Desktop installé
- 8 GB RAM minimum

### Lancement rapide
```powershell
# 1. Décompresser le ZIP
# 2. Ouvrir PowerShell dans le dossier
docker compose up --build
```

### Accès
- Frontend : http://localhost:5173
- Backend API : http://localhost:8080
- PostgreSQL : localhost:5432

### Arrêt
```powershell
docker compose down -v
```
```

## 🔍 Test final avant envoi

```powershell
# 1. Décompresser le ZIP dans un dossier temporaire
Expand-Archive SpinUp_DOCKER.zip -DestinationPath C:\Temp\Test_SpinUp

# 2. Tester le lancement
cd C:\Temp\Test_SpinUp\SpinUp
docker compose up --build

# 3. Vérifier :
# - http://localhost:5173 → ✅ Serveur connecté
# - http://localhost:8080/health → {"status":"UP"}

# 4. Nettoyer
docker compose down -v
```

## ⚠️ ATTENTION

### À NE PAS SUPPRIMER
- ✅ `package-lock.json` → nécessaire pour reproduire les versions npm
- ✅ `.env` → pas de secrets, juste localhost
- ✅ `.env.development` → configuration dev
- ✅ `.env.docker` → configuration Docker

### À SUPPRIMER ABSOLUMENT
- ❌ `node_modules/` → 200+ MB
- ❌ `backend/target/` → 50+ MB
- ❌ `.venv/` → inutile pour le projet

## 📧 Envoi

**Nom du fichier** : `NOM_Prenom_SpinUp_Docker.zip`  
**Taille maximale** : < 20 MB  
**Contenu** : Code source + Dockerfiles + docker-compose.yml + documentation

---

**Important** : Le professeur doit pouvoir lancer `docker compose up --build` sans aucune modification.
