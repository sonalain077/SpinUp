# Scripts d'Automatisation SpinUp - Park & See

Ce dossier contient tous les scripts PowerShell pour automatiser la gestion du projet SpinUp.

## 📁 Organisation des Scripts

### 🚀 Scripts de Démarrage

#### `start-quick.ps1` - **Démarrage Rapide** ⚡
Script optimisé pour un démarrage rapide de l'application avec gestion automatique des ports.

**Utilisation:**
```powershell
.\start-quick.ps1
```

**Fonctionnalités:**
- Détection et résolution automatique des conflits de ports (8081 → 8082 → 8083...)
- Gestion intelligente des processus existants
- Démarrage séquentiel optimisé (Backend puis Frontend)
- Validation des prérequis et de l'environnement

#### `start-app.ps1` - **Démarrage Complet** 🔄
Script complet avec validation complète et gestion d'erreurs avancée.

**Utilisation:**
```powershell
.\start-app.ps1
```

**Fonctionnalités:**
- Validation complète de l'environnement (Java, Node.js, Maven, npm)
- Vérification des dépendances et versions
- Gestion avancée des erreurs avec diagnostics
- Logs détaillés du processus de démarrage

#### `start-fixed.ps1` - **Démarrage avec Arrêt Forcé** 🛠️
Script de démarrage avec arrêt forcé des processus existants sur les ports requis.

**Utilisation:**
```powershell
.\start-fixed.ps1
```

**Fonctionnalités:**
- Arrêt forcé des processus sur les ports 8081 et 3000
- Démarrage garanti même en cas de conflits
- Mode de récupération pour les situations bloquées

### 🛑 Scripts d'Arrêt

#### `stop-app.ps1` - **Arrêt Propre** 
Script pour l'arrêt propre et complet de l'application.

**Utilisation:**
```powershell
.\stop-app.ps1
```

**Fonctionnalités:**
- Arrêt gracieux des processus Backend et Frontend
- Nettoyage des ressources et fichiers temporaires
- Vérification de l'arrêt complet
- Libération des ports utilisés

### 🔧 Scripts Utilitaires

#### `free-port.ps1` - **Gestion des Ports** 🔌
Utilitaire pour diagnostiquer et libérer les ports utilisés.

**Utilisation:**
```powershell
# Vérifier un port spécifique
.\free-port.ps1 -Port 8081

# Vérifier tous les ports de l'application
.\free-port.ps1 -All

# Libérer un port spécifique
.\free-port.ps1 -Port 8081 -Kill
```

**Fonctionnalités:**
- Diagnostic des ports occupés
- Identification des processus utilisant les ports
- Libération forcée ou gracieuse des ports
- Mode audit pour tous les ports de l'application

#### `clear-reservations.ps1` - **Nettoyage Base de Données** 🗑️
Script pour vider toutes les réservations de la base de données.

**Utilisation:**
```powershell
# Avec confirmation
.\clear-reservations.ps1
```

**Fonctionnalités:**
- Suppression de toutes les réservations
- Demande de confirmation avant suppression
- Comptage avant et après l'opération
- Vérification de l'état de Docker

#### `clear-reservations-quick.ps1` - **Nettoyage Rapide** ⚡
Version rapide sans confirmation (pour développement).

**Utilisation:**
```powershell
# Suppression immédiate
.\clear-reservations-quick.ps1
```

**⚠️ Attention:** Ce script supprime IMMÉDIATEMENT toutes les réservations sans confirmation !

### 🧪 Scripts de Test

#### `run-tests.ps1` - **Tests Complets** 🎯
Script complet pour l'exécution des tests avec options avancées.

**Utilisation:**
```powershell
# Tous les tests
.\run-tests.ps1

# Tests rapides (Controllers et Services)
.\run-tests.ps1 -Quick

# Tests unitaires seulement
.\run-tests.ps1 -Unit

# Tests d'intégration seulement
.\run-tests.ps1 -Integration

# Test spécifique
.\run-tests.ps1 -TestClass ParkingControllerTest

# Avec couverture de code
.\run-tests.ps1 -Coverage

# Mode verbeux
.\run-tests.ps1 -Verbose
```

