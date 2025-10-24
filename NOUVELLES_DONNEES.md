# 📊 Nouvelles Données de Test - Dashboard Agent

## ✅ Données créées

### 10 Véhicules répartis intelligemment

#### 🟢 Véhicules NORMAUX (3) - Pas d'excès
| Plaque | Type | Parking | Durée payée | Temps écoulé | Reste |
|--------|------|---------|-------------|--------------|-------|
| AB-123-CD | CAR | Parking Centre Ville | 120 min | 25 min | 95 min ✅ |
| EF-456-GH | CAR | Parking Gare | 60 min | 10 min | 50 min ✅ |
| IJ-789-KL | MOTORCYCLE | Parking Mairie | 90 min | 15 min | 75 min ✅ |

#### 🟡 Véhicules EN EXCÈS LÉGER (2) - 5-20 minutes
| Plaque | Type | Parking | Durée payée | Temps écoulé | Excès |
|--------|------|---------|-------------|--------------|-------|
| MN-111-OP | CAR | Parking Centre Ville | 60 min | 70 min | **10 min** ⚠️ |
| QR-222-ST | CAR | Parking République | 120 min | 140 min | **20 min** ⚠️ |

#### 🟠 Véhicules EN EXCÈS MODÉRÉ (2) - 21-60 minutes
| Plaque | Type | Parking | Durée payée | Temps écoulé | Excès |
|--------|------|---------|-------------|--------------|-------|
| UV-333-WX | MOTORCYCLE | Parking Gare | 90 min | 120 min | **30 min** ⏰ |
| YZ-444-AB | ELECTRIC_SCOOTER | Parking Liberté | 45 min | 90 min | **45 min** ⏰ |

#### 🔴 Véhicules EN EXCÈS GRAVE (1) - > 60 minutes
| Plaque | Type | Parking | Durée payée | Temps écoulé | Excès |
|--------|------|---------|-------------|--------------|-------|
| CD-555-EF | CAR | Parking Centre Ville | 120 min | 195 min | **75 min** 🚨 |

#### 🚨 Véhicules SIGNALÉS (2) - Déjà repérés
| Plaque | Type | Parking | Durée payée | Temps écoulé | Excès | Statut |
|--------|------|---------|-------------|--------------|-------|--------|
| GH-666-IJ | CAR | Parking République | 120 min | 155 min | **35 min** | SIGNALE |
| KL-777-MN | CAR | Parking Gare | 90 min | 180 min | **90 min** | SIGNALE |

### 5 Véhicules RÉGULARISÉS (historique)
- NO-111-PQ, RS-222-TU, VW-333-XY, ZA-444-BC, DE-555-FG

## 📍 Répartition par parking

| Parking | Capacité | Véhicules présents | Taux |
|---------|----------|-------------------|------|
| **Parking Centre Ville** | 40 | 3 (AB-123-CD, MN-111-OP, CD-555-EF) | 7.5% |
| **Parking Gare** | 50 | 3 (EF-456-GH, UV-333-WX, KL-777-MN) | 6% |
| **Parking République** | 30 | 2 (QR-222-ST, GH-666-IJ) | 6.7% |
| **Parking Liberté** | 25 | 1 (YZ-444-AB) | 4% |
| **Parking Mairie** | 35 | 1 (IJ-789-KL) | 2.9% |

## 📊 KPI Attendus sur le Dashboard

### Section 1 - Stats Globales
- ✅ **Véhicules présents** : 10 (tous ACTIVE + SIGNALE)
- ✅ **Capacité totale** : 180 places (40+50+30+25+35)
- ✅ **Taux d'occupation global** : ~5.6% (10/180)
- ✅ **Taux d'occupation moyen** : ~5.4% ((7.5+6+6.7+4+2.9)/5)
- ✅ **Parking le plus rempli** : Parking Centre Ville (3/40 = 7.5%)
- ✅ **Indice de répartition** : ~85 (bonne distribution)

