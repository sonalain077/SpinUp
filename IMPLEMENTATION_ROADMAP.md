# Implémentation Feature Paiement → Réservation → Dashboard Agent

## ✅ BACKEND - CE QUI A ÉTÉ CRÉÉ

### 1. Nouvelles Entités (architecture propre)
- ✅ `Vehicle.java` - Entité véhicule avec plaque unique, type, normalisation
- ✅ `Parking.java` - Entité parking avec nom et capacité
- ✅ `Reservation.java` - Entité réservation avec relations ManyToOne, dates UTC (Instant)
- ✅ `PaymentMethod.java` - Enum méthodes de paiement (CARD, LYDIA, PAYPAL)

### 2. Repositories JPA
- ✅ `VehicleRepository.java` - findByPlate, existsByPlate
- ✅ `ParkingRepository.java` - findByName
- ✅ `NewReservationRepository.java` - Requêtes optimisées:
  - `findCurrentlyParkedVehicles(now)` - Véhicules garés (status=ACTIVE, endAt>now)
  - `findInfringements(now)` - Infractions (status=ACTIVE, endAt<now)
  - `countCurrentlyParkedInParking(parkingId, now)` - Occupation par parking
  - `countTotalParkedVehicles(now)` - Total véhicules garés

### 3. DTOs
- ✅ `CreateReservationRequest.java` - Payload POST /api/reservations
- ✅ `CreateReservationResponse.java` - Réponse création réservation
- ✅ `ParkedVehicleDTO.java` - Véhicule garé avec temps restant
- ✅ `InfringementDTO.java` - Infraction avec excès et sévérité
- ✅ `AgentOverviewDTO.java` - Vue d'ensemble (totals, perParking, infringements)

### 4. Services
- ✅ `ReservationService.java` - Logique création réservation:
  - Normalisation plaque (trim, upper, sans espaces)
  - Upsert Vehicle (find or create)
  - Validation parking existe
  - Calcul endAt = startAt + durationMinutes (UTC)
  - Création transactionnelle
  
- ✅ `AgentDashboardService.java` - Logique dashboard:
  - `getParkedVehicles()` - Liste véhicules garés
  - `getOverview()` - Agrégats complets (évite N+1 queries)

### 5. Controllers
- ✅ `NewReservationController.java` - POST /api/reservations (201 Created)
- ✅ `AgentController.java` - GET /api/agent/parked, GET /api/agent/overview

### 6. Données d'initialisation
- ✅ `data-new.sql` - 5 parkings, 5 véhicules, 5 réservations de test:
  - 2 véhicules normaux (temps restant)
  - 1 infraction légère (excès 10 min)
  - 1 infraction grave (excès 45 min)
  - 1 moto normale

## ✅ FRONTEND - CE QUI A ÉTÉ CRÉÉ

### 1. Service API
- ✅ `reservationApi.js`:
  - `normalizePlate(plate)` - Normalisation plaque (trim, upper, sans espaces)
  - `toUTCInstant(localDateTime)` - Conversion date locale → ISO-8601 UTC
  - `createReservation({...})` - POST /api/reservations avec payload normalisé
  - `getParkings()` - Liste parkings (hardcodé pour l'instant)

## 🔧 CE QU'IL RESTE À FAIRE

### BACKEND

#### 1. Configuration Base de Données
**Fichier**: `application.properties`
```properties
# Activer les nouvelles tables
spring.jpa.hibernate.ddl-auto=update

# Charger data-new.sql au lieu de data.sql
spring.sql.init.data-locations=classpath:data-new.sql
```

#### 2. Tests Backend (OBLIGATOIRES selon spec)

**a) ReservationControllerIntegrationTest.java**
```java
@SpringBootTest
@AutoConfigureMockMvc
class ReservationControllerIntegrationTest {
    
    @Test
    void shouldCreateReservationWithValidPayload() {
        // POST /api/reservations → 201, body cohérent
        // Vérifier: status=ACTIVE, endAt correct, priceCents, paymentMethod
    }
    
    @Test
    void shouldUpsertVehicle() {
        // Deux paiements avec même plaque → 1 seul vehicle en DB
    }
    
    @Test
    void shouldReturn400ForInvalidDuration() {
        // durationMinutes<=0 → 400
    }
    
    @Test
    void shouldReturn400ForUnknownParking() {
        // parkingId inconnu → 400
    }
    
    @Test
    void shouldReturn400ForInvalidStartAt() {
        // startAt invalide → 400
    }
}
```

