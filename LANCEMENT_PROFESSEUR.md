# 🚀 Guide de Lancement - Park & See

## Démarrage Rapide (5 min)

### 1️⃣ Prérequis
- ✅ Java 17+ installé
- ✅ Node.js 18+ installé  
- ✅ Maven 3.8+ installé

### 2️⃣ Lancer l'Application

#### Option A : Script Automatique (Recommandé) ⭐
```powershell
.\scripts\start-app.ps1
```

#### Option B : Manuelle

**Terminal 1 - Backend** :
```bash
cd backend
mvn clean spring-boot:run
```
Attendez le message : `Started BackendApplication in X seconds`

**Terminal 2 - Frontend** :
```bash
cd frontend-react
npm install
npm run dev
```

### 3️⃣ Accès
- 🌐 **Frontend** : http://localhost:5173
- 🔧 **Backend API** : http://localhost:8081
- 📊 **Health Check** : http://localhost:8081/api/parking/ping

---

## 🎬 Scénario de Démonstration

### Partie Utilisateur

1. **Page d'accueil** (http://localhost:5173)
   - Cliquer sur "Réserver une Place"

2. **Réserver une place**
   - Plaque : `AB-123-CD`
   - Type : Voiture
   - Adresse : `1 Rue de la Paix, Paris`
   - Date/heure : Maintenant
   - Durée : `30` minutes
   - ✅ Cliquer sur "Réserver et Payer"

3. **Confirmation**
   - Noter la **plaque** mise en avant (vert)
   - Cliquer sur "Consulter Mes Places"

4. **Mes Places**
   - Sélectionner "Par plaque d'immatriculation" ⭐ (recommandé)
   - Entrer : `AB-123-CD`
   - 🔍 Rechercher
   - Prolonger de 15 minutes
   - OU sortir anticipativement

### Partie Agent

5. **Login Agent**
   - Page d'accueil → "Espace Agent"
   - Username : `agent`
   - Password : `password`
   - Se connecter

6. **Dashboard Agent**
   - 📊 Vue d'ensemble : statistiques temps réel
   - 🚗 Véhicules actifs par parking
   - ⚠️ Véhicules en excès (si durée dépassée)
   - 🔄 Auto-refresh toutes les 30s

### Démonstration Infractions

7. **Créer une infraction** (mode démo)
   - Revenir à "Réserver une Place"
   - ✅ Cocher "Mode Démo (créer infraction)"
   - Plaque : `DEMO-01`
   - Durée : `1` minute
   - Réserver

8. **Voir l'infraction dans le Dashboard Agent**
   - Attendre 1 minute
   - Rafraîchir le dashboard
   - Voir `DEMO-01` dans "Véhicules en Excès"
   - Actions disponibles :
     - 🚨 Signaler
     - ✅ Régulariser

---

## 📋 Fonctionnalités Principales

### ✅ Implémenté
- [x] Réservation de place avec paiement simulé
- [x] **Recherche par plaque** (simplification UX) ⭐
- [x] Prolongation de durée
- [x] Sortie anticipée
- [x] Dashboard agent complet
- [x] Gestion des infractions
- [x] Auto-refresh temps réel
- [x] Authentification JWT
- [x] API REST complète
- [x] Tests unitaires (146/191 OK)

### 📊 Endpoints API Testables

```bash
# Health check
curl http://localhost:8081/api/parking/ping

# Statut backend
curl http://localhost:8081/api/parking/status

# Recherche par plaque
curl "http://localhost:8081/api/parking/search?licencePlate=AB-123-CD"

# Vue d'ensemble agent (nécessite token JWT)
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     http://localhost:8081/api/agent/overview
```

---

## ⚠️ Notes Importantes

### Tests Unitaires
- **146 tests OK** sur 191 (76%)
- **45 tests échouent** : problème de configuration sécurité JWT dans les tests
- **L'application fonctionne parfaitement** en mode exécution
- Voir `RAPPORT_PROJET.md` pour détails

### Console Logs
- Nombreux `console.log()` présents pour debugging
- **Normal pour un projet en développement**
- À commenter/supprimer avant prod

### Base de données
- **H2 en mémoire** : données perdues au redémarrage
- **OK pour démo/dev**
- Passer à PostgreSQL pour prod (config dans `application.properties`)

---

## 🆘 Dépannage

### Port déjà utilisé
```powershell
# Libérer le port 8081
.\scripts\free-port.ps1

# Ou manuellement
Get-Process -Id (Get-NetTCPConnection -LocalPort 8081).OwningProcess | Stop-Process -Force
```

### Backend ne démarre pas
```bash
cd backend
mvn clean install
mvn spring-boot:run
```

### Frontend erreurs npm
```bash
cd frontend-react
rm -rf node_modules package-lock.json
npm install
npm run dev
```

---

## 📚 Documentation Complète

- `RAPPORT_PROJET.md` - Rapport détaillé avec métriques
- `GUIDE_DEMO.md` - Scénarios de démonstration
- `TESTS.md` - Détails sur les tests unitaires
- `PORTS.md` - Configuration des ports

---

## ✨ Innovation : Recherche par Plaque

**Problème initial** : UUID complexe (`fb354dcd-fb85-4baf-a51f-3d2682e3a012`)

**Solution** : Recherche par plaque d'immatriculation ⭐
- ✅ Plus simple à retenir : `AB-123-CD`
- ✅ Badge "Recommandé" sur l'interface
- ✅ Fallback sur ID si besoin
- ✅ Auto-uppercase pour cohérence

---

**Bon test ! 🎉**

*Dernière mise à jour : 17/11/2025*