### Section 2 - Grille d'occupation
5 parkings affichés avec barres de progression :
- Parking Centre Ville : 7.5% (vert - low)
- Parking Gare : 6% (vert - low)
- Parking République : 6.7% (vert - low)
- Parking Liberté : 4% (vert - low)
- Parking Mairie : 2.9% (vert - low)

### Section 3 - KPI Excès
- ✅ **En excès maintenant** : 5 (MN-111-OP, QR-222-ST, UV-333-WX, YZ-444-AB, CD-555-EF)
- ✅ **Déjà signalés** : 2 (GH-666-IJ, KL-777-MN)
- ✅ **Régularisés** : 5
- ✅ **Durée moyenne excès** : ~44 min ((10+20+30+45+75+35+90)/7)
- ✅ **Temps total excès** : ~305 min

### Section 4 - Infractions par parking
**3 groupes affichés** (seulement parkings avec infractions) :

1. **🅿️ Parking Centre Ville** - 2 infractions
   - MN-111-OP : Excès 10 min (badge LÉGER 🟡)
   - CD-555-EF : Excès 75 min (badge GRAVE 🔴)

2. **🅿️ Parking République** - 2 infractions
   - QR-222-ST : Excès 20 min (badge LÉGER 🟡)
   - GH-666-IJ : Excès 35 min, SIGNALE (badge MODÉRÉ 🟠)

3. **🅿️ Parking Gare** - 2 infractions
   - UV-333-WX : Excès 30 min (badge MODÉRÉ 🟠)
   - KL-777-MN : Excès 90 min, SIGNALE (badge GRAVE 🔴)

4. **🅿️ Parking Liberté** - 1 infraction
   - YZ-444-AB : Excès 45 min (badge MODÉRÉ 🟠)

## 🎨 Style esthétique

### Couleurs des badges
- ✅ **Normal** : Vert clair `#d1fae5` / Texte `#065f46`
- ⚠️ **Léger (5-20 min)** : Orange clair `#fed7aa` / Texte `#92400e`
- ⏰ **Modéré (21-60 min)** : Orange `#fed7aa` / Texte `#7c2d12`
- 🚨 **Grave (> 60 min)** : Rouge clair `#fee2e2` / Texte `#991b1b`

### Cartes KPI
- Bordure de 2px avec couleur correspondante
- Ombre douce `box-shadow`
- Hover avec effet de scale (1.02)
- Icônes emoji pour faciliter la lecture

### Responsive
- Mobile (< 768px) : 1 colonne
- Tablet (768-1024px) : 2 colonnes
- Desktop (> 1024px) : 4 colonnes pour stats, 3 pour grille

## 🚀 Commandes pour appliquer

```powershell
# 1. Arrêter le backend
Ctrl+C dans le terminal backend

# 2. Nettoyer et redémarrer
cd backend
mvn clean spring-boot:run

# 3. Les nouvelles données seront chargées automatiquement
```

## ✅ Vérifications à faire

1. **Console backend** : Vérifier le chargement
   ```
   Hibernate: DELETE FROM reservations
   Hibernate: INSERT INTO reservations (id, licence_plate, ...) VALUES (...)
   ```

2. **Dashboard** : Rafraîchir la page (F5)
   - Véhicules présents : 10
   - 4 parkings avec infractions dans Section 4
   - Stats cohérentes

3. **Modales** : Cliquer sur "Détails (3)" pour Parking Centre Ville
   - 3 véhicules listés
   - Tri par statut fonctionne

4. **Actions** : Tester Signal/Régulariser
   - Toast de confirmation
   - Mise à jour optimiste de l'UI

---

**Cohérence garantie** : Toutes les données sont calculées avec `TIMESTAMPADD` relatif à `CURRENT_TIMESTAMP`, donc toujours cohérentes quelle que soit l'heure de lancement ! 🎯
