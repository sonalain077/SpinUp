-- Données de test simples pour Park & See
DELETE FROM reservations;

-- Quelques réservations de test avec syntaxe H2 compatible (INSERT séparés)
INSERT INTO reservations (id, licence_plate, vehicle_type, start_at, duration_minutes, address, payment_amount, status, created_at, updated_at) VALUES ('res-001', 'AB-123-CD', 'CAR', DATEADD('MINUTE', -25, CURRENT_TIMESTAMP), 120, 'Parking Centre Ville', 3.00, 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO reservations (id, licence_plate, vehicle_type, start_at, duration_minutes, address, payment_amount, status, created_at, updated_at) VALUES ('res-002', 'EF-456-GH', 'CAR', DATEADD('MINUTE', -10, CURRENT_TIMESTAMP), 60, 'Parking Gare', 1.50, 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO reservations (id, licence_plate, vehicle_type, start_at, duration_minutes, address, payment_amount, status, created_at, updated_at) VALUES ('res-003', 'IJ-789-KL', 'MOTORCYCLE', DATEADD('MINUTE', -15, CURRENT_TIMESTAMP), 90, 'Parking Mairie', 2.25, 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO reservations (id, licence_plate, vehicle_type, start_at, duration_minutes, address, payment_amount, status, created_at, updated_at) VALUES ('res-004', 'MN-111-OP', 'CAR', DATEADD('MINUTE', -70, CURRENT_TIMESTAMP), 60, 'Parking Centre Ville', 1.50, 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO reservations (id, licence_plate, vehicle_type, start_at, duration_minutes, address, payment_amount, status, created_at, updated_at) VALUES ('res-005', 'QR-222-ST', 'CAR', DATEADD('MINUTE', -140, CURRENT_TIMESTAMP), 120, 'Parking République', 3.00, 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO reservations (id, licence_plate, vehicle_type, start_at, duration_minutes, address, payment_amount, status, created_at, updated_at) VALUES ('res-006', 'UV-333-WX', 'MOTORCYCLE', DATEADD('MINUTE', -120, CURRENT_TIMESTAMP), 90, 'Parking Gare', 2.25, 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- ================================================================================================
-- PARKINGS DISPONIBLES (pour référence)
-- ================================================================================================
-- Parking Centre Ville : 40 places
-- Parking Gare : 50 places
-- Parking République : 30 places
-- Parking Liberté : 25 places
-- Parking Mairie : 35 places

-- Données de test supplémentaires (les 6 premières sont déjà insérées ci-dessus)

-- ================================================================================================
-- HISTORIQUE (5 véhicules régularisés)
-- ================================================================================================
INSERT INTO reservations (id, licence_plate, vehicle_type, start_at, duration_minutes, address, payment_amount, status, created_at, updated_at) 
VALUES 
  -- Véhicules qui ont quitté le parking aujourd'hui
  ('res-011', 'NO-111-PQ', 'CAR', DATEADD('HOUR', -4, CURRENT_TIMESTAMP), 120, 'Parking Centre Ville', 3.00, 'COMPLETED', CURRENT_TIMESTAMP, DATEADD('HOUR', -2, CURRENT_TIMESTAMP)),
  ('res-012', 'RS-222-TU', 'MOTORCYCLE', DATEADD('HOUR', -3, CURRENT_TIMESTAMP), 60, 'Parking Gare', 1.50, 'COMPLETED', CURRENT_TIMESTAMP, DATEADD('HOUR', -2, CURRENT_TIMESTAMP)),
  ('res-013', 'VW-333-XY', 'CAR', DATEADD('HOUR', -5, CURRENT_TIMESTAMP), 90, 'Parking République', 2.25, 'COMPLETED', CURRENT_TIMESTAMP, DATEADD('HOUR', -3, CURRENT_TIMESTAMP)),
  ('res-014', 'ZA-444-BC', 'CAR', DATEADD('HOUR', -6, CURRENT_TIMESTAMP), 120, 'Parking Liberté', 3.00, 'COMPLETED', CURRENT_TIMESTAMP, DATEADD('HOUR', -4, CURRENT_TIMESTAMP)),
  ('res-015', 'DE-555-FG', 'BICYCLE', DATEADD('HOUR', -2, CURRENT_TIMESTAMP), 60, 'Parking Mairie', 1.50, 'COMPLETED', CURRENT_TIMESTAMP, DATEADD('HOUR', -1, CURRENT_TIMESTAMP));

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