**b) AgentOverviewServiceTest.java**
```java
@SpringBootTest
class AgentOverviewServiceTest {
    
    @Test
    void shouldCalculateCorrectOccupation() {
        // Créer 3 parkings + several reservations ACTIVE
        // Vérifier: totals.parkedVehicles = somme used
        // Vérifier: perParking.used exact par parking
    }
    
    @Test
    void shouldFindInfringements() {
        // Créer réservations expirées
        // Vérifier: infringements calcul exceededMinutes correct
        // Vérifier: severity LEGER (<30) / GRAVE (>=30)
    }
}
```

**c) TimezoneTest.java**
```java
@SpringBootTest
class TimezoneTest {
    
    @Test
    void shouldStoreInUTC() {
        // Créer réservation
        // Vérifier: startAt, endAt sont des Instant (UTC)
        // Vérifier: endAt = startAt + durationMinutes
    }
}
```

### FRONTEND

#### 1. Adapter ParkingReservation.jsx

**Fichier**: `frontend-react/src/components/ParkingReservation.jsx`

**Changements nécessaires**:

```jsx
import { createReservation, getParkings } from '../services/reservationApi';

// Dans handleSubmit():
const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  
  try {
    // Mapper l'adresse vers parkingId
    const parkingMapping = {
      'Parking Centre Ville': '550e8400-e29b-41d4-a716-446655440001',
      'Parking Gare': '550e8400-e29b-41d4-a716-446655440002',
      // ... autres parkings
    };
    
    const parkingId = parkingMapping[formData.address];
    
    // Calculer le montant en centimes (1€50 les 30 min)
    const pricePerHalfHour = 150; // centimes
    const halfHours = Math.ceil(formData.durationMinutes / 30);
    const amountCents = halfHours * pricePerHalfHour;
    
    // Appeler la nouvelle API
    const response = await createReservation({
      plate: formData.licencePlate,
      vehicleType: formData.vehicleType,
      parkingId,
      startAt: formData.startAt,
      durationMinutes: formData.durationMinutes,
      paymentMethod: 'CARD',
      amountCents
    });
    
    // Succès → Rediriger vers confirmation
    setResult(`✅ Réservation créée: ${response.reservationId}`);
    setResultType('success');
    
    // Rediriger vers dashboard après 2 secondes
    setTimeout(() => {
      navigate('/agent-dashboard');
    }, 2000);
    
  } catch (error) {
    setResult(`❌ Erreur: ${error.message}`);
    setResultType('error');
  } finally {
    setLoading(false);
  }
};
```

#### 2. Refactorer AgentDashboard.jsx

**Fichier**: `frontend-react/src/components/AgentDashboard.jsx`

**Changements nécessaires**:

