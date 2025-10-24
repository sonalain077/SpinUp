# 🚀 Mode Développement Stable - Park & See

**Backend démarre une seule fois, Frontend HMR instantané, Proxy Vite élimine les CORS.**

---

## ⚡ Démarrage Rapide

### Windows (PowerShell)
```powershell
npm install              # Première fois : installer concurrently
cd frontend-react && npm install && cd ..
npm run dev:win          # Lancer backend + frontend
```

### Linux / macOS / WSL (Bash)
```bash
npm install              # Première fois : installer concurrently
cd frontend-react && npm install && cd ..
npm run dev:sh           # Lancer backend + frontend
```

### VS Code (⭐ Recommandé)
1. Ouvrir le projet dans VS Code
2. **`Ctrl+Shift+B`** (ou `Cmd+Shift+B` sur Mac)
3. Sélectionner **"Dev Full Stack (Backend + Frontend)"**
4. Les deux serveurs démarrent dans des terminaux séparés

---

## 📋 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│             Mode Dev avec Backend Unique + Vite HMR          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Backend (Spring Boot)              Frontend (Vite)         │
│  ┌──────────────────┐               ┌──────────────────┐   │
│  │  Port: 8081      │◄──────────────┤  Port: 5173      │   │
│  │  Profile: dev    │   Proxy /api  │  HMR: Actif      │   │
│  │  DevTools: ON    │               │  React 18.2.0    │   │
│  │                  │               │                  │   │
│  │  Redémarrage:    │               │  Rechargement:   │   │
│  │  3-5s (Java)     │               │  Instantané      │   │
│  │                  │               │  (< 100ms)       │   │
│  └──────────────────┘               └──────────────────┘   │
│                                                              │
│  Idempotent: ne relance pas si port 8081 déjà occupé        │
│  CORS: Éliminé par proxy Vite (aucun problème)              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 Workflow de Développement

### 1. Démarrage
```bash
npm run dev:win          # Windows
# ou
npm run dev:sh           # Linux/Mac/WSL
```

Le backend démarre **une seule fois**. Si déjà lancé (port 8081 occupé), le script affiche :
```
✅ Backend already running on port 8081 (PID 12345)
   No need to start again.
```

### 2. Développement Frontend (Vite HMR)
- Modifier n'importe quel fichier dans `frontend-react/src/`
- **Sauvegarder** → Vite HMR rafraîchit instantanément le navigateur
- Le backend **ne redémarre pas**
- État de l'application **préservé**

### 3. Développement Backend (Spring Boot DevTools)
- Modifier du code Java dans `backend/src/main/java/`
- **Sauvegarder** → DevTools recompile et redémarre en 3-5 secondes
- Le frontend reste actif
- Logs détaillés en console (niveau DEBUG)

### 4. Proxy API Transparent
```javascript
// Dans le frontend, appeler directement :
fetch('/api/parking/reserve')  // ✅ Pas de CORS

// Vite proxy vers http://localhost:8081/api/parking/reserve
```

### 5. Arrêt
- **`Ctrl+C`** dans le terminal → Arrête les deux serveurs
- Ou via VS Code : `Ctrl+Shift+P` → "Tasks: Terminate Task"
- Ou manuellement : `npm run stop:backend`

---

## 📍 Ports et URLs

| Service       | Port | URL                                 |
|---------------|------|-------------------------------------|
| Frontend      | 5173 | http://localhost:5173               |
| Backend       | 8081 | http://localhost:8081               |
| H2 Console    | 8081 | http://localhost:8081/h2-console    |
| LiveReload    | 35729| (Spring DevTools interne)           |

---

## 🛠️ Commandes Disponibles

### Racine du projet (mode dev)
```bash
# Démarrer le mode dev
npm run dev:win          # Windows (PowerShell)
npm run dev:sh           # Linux/Mac/WSL (Bash)
npm run dev              # Alias vers dev:win

# Gérer le backend
npm run backend:once:ps  # Démarrer backend (Windows) si pas déjà lancé
npm run backend:once:sh  # Démarrer backend (Bash) si pas déjà lancé
npm run stop:backend     # Arrêter le backend manuellement

# Frontend seul (si backend déjà lancé séparément)
npm run frontend         # Démarrer uniquement Vite

# Nettoyage complet
npm run clean            # Supprimer tous les build artifacts
```

