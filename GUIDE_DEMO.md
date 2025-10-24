# 🎬 Guide de Démonstration - Park & See

## 📋 Préparation de la Démo

### Serveurs à lancer

1. **Backend** (port 8081)
   ```powershell
   .\start-backend.ps1
   ```
   ✅ Attendre le message : `Started BackendApplication in X seconds`

2. **Frontend** (port 3000)
   ```powershell
   cd frontend-react
   npm start
   ```
   ✅ Ouvrir automatiquement : http://localhost:3000

---

## 🎯 Scénario de Démonstration

### **PARTIE 1 : Flux Utilisateur - Réservation & Paiement**

#### Étape 1 : Page d'accueil
- Ouvrir http://localhost:3000
- Montrer l'interface moderne avec gradient
- Cliquer sur **"🅿️ Réserver une place"**

#### Étape 2 : Formulaire de réservation
**Option A - Remplissage manuel** :
- Plaque : `AB-123-CD`
- Véhicule : `Voiture`
- Date/Heure : `Maintenant + 30min`
- Durée : `120 minutes` (2h)
- Parking : `Parking Centre Ville`

**Option B - Démo rapide** :
- Cliquer sur **"🎯 Remplir avec exemple"**
- Tout est pré-rempli automatiquement !

**Option C - Test infraction (pour démo agent)** :
1. Cocher **"🎬 Mode Démo (10 secondes)"**
2. Cliquer sur **"🎯 Remplir avec exemple"**
3. La durée sera de 10 secondes au lieu de 2h
4. ⚠️ Le véhicule passera en infraction après 10 secondes

#### Étape 3 : Paiement
- Choisir un mode de paiement :
  * **💳 Carte Bleue** : Numéro `4111 1111 1111 1111`, Nom `DEMO USER`, Expiration `12/25`, CVV `123`
  * **📱 Lydia** : Téléphone `+33612345678`
  * **🌐 PayPal** : Email `demo@parkandsee.fr`
- Cliquer sur **"💳 Valider le paiement"**

#### Étape 4 : Confirmation
- Affichage du récapitulatif
- Montrer l'ID de réservation
- Cliquer sur **"🏠 Retour à l'accueil"**

---

### **PARTIE 2 : Tableau de Bord Agent**

#### Accès au dashboard
- Ouvrir http://localhost:3000/login
- Identifiants :
  * **Login** : `agent`
  * **Mot de passe** : `agentpass`

#### Fonctionnalités à montrer

**1. Carte d'occupation** (en haut, violet, double largeur)
- Affiche le taux d'occupation en temps réel : `X/100 places`
- Barre de progression animée
- Pourcentage calculé automatiquement

**2. Carte "Places disponibles"** (verte)
- Nombre de places libres
- Se met à jour automatiquement

**3. Carte "En infraction actuellement"** (rouge)
- Nombre de véhicules en dépassement
- Clic sur **"⚖️ Voir les infractions"** pour la liste détaillée

**4. Carte "Infractions marquées"** (orange)
- Total des infractions signalées par les agents

**5. Carte "Temps moyen de dépassement"** (bleu)
- Durée moyenne en minutes

#### Liste des infractions
- Tableau avec : Plaque, Type, Parking, Dépassement, Heure de début
- Bouton **"⚡ Marquer cette infraction"** pour chaque véhicule
- Bouton **"⚡ Marquer toutes les infractions"** en haut
- **Auto-refresh toutes les 30 secondes**

---

## 🧪 Test Mode Démo 10 Secondes

### Objectif
Montrer une infraction en temps réel pendant la démo.

### Procédure
1. **Créer une réservation démo** :
   - HomePage → Réservation
   - Cocher **"🎬 Mode Démo (10 secondes)"**
   - Remplir avec exemple
   - Compléter le paiement

2. **Ouvrir le dashboard agent** (nouvel onglet) :
   - Login : `agent` / `agentpass`
   - Observer l'occupation qui augmente

3. **Attendre 10 secondes** ⏱️
   - Le véhicule passe automatiquement en `OVERDUE`
   - Apparaît dans "En infraction actuellement" (rouge)
   - Le dashboard se rafraîchit automatiquement

4. **Marquer l'infraction** :
   - Cliquer sur **"⚖️ Voir les infractions"**
   - Cliquer sur **"⚡ Marquer cette infraction"**
   - Le compteur "Infractions marquées" augmente

---

## ✨ Points Forts à Souligner

### Fonctionnalités implémentées
✅ **5/5 tickets Jira du sprint complétés** :
- MBA-20 : Suivi temps réel occupation
- MBA-15 : Modes de paiement multiples
- MBA-41 : Identification des véhicules
- MBA-12 : Page de paiement
- MBA-42 : Contrôle excès de durée

### Améliorations UX
✅ Transitions fluides entre pages (animations fadeInUp)
✅ Bouton "Remplir exemple" pour accélérer la démo
✅ Mode démo 10 secondes pour test infraction
✅ Auto-refresh du dashboard (30s)
✅ Design moderne avec gradients

### Architecture technique
✅ Backend : Spring Boot 3.1.4 + Java 17
✅ Frontend : React 18.2.0
✅ API REST avec validation
✅ Base H2 in-memory
✅ Spring Security (JWT pour agents)

---

## 📊 Métriques de la Démo

- **3 modes de paiement** : CB, Lydia, PayPal
- **6 types de véhicules** : Voiture, Moto, Van, Camion, Vélo, Trottinette
- **100 places** de parking (configurable)
- **10 secondes** pour mode démo infraction
- **30 secondes** d'auto-refresh dashboard

---

## 🛠️ Dépannage Rapide

### Backend ne démarre pas
```powershell
# Vérifier si le port 8081 est libre
Get-NetTCPConnection -LocalPort 8081 -ErrorAction SilentlyContinue

# Tuer les processus Java
taskkill /F /IM java.exe
```

### Frontend ne démarre pas
```powershell
# Vérifier si le port 3000 est libre
Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue

# Tuer les processus Node
Get-Process -Name *node* | Stop-Process -Force
```

### Base de données vide
- La base H2 est en mémoire : elle se réinitialise à chaque redémarrage
- Créer une réservation de test avant la démo

---

## 🎓 Conseil pour la Présentation

1. **Préparer 2 onglets** :
   - Onglet 1 : http://localhost:3000 (utilisateur)
   - Onglet 2 : http://localhost:3000/login (agent)

2. **Scénario recommandé** :
   - Commencer par le flux utilisateur (5 min)
   - Créer une réservation démo 10s pendant l'explication
   - Basculer sur le dashboard agent
   - Montrer l'infraction qui apparaît en temps réel
   - Marquer l'infraction

3. **Timing** :
   - Flux utilisateur : 5 minutes
   - Dashboard agent : 5 minutes
   - Questions/réponses : 5 minutes
   - **Total : 15 minutes**

---

**Bonne démonstration ! 🚀**
