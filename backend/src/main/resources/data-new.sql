-- ================================================================================================
-- Données d'initialisation Park & See - Nouvelle Architecture
-- ================================================================================================
-- Tables: vehicles, parkings, reservations
-- Toutes les dates en UTC (Instant)
-- ================================================================================================

-- SUPPRESSION DES DONNÉES EXISTANTES (dans l'ordre des contraintes)
DELETE FROM reservations WHERE 1=1;
DELETE FROM vehicles WHERE 1=1;
DELETE FROM parkings WHERE 1=1;

-- ================================================================================================
-- PARKINGS (5 parkings avec capacités)
-- ================================================================================================
INSERT INTO parkings (id, name, capacity) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Parking Centre Ville', 40),
('550e8400-e29b-41d4-a716-446655440002', 'Parking Gare', 50),
('550e8400-e29b-41d4-a716-446655440003', 'Parking République', 30),
('550e8400-e29b-41d4-a716-446655440004', 'Parking Liberté', 25),
('550e8400-e29b-41d4-a716-446655440005', 'Parking Mairie', 35);

-- ================================================================================================
-- VÉHICULES (quelques exemples)
-- ================================================================================================
INSERT INTO vehicles (id, plate, type, created_at) VALUES
('650e8400-e29b-41d4-a716-446655440001', 'AB-123-CD', 'CAR', CURRENT_TIMESTAMP),
('650e8400-e29b-41d4-a716-446655440002', 'EF-456-GH', 'CAR', CURRENT_TIMESTAMP),
('650e8400-e29b-41d4-a716-446655440003', 'IJ-789-KL', 'MOTORCYCLE', CURRENT_TIMESTAMP),
('650e8400-e29b-41d4-a716-446655440004', 'MN-111-OP', 'CAR', CURRENT_TIMESTAMP),
('650e8400-e29b-41d4-a716-446655440005', 'QR-222-ST', 'VAN', CURRENT_TIMESTAMP);

-- ================================================================================================
-- RÉSERVATIONS ACTIVES (pour tests)
-- ================================================================================================

-- 1. Véhicule NORMAL (temps restant: 95 min)
-- Arrivé il y a 25 min, payé 120 min → endAt dans 95 min
INSERT INTO reservations (id, vehicle_id, parking_id, start_at, end_at, duration_minutes, price_cents, payment_method, status, created_at) 
VALUES (
  '750e8400-e29b-41d4-a716-446655440001',
  '650e8400-e29b-41d4-a716-446655440001', -- AB-123-CD
  '550e8400-e29b-41d4-a716-446655440001', -- Parking Centre Ville
  DATEADD(MINUTE, -25, CURRENT_TIMESTAMP),
  DATEADD(MINUTE, 95, CURRENT_TIMESTAMP),
  120,
  1200,
  'CARD',
  'ACTIVE',
  CURRENT_TIMESTAMP
);

-- 2. Véhicule NORMAL (temps restant: 50 min)
INSERT INTO reservations (id, vehicle_id, parking_id, start_at, end_at, duration_minutes, price_cents, payment_method, status, created_at) 
VALUES (
  '750e8400-e29b-41d4-a716-446655440002',
  '650e8400-e29b-41d4-a716-446655440002', -- EF-456-GH
  '550e8400-e29b-41d4-a716-446655440002', -- Parking Gare
  DATEADD(MINUTE, -10, CURRENT_TIMESTAMP),
  DATEADD(MINUTE, 50, CURRENT_TIMESTAMP),
  60,
  600,
  'LYDIA',
  'ACTIVE',
  CURRENT_TIMESTAMP
);

-- 3. Véhicule EN INFRACTION LÉGÈRE (excès: 10 min)
-- Arrivé il y a 70 min, payé 60 min → endAt était il y a 10 min
INSERT INTO reservations (id, vehicle_id, parking_id, start_at, end_at, duration_minutes, price_cents, payment_method, status, created_at) 
VALUES (
  '750e8400-e29b-41d4-a716-446655440003',
  '650e8400-e29b-41d4-a716-446655440004', -- MN-111-OP
  '550e8400-e29b-41d4-a716-446655440001', -- Parking Centre Ville
  DATEADD(MINUTE, -70, CURRENT_TIMESTAMP),
  DATEADD(MINUTE, -10, CURRENT_TIMESTAMP),
  60,
  600,
  'CARD',
  'ACTIVE',
  CURRENT_TIMESTAMP
);

-- 4. Véhicule EN INFRACTION GRAVE (excès: 45 min)
-- Arrivé il y a 165 min, payé 120 min → endAt était il y a 45 min
INSERT INTO reservations (id, vehicle_id, parking_id, start_at, end_at, duration_minutes, price_cents, payment_method, status, created_at) 
VALUES (
  '750e8400-e29b-41d4-a716-446655440004',
  '650e8400-e29b-41d4-a716-446655440005', -- QR-222-ST
  '550e8400-e29b-41d4-a716-446655440003', -- Parking République
  DATEADD(MINUTE, -165, CURRENT_TIMESTAMP),
  DATEADD(MINUTE, -45, CURRENT_TIMESTAMP),
  120,
  1200,
  'PAYPAL',
  'ACTIVE',
  CURRENT_TIMESTAMP
);

-- 5. Moto normale
INSERT INTO reservations (id, vehicle_id, parking_id, start_at, end_at, duration_minutes, price_cents, payment_method, status, created_at) 
VALUES (
  '750e8400-e29b-41d4-a716-446655440005',
  '650e8400-e29b-41d4-a716-446655440003', -- IJ-789-KL
  '550e8400-e29b-41d4-a716-446655440005', -- Parking Mairie
  DATEADD(MINUTE, -15, CURRENT_TIMESTAMP),
  DATEADD(MINUTE, 75, CURRENT_TIMESTAMP),
  90,
  900,
  'CARD',
  'ACTIVE',
  CURRENT_TIMESTAMP
);