```jsx
// Remplacer les appels API existants
const loadData = async () => {
  try {
    setLoading(true);
    
    // Nouvelle API unifiée
    const overviewRes = await fetch(`${API_BASE_URL}/agent/overview`);
    
    if (overviewRes.ok) {
      const overview = await overviewRes.json();
      
      // Mapper les données:
      // overview.totals → occupation
      setOccupation({
        totalActive: overview.totals.parkedVehicles,
        totalCapacity: overview.totals.capacity,
        availablePlaces: overview.totals.capacity - overview.totals.parkedVehicles,
        occupationRate: overview.totals.saturationIndex * 100
      });
      
      // overview.perParking → parkingZones
      setParkingZones(overview.perParking.map(p => ({
        parkingName: p.parkingName,
        occupiedPlaces: p.used,
        totalCapacity: p.capacity,
        availablePlaces: p.capacity - p.used,
        occupationRate: (p.used / p.capacity) * 100
      })));
      
      // overview.infringements → overdueReservations
      setOverdueReservations(overview.infringements.map(inf => ({
        id: inf.plate, // Utiliser plate comme ID temporaire
        licencePlate: inf.plate,
        vehicleType: inf.vehicleType,
        address: inf.parkingName,
        startAt: inf.startAt,
        endAt: inf.endAt,
        durationMinutes: inf.paidMinutes,
        status: inf.severity === 'LEGER' ? 'ACTIVE' : 'OVERDUE'
      })));
      
      // Calculer les stats
      const currentOverdue = overview.infringements.filter(
        inf => inf.exceededMinutes > 0
      ).length;
      
      const markedOverdue = 0; // À implémenter si nécessaire
      const regularized = 0; // À implémenter avec endpoint history
      
      const totalOverdueMinutes = overview.infringements.reduce(
        (sum, inf) => sum + inf.exceededMinutes, 0
      );
      
      const averageOverdueMinutes = currentOverdue > 0 
        ? Math.round(totalOverdueMinutes / currentOverdue) 
        : 0;
      
      setStats({
        currentOverdue,
        markedOverdue,
        regularized,
        totalOverdueMinutes,
        averageOverdueMinutes
      });
    }
  } catch (error) {
    console.error('❌ Erreur chargement:', error);
  } finally {
    setLoading(false);
  }
};

// Formatter les dates UTC en local
const formatLocalDateTime = (utcInstant) => {
  if (!utcInstant) return '';
  const date = new Date(utcInstant);
  return new Intl.DateTimeFormat('fr-FR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};
```

#### 3. Tests Frontend (OBLIGATOIRES)

**a) PaymentFlow.spec.tsx** (Vitest + RTL)
```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ParkingReservation from './ParkingReservation';
import * as reservationApi from '../services/reservationApi';

describe('PaymentFlow', () => {
  it('should normalize plate before sending', async () => {
    const mockCreate = vi.spyOn(reservationApi, 'createReservation')
      .mockResolvedValue({ reservationId: 'test-id' });
    
    render(<ParkingReservation />);
    
    // Remplir formulaire
    fireEvent.change(screen.getByLabelText(/plaque/i), {
      target: { value: ' ab 123 cd ' }
    });
    
    fireEvent.click(screen.getByText(/payer/i));
    
    await waitFor(() => {
      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          plate: 'AB-123-CD'
        })
      );
    });
  });
  
  it('should send startAt in ISO-8601 UTC', async () => {
    const mockCreate = vi.spyOn(reservationApi, 'createReservation')
      .mockResolvedValue({ reservationId: 'test-id' });
    
    render(<ParkingReservation />);
    
    // Sélectionner date
    const startAt = '2025-11-06T20:30';
    fireEvent.change(screen.getByLabelText(/début/i), {
      target: { value: startAt }
    });
    
    fireEvent.click(screen.getByText(/payer/i));
    
    await waitFor(() => {
      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          startAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
        })
      );
    });
  });
  
  it('should redirect to dashboard on success', async () => {
    // TODO: tester la redirection
  });
});
```

**b) AgentDashboard.spec.tsx**
```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import AgentDashboard from './AgentDashboard';

describe('AgentDashboard', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });
  
  it('should display occupation correctly', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        totals: { parkedVehicles: 11, capacity: 180, saturationIndex: 0.06 },
        perParking: [
          { parkingName: 'Centre Ville', used: 3, capacity: 40 }
        ],
        infringements: []
      })
    });
    
    render(<AgentDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText(/11/)).toBeInTheDocument(); // véhicules garés
      expect(screen.getByText(/6%/)).toBeInTheDocument(); // saturation
    });
  });
  
  it('should display infringements with correct severity', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        totals: { parkedVehicles: 1, capacity: 180, saturationIndex: 0.005 },
        perParking: [],
        infringements: [
          {
            plate: 'AB-123-CD',
            vehicleType: 'CAR',
            parkingName: 'Centre Ville',
            paidMinutes: 60,
            exceededMinutes: 45,
            severity: 'GRAVE'
          }
        ]
      })
    });
    
    render(<AgentDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText(/AB-123-CD/)).toBeInTheDocument();
      expect(screen.getByText(/GRAVE/)).toBeInTheDocument();
      expect(screen.getByText(/45.*min/)).toBeInTheDocument();
    });
  });
  
  it('should not use mock data', () => {
    // Vérifier qu'aucune donnée n'est hardcodée
    const source = AgentDashboard.toString();
    expect(source).not.toContain('const mockData');
    expect(source).not.toContain('[{plate:');
  });
});
```

