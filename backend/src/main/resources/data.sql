-- Données de test pour Park & See (compatible PostgreSQL et H2)

-- Insérer les parkings seulement s'ils n'existent pas
INSERT INTO parkings (id, name, address, total_spots, created_at, updated_at)
SELECT 'park-001', 'Parking Centre-Ville', '10 Rue de la République', 150, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM parkings WHERE id = 'park-001');

INSERT INTO parkings (id, name, address, total_spots, created_at, updated_at)
SELECT 'park-002', 'Parking Gare Nord', '25 Avenue de la Gare', 200, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM parkings WHERE id = 'park-002');

INSERT INTO parkings (id, name, address, total_spots, created_at, updated_at)
SELECT 'park-003', 'Parking République', '5 Place de la République', 100, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM parkings WHERE id = 'park-003');

INSERT INTO parkings (id, name, address, total_spots, created_at, updated_at)
SELECT 'park-004', 'Parking Hôtel de Ville', '15 Rue du Maire', 80, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM parkings WHERE id = 'park-004');

INSERT INTO parkings (id, name, address, total_spots, created_at, updated_at)
SELECT 'park-005', 'Parking Cité Judiciaire', '30 Boulevard des Tribunaux', 120, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM parkings WHERE id = 'park-005');

INSERT INTO parkings (id, name, address, total_spots, created_at, updated_at)
SELECT 'park-006', 'Parking des Arts', '8 Avenue des Artistes', 90, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM parkings WHERE id = 'park-006');

-- ================================================================================================
-- DONNÉES DE TEST - RÉSERVATIONS (PostgreSQL compatible)
-- ================================================================================================

-- Fonction helper pour calculer des timestamps relatifs
-- CURRENT_TIMESTAMP - INTERVAL '25 minutes' = il y a 25 minutes
-- CURRENT_TIMESTAMP + INTERVAL '10 minutes' = dans 10 minutes

-- 🚗 Réservation 1 : EN RETARD (dépassement de 25 minutes)
-- Statut : ACTIVE, mais le temps est dépassé depuis 25 min
INSERT INTO reservations (id, licence_plate, vehicle_type, address, start_at, duration_minutes, status, payment_amount, created_at, updated_at)
SELECT 
    'res-001',
    'TR-234-OP',
    'MOTORCYCLE',
    'Parking Gare Nord',
    CURRENT_TIMESTAMP - INTERVAL '26 minutes',  -- Arrivée il y a 26 min
    1,                                          -- Durée réservée: 1 min
    'ACTIVE',
    0.10,
    CURRENT_TIMESTAMP - INTERVAL '26 minutes',
    CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM reservations WHERE id = 'res-001');

-- 🚗 Réservation 2 : EN RETARD (dépassement de 10 minutes)
INSERT INTO reservations (id, licence_plate, vehicle_type, address, start_at, duration_minutes, status, payment_amount, created_at, updated_at)
SELECT 
    'res-002',
    'AB-123-CD',
    'CAR',
    'Parking Centre-Ville',
    CURRENT_TIMESTAMP - INTERVAL '40 minutes',  
    30,                                         
    'ACTIVE',
    3.00,
    CURRENT_TIMESTAMP - INTERVAL '40 minutes',
    CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM reservations WHERE id = 'res-002');

-- 🚗 Réservation 3 : EN COURS (encore 15 min restantes)
INSERT INTO reservations (id, licence_plate, vehicle_type, address, start_at, duration_minutes, status, payment_amount, created_at, updated_at)
SELECT 
    'res-003',
    'EF-456-GH',
    'CAR',
    'Parking République',
    CURRENT_TIMESTAMP - INTERVAL '45 minutes',  
    60,                                         
    'ACTIVE',
    6.00,
    CURRENT_TIMESTAMP - INTERVAL '45 minutes',
    CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM reservations WHERE id = 'res-003');

-- 🚗 Réservation 4 : DÉJÀ SIGNALÉE (excès de 20 min)
INSERT INTO reservations (id, licence_plate, vehicle_type, address, start_at, duration_minutes, status, payment_amount, created_at, updated_at)
SELECT 
    'res-004',
    'IJ-789-KL',
    'VAN',
    'Parking Hôtel de Ville',
    CURRENT_TIMESTAMP - INTERVAL '80 minutes',  
    60,                                         
    'SIGNALE',
    6.00,
    CURRENT_TIMESTAMP - INTERVAL '80 minutes',
    CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM reservations WHERE id = 'res-004');

-- 🚗 Réservation 5 : EN RETARD (dépassement de 45 minutes)
INSERT INTO reservations (id, licence_plate, vehicle_type, address, start_at, duration_minutes, status, payment_amount, created_at, updated_at)
SELECT 
    'res-005',
    'MN-012-OP',
    'CAR',
    'Parking Cité Judiciaire',
    CURRENT_TIMESTAMP - INTERVAL '105 minutes',  
    60,                                         
    'ACTIVE',
    6.00,
    CURRENT_TIMESTAMP - INTERVAL '105 minutes',
    CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM reservations WHERE id = 'res-005');

-- 🚗 Réservation 6 : RÉGULARISÉE (anciennement en excès, payée)
INSERT INTO reservations (id, licence_plate, vehicle_type, address, start_at, duration_minutes, status, payment_amount, created_at, updated_at)
SELECT 
    'res-006',
    'QR-345-ST',
    'CAR',
    'Parking des Arts',
    CURRENT_TIMESTAMP - INTERVAL '3 hours',  
    60,                                         
    'REGULARISE',
    9.00,
    CURRENT_TIMESTAMP - INTERVAL '3 hours',
    CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM reservations WHERE id = 'res-006');

-- 🚗 Réservation 7 : COMPLÉTÉE (sortie normale)
INSERT INTO reservations (id, licence_plate, vehicle_type, address, start_at, duration_minutes, status, payment_amount, created_at, updated_at)
SELECT 
    'res-007',
    'UV-678-WX',
    'CAR',
    'Parking Centre-Ville',
    CURRENT_TIMESTAMP - INTERVAL '2 hours',  
    60,                                         
    'COMPLETED',
    6.00,
    CURRENT_TIMESTAMP - INTERVAL '2 hours',
    CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM reservations WHERE id = 'res-007');

-- ================================================================================================
-- RÉSUMÉ DES DONNÉES DE TEST
-- ================================================================================================
-- Parkings : 6 (Centre-Ville, Gare Nord, République, Hôtel de Ville, Cité Judiciaire, Arts)
-- Réservations ACTIVES en excès : 3 (TR-234-OP: +25min, AB-123-CD: +10min, MN-012-OP: +45min)
-- Réservations ACTIVES OK : 1 (EF-456-GH: encore 15min)
-- Réservations SIGNALÉES : 1 (IJ-789-KL: +20min)
-- Réservations RÉGULARISÉES : 1 (QR-345-ST: anciennement en excès)
-- Réservations COMPLÉTÉES : 1 (UV-678-WX: sortie normale)
-- ================================================================================================