**Fonctionnalités:**
- Exécution sélective des tests (unitaires, intégration, rapides)
- Génération de rapports de couverture de code
- Statistiques détaillées des résultats
- Mode verbeux pour le debugging

#### `run-tests-simple.ps1` - **Tests Simplifiés** ⚡
Version simplifiée pour l'exécution rapide des tests.

**Utilisation:**
```powershell
# Tous les tests
.\run-tests-simple.ps1

# Test spécifique
.\run-tests-simple.ps1 -TestClass ParkingServiceTest
```

## 📋 Guide de Démarrage Rapide

### 1. Premier Démarrage
```powershell
# Aller dans le dossier des scripts
cd scripts

# Démarrage rapide (recommandé)
.\start-quick.ps1
```

### 2. En cas de Problème de Port
```powershell
# Diagnostic des ports
.\free-port.ps1 -All

# Démarrage avec résolution forcée
.\start-fixed.ps1
```

### 3. Lancer les Tests
```powershell
# Tests rapides
.\run-tests.ps1 -Quick

# Tous les tests avec couverture
.\run-tests.ps1 -Coverage
```

### 4. Arrêt de l'Application
```powershell
.\stop-app.ps1
```

## 🔧 Configuration et Prérequis

### Prérequis Système
- **PowerShell 5.1+** (Windows PowerShell)
- **Java 17+** (pour Spring Boot)
- **Node.js 16+** (pour React)
- **Maven 3.6+** (pour la compilation)
- **Git** (pour le versioning)

### Ports Utilisés
- **Backend Spring Boot:** 8081 (fallback: 8082, 8083...)
- **Frontend React:** 3000
- **Base de données PostgreSQL:** 5432 (Docker)

### Structure du Projet
```
SpinUp/
├── scripts/              # 📁 Scripts d'automatisation (ce dossier)
├── backend/              # 🚀 Backend Spring Boot
├── frontend-react/       # ⚛️ Frontend React
├── frontend/             # 📂 Autre frontend
└── README.md             # 📖 Documentation principale
```

## 🚨 Résolution des Problèmes Courants

### Erreur "Port déjà utilisé"
```powershell
.\free-port.ps1 -Port 8081 -Kill
```

### Erreur "Maven introuvable"
Vérifiez l'installation de Maven et Java:
```powershell
mvn --version
java --version
```

### Erreur "npm introuvable"
Vérifiez l'installation de Node.js:
```powershell
node --version
npm --version
```

### Processus bloqués
Utilisez le script de démarrage avec arrêt forcé:
```powershell
.\start-fixed.ps1
```

## 📊 Informations Techniques

### Gestion des Chemins
Tous les scripts utilisent une résolution automatique des chemins:
```powershell
$PROJECT_ROOT = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
```

### Gestion des Erreurs
- Codes de retour standardisés (0 = succès, 1 = erreur)
- Logs détaillés avec codes couleur
- Gestion des exceptions et rollback automatique

### Compatibilité
- **OS:** Windows 10/11
- **Shell:** PowerShell 5.1+ (Windows PowerShell)
- **Encodage:** UTF-8 avec support des emojis

## 📝 Maintenance et Contribution

### Ajout d'un Nouveau Script
1. Créer le script dans le dossier `scripts/`
2. Utiliser la résolution de chemin standard
3. Ajouter la documentation dans ce README
4. Tester avec différents scénarios

### Convention de Nommage
- `start-*.ps1` : Scripts de démarrage
- `stop-*.ps1` : Scripts d'arrêt
- `run-*.ps1` : Scripts d'exécution
- `free-*.ps1` : Scripts utilitaires

---

**📞 Support:** En cas de problème, exécuter les scripts avec `-Verbose` pour plus de détails.
**🔄 Mise à jour:** Dernière version - Décembre 2024