### Frontend (frontend-react/)
```bash
cd frontend-react

npm run dev              # Démarrer Vite (port 5173)
npm run build            # Build de production
npm run preview          # Prévisualiser le build (port 4173)

# Scripts legacy (create-react-app, pour rollback si besoin)
npm run legacy:start
npm run legacy:build
```

### Backend (backend/)
```bash
cd backend

# Avec Maven
mvn spring-boot:run "-Dspring-boot.run.profiles=dev" "-Dmaven.test.skip=true"

# Avec le script portable
cd ..
.\scripts\start-backend-once.ps1    # Windows
bash ./scripts/start-backend-once.sh  # Linux/Mac
```

---

## ⚙️ Configuration Technique

### Profil Spring Boot `dev`
Fichier : `backend/src/main/resources/application-dev.properties`

```properties
# Profil actif
spring.profiles.active=dev

# Logs verbeux pour debug
logging.level.com.parkandsee.backend=DEBUG
logging.level.org.springframework.web=DEBUG
logging.level.org.hibernate.SQL=DEBUG

# DevTools - Auto-restart
spring.devtools.restart.enabled=true
spring.devtools.livereload.enabled=true

# H2 en mémoire (dev uniquement)
spring.datasource.url=jdbc:h2:mem:parkandsee

# CORS permissif (backup, Vite proxy suffit normalement)
spring.web.cors.allowed-origins=http://localhost:5173
```

### Proxy Vite
Fichier : `frontend-react/vite.config.js`

```javascript
export default defineConfig({
  plugins: [react()],
  esbuild: {
    loader: 'jsx',
    include: /src\/.*\.js$/,  // Supporter JSX dans .js
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8081',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
```

### Scripts Idempotents
- **`start-backend-once.ps1`** (Windows) : Auto-détecte Java 17 + Maven, vérifie port 8081
- **`start-backend-once.sh`** (Linux/Mac) : Logique équivalente avec `lsof`

**Comportement** :
- Port 8081 **libre** → Démarre le backend avec profil `dev`
- Port 8081 **occupé** → Affiche PID, ne fait rien, exit 0
- Idempotent : peut être appelé plusieurs fois sans erreur

---

## 🐛 Debug et Troubleshooting

### Backend (Java)
1. **VS Code** : Installer "Extension Pack for Java" (Microsoft)
2. `F5` → **"Debug Backend (Spring Boot)"**
3. Points d'arrêt fonctionnels dans Controllers/Services

### Frontend (React)
1. `F5` → **"Debug Frontend (Chrome)"** ou **"Debug Frontend (Edge)"**
2. Points d'arrêt dans Chrome DevTools ou VS Code
3. Source maps Vite activées automatiquement

### Logs Backend
```bash
# Voir les logs en temps réel
tail -f backend/target/spring-boot.log  # Si configuré

# Ou directement dans le terminal VS Code
# Profil dev = logs DEBUG actifs
```

---

## 🚨 Résolution de Problèmes

### "Port 8081 already in use"
Le script `start-backend-once` le détecte automatiquement.  
Pour arrêter manuellement :
```powershell
# Windows
npm run stop:backend

# Ou
netstat -ano | findstr :8081
taskkill /PID <PID> /F
```

```bash
# Linux/Mac
lsof -ti :8081 | xargs kill
```

### "CORS error" malgré le proxy
Vérifier que :
1. Vous accédez à `http://localhost:5173` (pas 3000)
2. Les appels API sont **relatifs** : `fetch('/api/...')` (pas `http://localhost:8081/api/...`)
3. Vite est bien démarré (voir console : `VITE v7.1.12 ready`)

