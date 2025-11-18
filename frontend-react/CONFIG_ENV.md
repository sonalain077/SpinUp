# 🔧 Configuration Frontend - Modes Dev et Docker

## 📋 Problème résolu

**Avant** : `.env` configuré pour Docker (port 8080) → `npm run dev` ne fonctionnait plus  
**Après** : Configurations séparées pour dev local et Docker

## ✅ Configuration finale

### Fichiers `.env`

**`.env`** (par défaut - mode développement local)
```env
VITE_API_URL=http://localhost:8081
```

**`.env.development`** (npm run dev)
```env
VITE_API_URL=http://localhost:8081
```

**`.env.docker`** (Docker Compose uniquement)
```env
VITE_API_URL=http://localhost:8080
```

**`.env.production`** (build de production)
```env
VITE_API_URL=http://localhost:8080
```

### Dockerfile modifié

Le Dockerfile copie automatiquement `.env.docker` → `.env` avant le build :

```dockerfile
# Utiliser .env.docker pour la configuration Docker (port 8080)
RUN cp .env.docker .env || true

RUN npm run build
```

## 🚀 Utilisation

### Mode développement local (sans Docker)

```powershell
# 1. Démarrer le backend Spring Boot
cd backend
./start-backend.ps1  # ou mvn spring-boot:run

# 2. Dans un autre terminal, démarrer le frontend
cd frontend-react
npm run dev
```

**Backend** : http://localhost:8081  
**Frontend** : http://localhost:5173  
**Config utilisée** : `.env.development` (port 8081)

### Mode Docker Compose

```powershell
docker compose up --build
```

**Backend** : http://localhost:8080 (mappé depuis 8081 interne)  
**Frontend** : http://localhost:5173  
**Config utilisée** : `.env.docker` (port 8080)

## 🔍 Vérification

### Test mode dev
```powershell
cd frontend-react
npm run dev
# Ouvrir http://localhost:5173
# Vérifier : ✅ Serveur connecté
```

### Test mode Docker
```powershell
docker compose up --build
# Ouvrir http://localhost:5173
# Vérifier : ✅ Serveur connecté
```

## 📝 Points clés

1. **`.env.development`** est prioritaire en mode `npm run dev`
2. **`.env.docker`** est copié dans le Dockerfile pour Docker
3. **Backend local** : port 8081 (application.properties)
4. **Backend Docker** : port 8080 exposé (docker-compose.yml mapping)
5. Les deux modes fonctionnent maintenant sans conflit

## ⚠️ Important

Ne **jamais** modifier `.env.docker` pour le dev local, ni `.env.development` pour Docker.  
Chaque fichier a son rôle spécifique.
