# Guide de lancement du backend Park & See
# ==========================================

## METHODE 1 : Via le script PowerShell (RECOMMANDE)

### Commande unique :
```powershell
cd C:\Users\kerie\Documents\Capgemini2\SpinUp
.\scripts\start-backend.ps1
```

### Description :
- Lance automatiquement Java 17 et Maven
- Affiche les informations de configuration
- Démarre Spring Boot sur le port 8081
- Appuyer sur Ctrl+C pour arrêter

---

## METHODE 2 : Commande manuelle PowerShell

### Étapes séquentielles :
```powershell
# 1. Se placer dans le dossier backend
cd C:\Users\kerie\Documents\Capgemini2\SpinUp\backend

# 2. Configurer Java 17
$env:JAVA_HOME = "C:\Users\kerie\tools\jdk-17.0.12+7"
$env:PATH = "C:\Users\kerie\tools\jdk-17.0.12+7\bin;$env:PATH"

# 3. Vérifier Java (optionnel)
java -version

# 4. Lancer Spring Boot
C:\Users\kerie\tools\apache-maven-3.9.9\bin\mvn.cmd spring-boot:run "-Dmaven.test.skip=true"
```

### ⚠️ IMPORTANT : Syntaxe PowerShell
- **Utiliser `;` pour séparer les commandes** (pas `&&` qui est bash)
- **Utiliser `$env:` pour définir les variables d'environnement**
- **Toujours partir du dossier `backend`** (présence de `pom.xml`)

---

## METHODE 3 : Commande Bash (Git Bash / WSL)

```bash
# 1. Se placer dans le dossier backend
cd ~/Documents/Capgemini2/SpinUp/backend

# 2. Lancer avec JAVA_HOME
JAVA_HOME=/c/Users/kerie/tools/jdk-17.0.12+7 \
/c/Users/kerie/tools/apache-maven-3.9.9/bin/mvn spring-boot:run -Dmaven.test.skip=true
```

---

## Vérification que le backend fonctionne

### 1. Regarder les logs dans le terminal
Vous devez voir :
```
Started BackendApplication in X.XXX seconds (process running with PID XXXXX)
Tomcat started on port(s): 8081 (http)
```

### 2. Tester l'API avec un endpoint
```powershell
# Dans un NOUVEAU terminal PowerShell
curl http://localhost:8081/api/agent/overdue/stats
```

Résultat attendu (JSON) :
```json
{
  "totalActive": 13,
  "currentOverdue": 10,
  "markedOverdue": 0
}
```

---

## Arrêter le backend

### Dans le terminal où tourne Spring Boot :
- Appuyer sur **Ctrl+C**
- Maven affiche "[INFO] BUILD SUCCESS"
- Le port 8081 est libéré

---

## Dépannage (Troubleshooting)

### Erreur : "No plugin found for prefix 'spring-boot'"
**Cause** : Vous n'êtes PAS dans le dossier `backend` (pom.xml introuvable)
**Solution** : 
```powershell
cd C:\Users\kerie\Documents\Capgemini2\SpinUp\backend
```

### Erreur : "class file version 61.0 ... only recognizes ... 52.0"
**Cause** : Maven utilise Java 8 au lieu de Java 17
**Solution** : Configurer `JAVA_HOME` ET `PATH` :
```powershell
$env:JAVA_HOME = "C:\Users\kerie\tools\jdk-17.0.12+7"
$env:PATH = "C:\Users\kerie\tools\jdk-17.0.12+7\bin;$env:PATH"
```

### Erreur : "Table 'reservations' not found"
**Cause** : Hibernate n'a pas créé les tables avant d'exécuter data.sql
**Solution** : Vérifier `application.properties` contient :
```properties
spring.jpa.defer-datasource-initialization=true
```

### Erreur : "Token '&&' is not a valid statement separator"
**Cause** : Vous utilisez la syntaxe Bash dans PowerShell
**Solution** : Remplacer `&&` par `;` (PowerShell) ou utiliser Git Bash

### Port 8081 déjà utilisé
**Cause** : Une instance du backend tourne déjà
**Solution** :
```powershell
# Trouver le processus
netstat -ano | findstr :8081

# Tuer le processus (remplacer PID)
taskkill /PID <numero_PID> /F
```

---

## Configuration de l'environnement

### Chemins actuels :
- **Java 17** : `C:\Users\kerie\tools\jdk-17.0.12+7`
- **Maven 3.9.9** : `C:\Users\kerie\tools\apache-maven-3.9.9`
- **Projet backend** : `C:\Users\kerie\Documents\Capgemini2\SpinUp\backend`

### Ports utilisés :
- **Backend Spring Boot** : 8081 (http://localhost:8081)
- **Frontend React** : 3000 (http://localhost:3000)
- **Base de données H2** : In-memory (jdbc:h2:mem:parkandsee)

---

## Lancement complet du projet (Backend + Frontend)

### Terminal 1 (Backend) :
```powershell
cd C:\Users\kerie\Documents\Capgemini2\SpinUp
.\scripts\start-backend.ps1
```

### Terminal 2 (Frontend) :
```powershell
cd C:\Users\kerie\Documents\Capgemini2\SpinUp\frontend-react
npm start
```

### Accès :
- **Application utilisateur** : http://localhost:3000
- **Dashboard agent** : http://localhost:3000/agent
- **API backend** : http://localhost:8081/api

---

## Notes importantes

1. **TOUJOURS lancer le backend AVANT le frontend** (le frontend appelle l'API backend)
2. **Java 17 est OBLIGATOIRE** (Spring Boot 3.1.4 ne fonctionne pas avec Java 8)
3. **La base H2 est en mémoire** : Les données sont perdues à chaque redémarrage
4. **Les tests sont désactivés** (`-Dmaven.test.skip=true`) pour un démarrage rapide
5. **Pour lancer les tests** : `mvn test` (dans le dossier backend)

---

## Raccourcis clavier

### Dans le terminal :
- **Ctrl+C** : Arrêter le serveur
- **Ctrl+Z** : Suspendre (déconseillé, utiliser Ctrl+C)
- **↑** : Commande précédente

### Dans VS Code :
- **Ctrl+`** : Ouvrir/fermer le terminal
- **Ctrl+Shift+`** : Nouveau terminal