**c) DateRender.spec.ts**
```typescript
import { describe, it, expect } from 'vitest';
import { formatLocalDateTime } from '../utils/dateFormatter';

describe('DateRender', () => {
  it('should display UTC dates in local time', () => {
    const utc = '2025-11-06T20:30:00Z';
    const local = formatLocalDateTime(utc);
    
    // Vérifier que c'est bien formaté en local (dépend du fuseau)
    expect(local).toMatch(/\d{2}\/\d{2}\/\d{4}/);
    expect(local).toMatch(/\d{2}:\d{2}/);
  });
});
```

## 📋 CHECKLIST FINALE

### Backend
- [ ] Activer `spring.jpa.hibernate.ddl-auto=update`
- [ ] Charger `data-new.sql` au démarrage
- [ ] Écrire `ReservationControllerIntegrationTest`
- [ ] Écrire `AgentOverviewServiceTest`
- [ ] Écrire `TimezoneTest`
- [ ] Vérifier que tous les tests passent (`mvn test`)

### Frontend
- [ ] Adapter `ParkingReservation.jsx` pour utiliser `createReservation()`
- [ ] Mapper address → parkingId
- [ ] Implémenter redirection vers dashboard après paiement
- [ ] Refactorer `AgentDashboard.jsx` pour utiliser `/api/agent/overview`
- [ ] Implémenter formatage dates UTC → local
- [ ] Supprimer toutes les données mockées
- [ ] Écrire `PaymentFlow.spec.tsx`
- [ ] Écrire `AgentDashboard.spec.tsx`
- [ ] Écrire `DateRender.spec.ts`
- [ ] Vérifier que tous les tests passent (`npm test`)

### Test End-to-End
- [ ] Lancer backend (`mvn spring-boot:run`)
- [ ] Lancer frontend (`npm run dev`)
- [ ] Créer une réservation via UI
- [ ] Vérifier que la ligne apparaît en DB (status=ACTIVE, dates UTC)
- [ ] Ouvrir Dashboard Agent
- [ ] Vérifier: statistiques correctes, occupation exacte, infractions avec sévérité
- [ ] Attendre que la réservation expire
- [ ] Vérifier que l'infraction apparaît avec exceededMinutes correct

## 🚀 POUR CONTINUER

**Étape 1**: Tester la création de réservation
```bash
# Terminal 1: Backend
cd backend
mvn clean spring-boot:run

# Terminal 2: Test API
curl -X POST http://localhost:8081/api/reservations \
  -H "Content-Type: application/json" \
  -d '{
    "plate": "ZZ-331-AE",
    "vehicleType": "CAR",
    "parkingId": "550e8400-e29b-41d4-a716-446655440001",
    "startAt": "2025-11-06T20:30:00Z",
    "durationMinutes": 390,
    "payment": {
      "method": "CARD",
      "amountCents": 1950
    }
  }'
```

**Étape 2**: Tester le dashboard
```bash
curl http://localhost:8081/api/agent/overview | jq
```

**Étape 3**: Implémenter les adaptations frontend listées ci-dessus

**Étape 4**: Écrire et exécuter tous les tests

## 📝 NOTES IMPORTANTES

1. **Horodatage**: Toutes les dates sont en UTC (Instant) en DB. Le frontend convertit en local pour l'affichage uniquement.

2. **Normalisation plaque**: TOUJOURS faire `trim().toUpperCase().replace(/\s+/g,'')` avant envoi API.

3. **Upsert Vehicle**: Le service fait automatiquement find-or-create. Pas besoin de vérifier côté frontend.

4. **Sévérité**: LEGER si exceededMinutes < 30, GRAVE si >= 30.

5. **Occupation**: used = COUNT(status=ACTIVE, endAt>now). Ne pas compter les COMPLETED.

6. **Tests obligatoires**: Selon la spec, TOUS les tests listés doivent être implémentés et passer.

---

**Architecture créée**: ✅  
**API endpoints créés**: ✅  
**Services créés**: ✅  
**DTOs créés**: ✅  
**Frontend service API créé**: ✅  

**Il reste**: Adaptations frontend (2 composants) + Tests (6 fichiers)
