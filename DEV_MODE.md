# 🚀 Mode Développement - Park & See

## Lancement Rapide (Recommandé)

### Windows (PowerShell)
```powershell
npm install              # Installation des dépendances (première fois)
npm run dev:win          # Démarrer backend + frontend en mode dev
```

### Linux / macOS / WSL (Bash)
```bash
npm install              # Installation des dépendances (première fois)
npm run dev:sh           # Démarrer backend + frontend en mode dev
```

### VS Code - Méthode la plus simple
1. Appuyez sur `Ctrl+Shift+B` (ou `Cmd+Shift+B` sur Mac)
2. Sélectionnez **"Dev Full Stack (Backend + Frontend)"**
3. Les deux serveurs démarrent automatiquement

Ce script démarre automatiquement :
- ✅ **Backend** sur http://localhost:8081 (avec Spring Boot DevTools)
- ✅ **Frontend** sur http://localhost:5173 (avec Vite HMR)
- ✅ **Proxy API** configuré (pas de CORS)

### Avantages du mode dev :

**Backend (Spring Boot DevTools)** :
- ✅ Recompilation automatique des fichiers Java modifiés
- ✅ Redémarrage automatique du serveur (quelques secondes)
- ✅ Pas besoin de relancer manuellement Maven

**Frontend (React HMR)** :
- ✅ Rechargement instantané des modifications CSS/JS
- ✅ Préservation de l'état de l'application
- ✅ Pas besoin de rafraîchir le navigateur

---

## 🎯 Workflow de Développement

### 1. Modifier le code

**Backend** : Modifier un fichier Java dans `backend/src/main/java/`
```java
// OverdueControlService.java
public void nouvelleMethode() {
    // Votre code ici
}
```
➡️ **Sauvegardez** → Recompilation automatique en 3-5 secondes

**Frontend** : Modifier un fichier React dans `frontend-react/src/`
```javascript
// AgentDashboard.js
const [newState, setNewState] = useState(0);
```
➡️ **Sauvegardez** → Rechargement instantané (< 1 seconde)

### 2. Tester immédiatement

Pas besoin de :
- ❌ Redémarrer le backend manuellement
- ❌ Rafraîchir le navigateur
- ❌ Relancer npm start

Juste **sauvegarder** et **observer** ! 🎉

---

## � Ports utilisés

| Service       | Port | URL                               |
|---------------|------|-----------------------------------|
| Frontend      | 5173 | http://localhost:5173             |
| Backend       | 8081 | http://localhost:8081             |
| H2 Console    | 8081 | http://localhost:8081/h2-console  |

---

## 🔧 Fonctionnement

### Backend (Spring Boot - Démarrage unique)
- Le script `start-backend-once.ps1` vérifie si le port **8081** est occupé
- Si déjà lancé → affiche le PID et ne relance pas
- Si libre → démarre avec le profil `dev`
- **Spring Boot DevTools** : redémarrage auto en 3-5s sur modification Java

### Frontend (Vite)
- **Hot Module Replacement (HMR)** : changements instantanés
- **Proxy API** : `/api/*` → `http://localhost:8081` (pas de CORS)
- Port **5173** (Vite standard)

---

## 🛑 Arrêter le Mode Dev

**Ctrl+C** dans le terminal (arrête les deux serveurs)

Ou manuellement :
```powershell
# Arrêter le backend
npm run stop:backend

# Ou via VS Code : Ctrl+Shift+P → "Tasks: Terminate Task"
```

---

## 🔧 Lancement Manuel (Alternatif)

Si vous préférez lancer séparément :

### Backend uniquement
```powershell
.\start-backend.ps1
```

### Frontend uniquement
```powershell
cd frontend-react
npm start
```

---

## 📦 Dépendances Requises

- **Java 17** : Pour Spring Boot
- **Maven 3.9.9** : Pour la compilation backend
- **Node.js 18+** : Pour React
- **npm** : Pour les dépendances frontend

Le script `start-dev.ps1` détecte automatiquement ces outils.

---

## 💡 Astuces

### Backend trop lent à redémarrer ?
Spring Boot DevTools recompile seulement les classes modifiées, mais si vous modifiez des entités ou la configuration, le redémarrage peut prendre 5-10 secondes.

### Frontend ne se recharge pas ?
Vérifiez que vous avez sauvegardé le fichier (Ctrl+S). Le HMR détecte automatiquement les changements.

### Port déjà utilisé ?
Le script nettoie automatiquement les processus existants. Si le problème persiste :
```powershell
Get-Process -Name java,node | Stop-Process -Force
```

---

## 🎓 Différence avec start-backend.ps1

| Fonctionnalité | `start-backend.ps1` | `start-dev.ps1` |
|----------------|---------------------|-----------------|
| Backend | ✅ | ✅ |
| Frontend | ❌ | ✅ |
| Hot Reload Backend | ❌ | ✅ (DevTools) |
| HMR Frontend | ❌ | ✅ |
| Logs unifiés | ❌ | ✅ |
| Arrêt automatique | ❌ | ✅ |

**Recommandation** : Utilisez `start-dev.ps1` pour le développement quotidien !

---

**Développez plus vite avec Park & See ! 🚗💨**
