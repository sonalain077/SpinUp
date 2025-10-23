# 🚀 Lancement Rapide du Backend

## Méthode 1 : Script automatique (RECOMMANDÉ)

### Sur Windows (PowerShell)
```powershell
.\start-backend.ps1
```

### Sur Git Bash / WSL
```bash
./start-backend.sh
```

---

## Méthode 2 : Commande manuelle

### Sur Windows (PowerShell)
```powershell
cd backend
$env:JAVA_HOME = "C:\Users\kerie\tools\jdk-17.0.12+7"
$env:PATH = "$env:JAVA_HOME\bin;$env:PATH"
C:\Users\kerie\tools\apache-maven-3.9.9\bin\mvn.cmd spring-boot:run
```

### Sur Git Bash / WSL
```bash
cd backend
export JAVA_HOME="C:/Users/kerie/tools/jdk-17.0.12+7"
export PATH="$JAVA_HOME/bin:$PATH"
mvn spring-boot:run
```

---

## ✅ Vérification

Le backend est lancé quand vous voyez :
```
Started BackendApplication in X.XXX seconds
Tomcat started on port(s): 8081 (http)
```

Testez l'API :
```bash
curl http://localhost:8081/api/agent/overdue/stats
```

---

## 🐛 Problèmes courants

### "No compiler is provided" ou "JRE rather than JDK"
➡️ Java 17 JDK n'est pas configuré  
➡️ Utilisez le script `start-backend.ps1` ou `start-backend.sh`

### "No plugin found for prefix 'spring-boot'"
➡️ Vous n'êtes pas dans le dossier `backend`  
➡️ Faites `cd backend` avant de lancer Maven

### Port 8081 déjà utilisé
```powershell
# Trouver le processus
netstat -ano | findstr :8081
# Tuer le processus
taskkill /PID <numero> /F
```

---

## 📝 Endpoints disponibles (tous publics)

| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/api/auth/login` | POST | Connexion agent |
| `/api/parking/**` | ALL | Réservations parking |
| `/api/agent/overdue` | GET | Véhicules en excès |
| `/api/agent/overdue/stats` | GET | Statistiques |
| `/api/agent/overdue/{id}/mark` | POST | Marquer infraction |

---

**Dernière mise à jour** : 23 octobre 2025