### "Backend ne redémarre pas après changement Java"
1. Vérifier que `spring-boot-devtools` est dans `pom.xml` :
   ```xml
   <dependency>
       <groupId>org.springframework.boot</groupId>
       <artifactId>spring-boot-devtools</artifactId>
       <scope>runtime</scope>
       <optional>true</optional>
   </dependency>
   ```
2. Profil `dev` actif : voir logs `The following 1 profile is active: "dev"`
3. LiveReload sur port 35729 : voir logs `LiveReload server is running on port 35729`

### "HMR ne fonctionne pas"
1. Vérifier console navigateur : doit afficher `[vite] connected`
2. Vite doit être lancé avec `npm run dev` (pas `react-scripts start`)
3. Forcer rechargement : `Ctrl+R` dans le navigateur

### "The JSX syntax extension is not currently enabled"
**Corrigé** via `vite.config.js` :
```javascript
esbuild: {
  loader: 'jsx',
  include: /src\/.*\.js$/,
},
```

Si erreur persiste :
- Supprimer `node_modules/.vite/` et relancer
- Ou renommer `.js` en `.jsx` (mais pas nécessaire avec config ci-dessus)

---

## 📦 Migration de create-react-app vers Vite

Le projet a été migré pour :
- ✅ **HMR ultra-rapide** : < 100ms vs 3-5s
- ✅ **Builds 10-100x plus rapides** : 2s vs 30s+
- ✅ **Meilleur support ESM** : modules natifs
- ✅ **Configuration simplifiée** : un seul fichier `vite.config.js`

Les scripts `react-scripts` sont conservés en `legacy:*` pour rollback si nécessaire.

---

## 📝 Notes Importantes

1. **Backend = Démarrage unique** : Ne relance pas à chaque sauvegarde frontend
2. **Proxy Vite élimine CORS** : Pas d'appels directs à localhost:8081 dans le code frontend
3. **Profil `dev` obligatoire** : Configuré automatiquement par les scripts
4. **H2 en mémoire** : Données perdues au redémarrage (normal en dev)
5. **Java 17 requis** : Auto-détecté par les scripts dans paths standards
6. **Maven auto-détecté** : Scripts cherchent dans `$env:USERPROFILE\tools\` et paths système

---

## ✅ Checklist Avant Démo/Production

- [ ] **Tests backend** : `cd backend && mvn test`
- [ ] **Tests frontend** : `cd frontend-react && npm test`
- [ ] **Build frontend** : `cd frontend-react && npm run build`
- [ ] **Pas de warnings CORS** : Console navigateur propre
- [ ] **Profil prod configuré** : `application-prod.properties` avec DB réelle
- [ ] **Variables d'environnement** : JWT secret, DB credentials sécurisées
- [ ] **Logs production** : Niveau INFO/WARN (pas DEBUG)

---

## 🎬 Exemple de Session Dev

```bash
# Terminal 1 : Démarrer le mode dev
cd C:\Users\kerie\Documents\Capgemini2\SpinUp
npm run dev:win

# Output :
# [BACKEND] Backend already running on port 8081 (PID 12345)  # Si déjà lancé
# [FRONTEND] VITE v7.1.12 ready in 700ms
# [FRONTEND] ➜  Local: http://localhost:5173/

# Terminal 2 : Modifier le code
code frontend-react/src/components/HomePage.js
# Sauvegarder → HMR instantané dans le navigateur

code backend/src/main/java/.../OverdueControlService.java
# Sauvegarder → Backend redémarre en 3-5s

# Navigateur : http://localhost:5173
# ✅ Changements visibles sans recharger manuellement
```

---

## 📚 Ressources

- [Vite Documentation](https://vitejs.dev/)
- [Spring Boot DevTools](https://docs.spring.io/spring-boot/docs/current/reference/html/using.html#using.devtools)
- [React Fast Refresh](https://github.com/vitejs/vite-plugin-react/tree/main/packages/plugin-react#readme)
- [Vite Server Proxy](https://vitejs.dev/config/server-options.html#server-proxy)

---

**Auteur** : Équipe Park & See  
**Dernière mise à jour** : 24 Octobre 2025  
**Version** : Mode Dev Stable v2.0
