# 🧪 Guide de Test - Fonctionnalité "Rallonger Stationnement"

## ✅ Modifications effectuées

### Fichiers modifiés
- ✅ `frontend-react/src/components/RallongerStationnement.jsx`
  - Fonction `handleSearch()` : Appel API réel au lieu de simulation
  - Fonction `handlePayment()` : Extension réelle via backend

### Endpoints utilisés
- `GET /api/parking/search?licencePlate=XX-XXX-XX` : Recherche par plaque
- `GET /api/parking/search?reservationId=uuid` : Recherche par ID
- `POST /api/parking/extend` : Extension de réservation

---

## 🧪 Scénarios de test

### Test 1 : Recherche avec plaque INEXISTANTE ❌

**Étapes :**
1. Ouvrir l'application : `http://localhost:3000`
2. Cliquer sur "Rallonger stationnement"
3. Sélectionner "🚗 Plaque d'immatriculation"
4. Saisir : `ZZ-999-ZZ`
5. Cliquer sur "🔍 Rechercher"

**Résultat attendu :**
```
❌ Aucune réservation active trouvée avec ces informations
```

---

### Test 2 : Recherche avec plaque EXISTANTE ✅

**Prérequis :**
Créer d'abord une réservation :
1. Aller sur "Réserver une place"
2. Remplir le formulaire :
   - Plaque : `AB-123-CD`
   - Type : Voiture
   - Parking : Parking Gare
   - Durée : 2h
3. Effectuer le paiement
4. Noter l'ID de réservation affiché

**Test :**
1. Aller sur "Rallonger stationnement"
2. Sélectionner "🚗 Plaque d'immatriculation"
3. Saisir : `AB-123-CD`
4. Cliquer sur "🔍 Rechercher"

**Résultat attendu :**
```
✅ Réservation trouvée !

📋 Détails affichés :
🚗 Véhicule : AB-123-CD
🏢 Parking : Parking Gare
⏰ Fin actuelle : [date/heure correcte]
```

---

### Test 3 : Extension de durée ⏰

**Suite du Test 2 :**
1. Dans la section "➕ Rallonger le stationnement"
2. Sélectionner une durée : `1h`
3. Vérifier le prix affiché : `3.00€` (1h = 2 × 30min = 2 × 1.50€)
4. Cliquer sur "💳 Payer et Rallonger"
5. Choisir un mode de paiement (ex: Carte Bleue)
6. Remplir les informations :
   - Numéro : `4242 4242 4242 4242`
   - Nom : `TEST UTILISATEUR`
   - Expiration : `12/25`
   - CVV : `123`
7. Cliquer sur "💳 Payer 3.00€"

**Résultat attendu :**
```
✅ Redirection vers page de confirmation
✅ Message : "Stationnement rallongé de 60 minutes"
✅ Nouvelle heure de fin affichée (+1h)
```

---

### Test 4 : Vérification en base de données 🗄️

**Après Test 3, vérifier dans Docker :**

```powershell
docker exec -it parkandsee-db psql -U postgres -d parkandsee -c "SELECT id, licence_plate, duration_minutes, payment_amount, status, updated_at FROM reservations WHERE licence_plate = 'AB-123-CD' ORDER BY updated_at DESC LIMIT 1;"
```

**Valeurs attendues :**
- `duration_minutes` : **120 + 60 = 180** (durée initiale 2h + extension 1h)
- `payment_amount` : **6.00 + 3.00 = 9.00€** (montant initial + extension)
- `updated_at` : **Date/heure récente** (preuve de modification)

---

### Test 5 : Recherche par ID de réservation 🎫

**Utiliser l'ID noté au Test 2 :**
1. Aller sur "Rallonger stationnement"
2. Sélectionner "🎫 Numéro de réservation"
3. Saisir l'ID (ex: `430cec33-4c1c-477f-aff1-0b249687806a`)
4. Cliquer sur "🔍 Rechercher"

**Résultat attendu :**
```
✅ Réservation trouvée !
[Mêmes détails qu'avec la plaque]
```

---

### Test 6 : Durée personnalisée 🎛️

1. Trouver une réservation
2. Dans "Durée d'extension", sélectionner : `🎛️ Personnaliser`
3. Choisir :
   - Heures : `2h`
   - Minutes : `30 min`
