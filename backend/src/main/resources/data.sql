-- ================================================================================================
-- Données de test Park & See - Dashboard Agent
-- ================================================================================================
-- Date de référence : 24 octobre 2025, 14h00
-- Colonnes: id, licence_plate, vehicle_type, start_at, duration_minutes, address, status, created_at, updated_at
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
INSERT INTO reservations (id, licence_plate, vehicle_type, start_at, duration_minutes, address, status, created_at, updated_at) 
VALUES 
  -- AB-123-CD : Arrivé il y a 25 min, payé 120 min → Reste 95 min (NORMAL)
  ('res-001', 'AB-123-CD', 'CAR', TIMESTAMPADD(MINUTE, -25, CURRENT_TIMESTAMP), 120, 'Parking Centre Ville', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  
  -- EF-456-GH : Arrivé il y a 10 min, payé 60 min → Reste 50 min (NORMAL)
  ('res-002', 'EF-456-GH', 'CAR', TIMESTAMPADD(MINUTE, -10, CURRENT_TIMESTAMP), 60, 'Parking Gare', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  
  -- IJ-789-KL : Arrivé il y a 15 min, payé 90 min → Reste 75 min (NORMAL)
  ('res-003', 'IJ-789-KL', 'MOTORCYCLE', TIMESTAMPADD(MINUTE, -15, CURRENT_TIMESTAMP), 90, 'Parking Mairie', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- ---------------------------------------------------------------
-- 2. Véhicules EN EXCÈS LÉGER (2) - Dépassement 5-20 minutes
-- ---------------------------------------------------------------
INSERT INTO reservations (id, licence_plate, vehicle_type, start_at, duration_minutes, address, status, created_at, updated_at) 
VALUES 
  -- MN-111-OP : Arrivé il y a 70 min, payé 60 min → Excès 10 min (LÉGER)
  ('res-004', 'MN-111-OP', 'CAR', TIMESTAMPADD(MINUTE, -70, CURRENT_TIMESTAMP), 60, 'Parking Centre Ville', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  
  -- QR-222-ST : Arrivé il y a 140 min, payé 120 min → Excès 20 min (LÉGER)
  ('res-005', 'QR-222-ST', 'CAR', TIMESTAMPADD(MINUTE, -140, CURRENT_TIMESTAMP), 120, 'Parking République', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- ---------------------------------------------------------------
-- 3. Véhicules EN EXCÈS MODÉRÉ (2) - Dépassement 21-60 minutes
-- ---------------------------------------------------------------
INSERT INTO reservations (id, licence_plate, vehicle_type, start_at, duration_minutes, address, status, created_at, updated_at) 
VALUES 
  -- UV-333-WX : Arrivé il y a 120 min, payé 90 min → Excès 30 min (MODÉRÉ)
  ('res-006', 'UV-333-WX', 'MOTORCYCLE', TIMESTAMPADD(MINUTE, -120, CURRENT_TIMESTAMP), 90, 'Parking Gare', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  
  -- YZ-444-AB : Arrivé il y a 90 min, payé 45 min → Excès 45 min (MODÉRÉ)
  ('res-007', 'YZ-444-AB', 'ELECTRIC_SCOOTER', TIMESTAMPADD(MINUTE, -90, CURRENT_TIMESTAMP), 45, 'Parking Liberté', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- ---------------------------------------------------------------
-- 4. Véhicules EN EXCÈS GRAVE (1) - Dépassement > 60 minutes
-- ---------------------------------------------------------------
INSERT INTO reservations (id, licence_plate, vehicle_type, start_at, duration_minutes, address, status, created_at, updated_at) 
VALUES 
  -- CD-555-EF : Arrivé il y a 195 min, payé 120 min → Excès 75 min (GRAVE)
  ('res-008', 'CD-555-EF', 'CAR', TIMESTAMPADD(MINUTE, -195, CURRENT_TIMESTAMP), 120, 'Parking Centre Ville', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- ---------------------------------------------------------------
-- 5. Véhicules SIGNALÉS (2) - Déjà repérés par un agent
-- ---------------------------------------------------------------
INSERT INTO reservations (id, licence_plate, vehicle_type, start_at, duration_minutes, address, status, created_at, updated_at) 
VALUES 
  -- GH-666-IJ : Arrivé il y a 155 min, payé 120 min → Excès 35 min, SIGNALÉ
  ('res-009', 'GH-666-IJ', 'CAR', TIMESTAMPADD(MINUTE, -155, CURRENT_TIMESTAMP), 120, 'Parking République', 'SIGNALE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  
  -- KL-777-MN : Arrivé il y a 180 min, payé 90 min → Excès 90 min, SIGNALÉ
  ('res-010', 'KL-777-MN', 'CAR', TIMESTAMPADD(MINUTE, -180, CURRENT_TIMESTAMP), 90, 'Parking Gare', 'SIGNALE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- ================================================================================================
-- HISTORIQUE (5 véhicules régularisés)
-- ================================================================================================
INSERT INTO reservations (id, licence_plate, vehicle_type, start_at, duration_minutes, address, status, created_at, updated_at) 
VALUES 
  -- Véhicules qui ont quitté le parking aujourd'hui
  ('res-011', 'NO-111-PQ', 'CAR', TIMESTAMPADD(HOUR, -5, CURRENT_TIMESTAMP), 120, 'Parking Centre Ville', 'COMPLETED', CURRENT_TIMESTAMP, TIMESTAMPADD(HOUR, -3, CURRENT_TIMESTAMP)),
  ('res-012', 'RS-222-TU', 'MOTORCYCLE', TIMESTAMPADD(HOUR, -8, CURRENT_TIMESTAMP), 60, 'Parking Gare', 'COMPLETED', CURRENT_TIMESTAMP, TIMESTAMPADD(HOUR, -7, CURRENT_TIMESTAMP)),
  ('res-013', 'VW-333-XY', 'CAR', TIMESTAMPADD(HOUR, -6, CURRENT_TIMESTAMP), 90, 'Parking République', 'COMPLETED', CURRENT_TIMESTAMP, TIMESTAMPADD(HOUR, -4, CURRENT_TIMESTAMP)),
  ('res-014', 'ZA-444-BC', 'CAR', TIMESTAMPADD(HOUR, -4, CURRENT_TIMESTAMP), 120, 'Parking Liberté', 'COMPLETED', CURRENT_TIMESTAMP, TIMESTAMPADD(HOUR, -2, CURRENT_TIMESTAMP)),
  ('res-015', 'DE-555-FG', 'BICYCLE', TIMESTAMPADD(HOUR, -7, CURRENT_TIMESTAMP), 60, 'Parking Mairie', 'COMPLETED', CURRENT_TIMESTAMP, TIMESTAMPADD(HOUR, -6, CURRENT_TIMESTAMP));

-- ================================================================================================
-- RÉSUMÉ ATTENDU
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



