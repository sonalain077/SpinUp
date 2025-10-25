-- ================================================================================================
-- Données de test Park & See - Dashboard Agent
-- ================================================================================================
-- Date de référence : 24 octobre 2025, 14h00
-- Colonnes: id, licence_plate, vehicle_type, start_at, duration_minutes, address, payment_amount, status, created_at, updated_at
-- Tarifs de référence : 1.50€/heure = 0.025€/minute
-- ================================================================================================

-- SUPPRESSION DES DONNÉES EXISTANTES
DELETE FROM reservations;

-- ================================================================================================
-- PARKINGS DISPONIBLES (pour référence)
-- ================================================================================================
-- Parking Centre Ville : 40 places
-- Parking Gare : 50 places
-- Parking République : 30 places
-- Parking Liberté : 25 places
-- Parking Mairie : 35 places

-- ================================================================================================
-- VÉHICULES ACTIFS (10 véhicules) - Mélange de situations réalistes
-- ================================================================================================

-- ---------------------------------------------------------------
-- 1. Véhicules NORMAUX (3) - Stationnement en cours, temps restant
-- ---------------------------------------------------------------
INSERT INTO reservations (id, licence_plate, vehicle_type, start_at, duration_minutes, address, payment_amount, status, created_at, updated_at) 
VALUES 
  -- AB-123-CD : Arrivé il y a 25 min, payé 120 min ↁEReste 95 min (NORMAL) - 3.00€
  ('res-001', 'AB-123-CD', 'CAR', CURRENT_TIMESTAMP - INTERVAL '25 minutes', 120, 'Parking Centre Ville', 3.00, 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  
  -- EF-456-GH : Arrivé il y a 10 min, payé 60 min ↁEReste 50 min (NORMAL) - 1.50€
  ('res-002', 'EF-456-GH', 'CAR', CURRENT_TIMESTAMP - INTERVAL '10 minutes', 60, 'Parking Gare', 1.50, 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  
  -- IJ-789-KL : Arrivé il y a 15 min, payé 90 min ↁEReste 75 min (NORMAL) - 2.25€
  ('res-003', 'IJ-789-KL', 'MOTORCYCLE', CURRENT_TIMESTAMP - INTERVAL '15 minutes', 90, 'Parking Mairie', 2.25, 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- ---------------------------------------------------------------
-- 2. Véhicules EN EXCÁE LÉGER (2) - Dépassement 5-20 minutes
-- ---------------------------------------------------------------
INSERT INTO reservations (id, licence_plate, vehicle_type, start_at, duration_minutes, address, payment_amount, status, created_at, updated_at) 
VALUES 
  -- MN-111-OP : Arrivé il y a 70 min, payé 60 min ↁEExcès 10 min (LÉGER) - 1.50€
  ('res-004', 'MN-111-OP', 'CAR', CURRENT_TIMESTAMP - INTERVAL '70 minutes', 60, 'Parking Centre Ville', 1.50, 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  
  -- QR-222-ST : Arrivé il y a 140 min, payé 120 min ↁEExcès 20 min (LÉGER) - 3.00€
  ('res-005', 'QR-222-ST', 'CAR', CURRENT_TIMESTAMP - INTERVAL '140 minutes', 120, 'Parking République', 3.00, 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- ---------------------------------------------------------------
-- 3. Véhicules EN EXCÁE MODÉRÁE(2) - Dépassement 21-60 minutes
-- ---------------------------------------------------------------
INSERT INTO reservations (id, licence_plate, vehicle_type, start_at, duration_minutes, address, payment_amount, status, created_at, updated_at) 
VALUES 
  -- UV-333-WX : Arrivé il y a 120 min, payé 90 min ↁEExcès 30 min (MODÉRÁE - 2.25€
  ('res-006', 'UV-333-WX', 'MOTORCYCLE', CURRENT_TIMESTAMP - INTERVAL '120 minutes', 90, 'Parking Gare', 2.25, 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  
  -- YZ-444-AB : Arrivé il y a 90 min, payé 45 min ↁEExcès 45 min (MODÉRÁE - 1.13€
  ('res-007', 'YZ-444-AB', 'ELECTRIC_SCOOTER', CURRENT_TIMESTAMP - INTERVAL '90 minutes', 45, 'Parking Liberté', 1.13, 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- ---------------------------------------------------------------
-- 4. Véhicules EN EXCÁE GRAVE (1) - Dépassement > 60 minutes
-- ---------------------------------------------------------------
INSERT INTO reservations (id, licence_plate, vehicle_type, start_at, duration_minutes, address, payment_amount, status, created_at, updated_at) 
VALUES 
  -- CD-555-EF : Arrivé il y a 195 min, payé 120 min ↁEExcès 75 min (GRAVE) - 3.00€
  ('res-008', 'CD-555-EF', 'CAR', CURRENT_TIMESTAMP - INTERVAL '195 minutes', 120, 'Parking Centre Ville', 3.00, 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- ---------------------------------------------------------------
-- 5. Véhicules SIGNALÉS (2) - Déjà repérés par un agent
-- ---------------------------------------------------------------
INSERT INTO reservations (id, licence_plate, vehicle_type, start_at, duration_minutes, address, payment_amount, status, created_at, updated_at) 
VALUES 
  -- GH-666-IJ : Arrivé il y a 155 min, payé 120 min ↁEExcès 35 min, SIGNALÁE- 3.00€
  ('res-009', 'GH-666-IJ', 'CAR', CURRENT_TIMESTAMP - INTERVAL '155 minutes', 120, 'Parking République', 3.00, 'SIGNALE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  
  -- KL-777-MN : Arrivé il y a 180 min, payé 90 min ↁEExcès 90 min, SIGNALÁE- 2.25€
  ('res-010', 'KL-777-MN', 'CAR', CURRENT_TIMESTAMP - INTERVAL '180 minutes', 90, 'Parking Gare', 2.25, 'SIGNALE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- ================================================================================================
-- HISTORIQUE (5 véhicules régularisés)
-- ================================================================================================
INSERT INTO reservations (id, licence_plate, vehicle_type, start_at, duration_minutes, address, payment_amount, status, created_at, updated_at) 
VALUES 
  -- Véhicules qui ont quitté le parking aujourd'hui
  ('res-011', 'NO-111-PQ', 'CAR', CURRENT_TIMESTAMP - INTERVAL '4 hours', 120, 'Parking Centre Ville', 3.00, 'COMPLETED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP - INTERVAL '2 hours'),
  ('res-012', 'RS-222-TU', 'MOTORCYCLE', CURRENT_TIMESTAMP - INTERVAL '3 hours', 60, 'Parking Gare', 1.50, 'COMPLETED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP - INTERVAL '2 hours'),
  ('res-013', 'VW-333-XY', 'CAR', CURRENT_TIMESTAMP - INTERVAL '5 hours', 90, 'Parking République', 2.25, 'COMPLETED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP - INTERVAL '3 hours'),
  ('res-014', 'ZA-444-BC', 'CAR', CURRENT_TIMESTAMP - INTERVAL '6 hours', 120, 'Parking Liberté', 3.00, 'COMPLETED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP - INTERVAL '4 hours'),
  ('res-015', 'DE-555-FG', 'BICYCLE', CURRENT_TIMESTAMP - INTERVAL '2 hours', 60, 'Parking Mairie', 1.50, 'COMPLETED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP - INTERVAL '1 hour');

-- ================================================================================================
-- RÉSUMÁEATTENDU
-- ================================================================================================
-- Total véhicules présents (ACTIVE + SIGNALE) : 10
--   - ACTIVE normaux (temps restant) : 3
--   - ACTIVE en excès : 5
--   - SIGNALE : 2
--
-- Répartition par parking :
--   - Parking Centre Ville : 3 véhicules (AB-123-CD, MN-111-OP, CD-555-EF)
--   - Parking Gare : 3 véhicules (EF-456-GH, UV-333-WX, KL-777-MN)
--   - Parking République : 2 véhicules (QR-222-ST, GH-666-IJ)
--   - Parking Liberté : 1 véhicule (YZ-444-AB)
--   - Parking Mairie : 1 véhicule (IJ-789-KL)
--
-- KPI Excès :
--   - En excès maintenant : 5 (ACTIVE avec dépassement)
--   - Déjà signalés : 2
--   - Régularisés : 5
--   - Durée moyenne excès : ~44 min (10+20+30+45+75) / 5 = 36 min + signalés
-- ================================================================================================



