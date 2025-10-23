# Start SpinUp Application

Démarre l'application complète SpinUp (Park & See) en utilisant le script d'automatisation optimisé.

## Instructions

Exécute le script de démarrage complet de l'application SpinUp qui inclut :
- Validation complète de l'environnement de développement
- Démarrage du backend Spring Boot sur le port 8081 (avec fallback automatique)
- Démarrage du frontend React sur le port 3000
- Gestion automatique des conflits de ports
- Validation des prérequis système

## Commande à exécuter

```powershell
# Naviguer vers le dossier des scripts
cd scripts

# Exécuter le script de démarrage complet
.\start-app.ps1
```

## Contexte technique

### Structure du projet
- **Backend**: Spring Boot 3.1.4 avec Maven dans `/backend`
- **Frontend**: React avec npm dans `/frontend-react`
- **Scripts**: PowerShell d'automatisation dans `/scripts`

### Ports utilisés
- Backend Spring Boot: 8081 (fallback: 8082, 8083...)
- Frontend React: 3000
- PostgreSQL Docker: 5432

### Prérequis validés par le script
- Java 17+ (pour Spring Boot)
- Node.js 16+ (pour React)
- Maven 3.6+ (pour la compilation)
- npm (gestionnaire de paquets)

## Comportement attendu

Le script va :
1. ✅ Valider l'environnement de développement
2. 🔍 Vérifier la disponibilité des ports
3. 🚀 Démarrer le backend Spring Boot
4. ⚛️ Démarrer le frontend React
5. 🌐 Ouvrir automatiquement l'application dans le navigateur

## En cas de problème

Si des ports sont déjà utilisés, le script propose automatiquement des ports alternatifs ou utilise le script de résolution :

```powershell
# En cas de conflit de port
.\free-port.ps1 -All

# Démarrage avec arrêt forcé des processus existants
.\start-fixed.ps1
```

## Résultat attendu

Une fois le script terminé :
- Backend accessible sur: `http://localhost:8081`
- Frontend accessible sur: `http://localhost:3000`
- Application complète fonctionnelle avec API REST et interface utilisateur