4. Vérifier le prix affiché : `7.50€` (2h30 = 5 × 30min = 5 × 1.50€)
5. Procéder au paiement

**Résultat attendu :**
```
✅ Extension de 150 minutes validée
✅ Coût : 7.50€
```

---

## 🚨 Tests d'erreurs

### Test E1 : Plaque invalide

**Étapes :**
1. Saisir une plaque mal formatée : `ABCD123`
2. Cliquer sur "Rechercher"

**Résultat attendu :**
```
❌ Format de plaque invalide (ex: AB-123-CD)
```

---

### Test E2 : Champ vide

**Étapes :**
1. Ne rien saisir
2. Cliquer sur "Rechercher"

**Résultat attendu :**
```
❌ Veuillez saisir une valeur de recherche
```

---

### Test E3 : Paiement incomplet

**Étapes :**
1. Trouver une réservation
2. Choisir une durée
3. Sélectionner "Carte Bleue"
4. Ne remplir que le numéro de carte
5. Cliquer sur "Payer"

**Résultat attendu :**
```
❌ Veuillez compléter toutes les informations de paiement
(Bouton "Payer" devrait être désactivé)
```

---

## 📊 Calcul des prix

### Tarif : 1€50 les 30 minutes

| Durée extension | Prix attendu | Calcul |
|----------------|--------------|--------|
| 30 min | 1.50€ | 1 × 1.50€ |
| 1h | 3.00€ | 2 × 1.50€ |
| 1h 30min | 4.50€ | 3 × 1.50€ |
| 2h | 6.00€ | 4 × 1.50€ |
| 2h 30min | 7.50€ | 5 × 1.50€ |
| 3h | 9.00€ | 6 × 1.50€ |

---

## 🔍 Vérification dans la console

### Console navigateur (F12)

Pendant les tests, vérifier dans la console :

**Recherche réussie :**
```javascript
[Console] Réponse API : 
{
  id: "430cec33-4c1c-477f-aff1-0b249687806a",
  licencePlate: "AB-123-CD",
  vehicleType: "CAR",
  startAt: "2025-11-05T14:00:00",
  durationMinutes: 120,
  address: "Parking Gare",
  status: "ACTIVE",
  endAt: "2025-11-05T16:00:00"
}
```

**Extension réussie :**
```javascript
[Console] Extension validée :
{
  success: true,
  message: "Stationnement rallongé de 60 minutes",
  reservationId: "430cec33-4c1c-477f-aff1-0b249687806a",
  paymentAmount: 3.00,
  hourlyRate: 3.00
}
```

---

## ✅ Checklist finale

Avant de valider la fonctionnalité :

- [ ] Test 1 : Plaque inexistante → Erreur 404
- [ ] Test 2 : Plaque existante → Réservation trouvée
- [ ] Test 3 : Extension + paiement → Confirmation
- [ ] Test 4 : Vérification BDD → Données mises à jour
- [ ] Test 5 : Recherche par ID → Fonctionne
- [ ] Test 6 : Durée personnalisée → Prix correct
- [ ] Test E1 : Format invalide → Message d'erreur
- [ ] Test E2 : Champ vide → Message d'erreur
- [ ] Test E3 : Paiement incomplet → Bouton désactivé

---

## 🐛 Si ça ne marche pas

### Backend non accessible
```powershell
# Vérifier que le backend tourne
docker ps | Select-String "parkandsee-backend"

# Vérifier les logs
docker logs parkandsee-backend --tail 50

# Redémarrer si nécessaire
docker restart parkandsee-backend
```

### Base de données non accessible
```powershell
# Démarrer la base
docker start parkandsee-db

# Vérifier qu'elle tourne
docker ps | Select-String "parkandsee-db"
```

### Frontend ne charge pas
```powershell
# Redémarrer le serveur de dev
cd frontend-react
npm run dev
```

### URLs incorrectes
Vérifier que le port du backend est bien `8081` dans :
- `RallongerStationnement.jsx` ligne ~144 : `http://localhost:8081/api/parking/search`
- `RallongerStationnement.jsx` ligne ~271 : `http://localhost:8081/api/parking/extend`

---

## 📝 Notes

- Les extensions sont **cumulatives** : chaque extension s'ajoute à la durée totale
- Le montant du paiement est également **cumulatif**
- Seules les réservations **ACTIVE** peuvent être rallongées
- Les réservations **expirées** ne peuvent pas être rallongées
