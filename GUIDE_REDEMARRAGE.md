# 🚀 Guide de Redémarrage - Dashboard Agent

## ⚠️ Problème actuel

L'erreur "Erreur lors du chargement des données" apparaît car le backend n'a pas encore été redémarré avec le nouveau code qui inclut l'endpoint `/api/agent/overdue/all-active`.

## ✅ Solution : Redémarrer le backend

### Option 1 : Via les tâches VS Code (RECOMMANDÉ)

1. **Arrêter le backend actuel** :
   - Ouvrir le Terminal VS Code
   - Appuyer sur `Ctrl+C` dans le terminal du backend
   - OU utiliser la tâche : `Ctrl+Shift+P` → "Tasks: Run Task" → "Stop Backend"

2. **Redémarrer le backend** :
   - `Ctrl+Shift+P` → "Tasks: Run Task" → "Backend Dev (once)"
   - OU dans le terminal PowerShell :
     ```powershell
     cd backend
     mvn clean spring-boot:run
     ```

3. **Attendre le message** :
   ```
   Started BackendApplication in X.XXX seconds
   ```

4. **Rafraîchir le Dashboard Agent** dans le navigateur

### Option 2 : Script automatique

```powershell
# Depuis la racine du projet
.\scripts\stop-app.ps1
.\scripts\start-backend-once.ps1
```

### Option 3 : Redémarrage complet

```powershell
# Arrêter tout
Ctrl+C dans tous les terminaux

# Relancer tout
.\start-dev.ps1
```

## 🔍 Vérification

Une fois le backend redémarré, vérifiez que l'endpoint fonctionne :

```powershell
# Test de l'endpoint
curl http://localhost:8081/api/agent/overdue/all-active
```

**Réponse attendue** : Un tableau JSON de réservations
```json
[
  {
    "id": "...",
    "licencePlate": "NO-144-NO",
    "vehicleType": "MOTORCYCLE",
    "startAt": "2025-10-24T...",
    "durationMinutes": 1,
    "address": "Parking Liberté",
    "status": "ACTIVE",
    ...
  }
]
```

## 📊 Comportement attendu après redémarrage

### Dashboard Agent affichera :

1. **Section 1 - Stats Globales** :
   - Véhicules présents : **TOUS** les ACTIVE + SIGNALE
   - Taux d'occupation basé sur tous les véhicules

2. **Section 2 - Grille d'occupation** :
   - Parking Liberté : 1 / 25 places
   - Clic sur "Détails" → Modale avec NO-144-NO

3. **Section 3 - KPI Excès** :
   - "En excès maintenant" : 1 (NO-144-NO)
   - Durée moyenne excès : 2min

4. **Section 4 - Infractions par parking** :
   - 🅿️ Parking Liberté : 1 infraction
   - Ticket NO-144-NO avec badge "Léger" (2min d'excès)

## 🐛 Si le problème persiste

### 1. Vérifier les logs backend

Dans le terminal du backend, cherchez :
```
🔍 ===== findAllActiveReservations() =====
📊 ACTIVE: 1
📊 SIGNALE: 0
✅ Total véhicules présents: 1
```

### 2. Vérifier les logs frontend

Dans la console du navigateur (F12), cherchez :
```
📊 [useAgentData] Données chargées: { tickets: 1, parkings: 3, history: ... }
🔍 [useAgentData] Premier ticket mappé: { ..., hasStartTime: true, hasDuration: true, hasParkingZone: true }
🔍 [groupOverdueTicketsByParking] Input tickets: 1
  - Ticket NO-144-NO (ACTIVE): 2min excès
✅ [groupOverdueTicketsByParking] Tickets filtrés: 1
```

### 3. Vérifier que le mapping fonctionne

Si les logs montrent `hasStartTime: false` ou `hasDuration: false`, le mapping a échoué.

### 4. Backend non démarré

Si erreur "Impossible de se connecter au serveur backend" :
```powershell
# Vérifier que le backend tourne sur le port 8081
netstat -ano | findstr :8081
```

Si rien n'apparaît → backend non démarré, le lancer avec :
```powershell
cd backend
mvn spring-boot:run
```

## 🎯 Fallback automatique

Le code frontend inclut maintenant un fallback automatique :
- Essai de `/api/agent/overdue/all-active` (nouveau)
- Si 404 → fallback vers `/api/agent/overdue` (ancien, seulement véhicules en excès)

Donc **même sans redémarrage**, le Dashboard fonctionne (mais n'affiche que les véhicules en excès).

## 📝 Fichiers modifiés

- ✅ `backend/.../OverdueControlController.java` (endpoint `/all-active`)
- ✅ `backend/.../OverdueControlService.java` (méthode `findAllActiveReservations()`)
- ✅ `frontend-react/src/hooks/useAgentData.jsx` (fallback + meilleure gestion d'erreur)

---

**TL;DR** : Redémarrez le backend avec `mvn spring-boot:run` pour activer le nouvel endpoint.
