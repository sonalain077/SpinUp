-- Données de test pour Park & See - Contrôle des excès de temps
-- Ces données seront chargées automatiquement au démarrage de l'application

-- Note: Les colonnes doivent correspondre exactement à ReservationEntity
-- Colonnes: id, licence_plate, vehicle_type, start_at, duration_minutes, address, status, created_at, updated_at

-- Réservations actives en cours (non dépassées)
INSERT INTO reservations (id, licence_plate, vehicle_type, start_at, duration_minutes, address, status, created_at, updated_at) 
VALUES 
  ('res-001', 'AB-123-CD', 'CAR', TIMESTAMPADD(MINUTE, -30, CURRENT_TIMESTAMP), 120, 'Parking Centre Ville', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('res-002', 'EF-456-GH', 'CAR', TIMESTAMPADD(MINUTE, -15, CURRENT_TIMESTAMP), 60, 'Parking Gare', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('res-003', 'IJ-789-KL', 'MOTORCYCLE', TIMESTAMPADD(MINUTE, -20, CURRENT_TIMESTAMP), 60, 'Parking Mairie', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Réservations dépassées (overdue) - Léger dépassement (5-15 min)
INSERT INTO reservations (id, licence_plate, vehicle_type, start_at, duration_minutes, address, status, created_at, updated_at) 
VALUES 
  ('res-004', 'MN-111-OP', 'CAR', TIMESTAMPADD(MINUTE, -75, CURRENT_TIMESTAMP), 60, 'Parking Centre Ville', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('res-005', 'QR-222-ST', 'CAR', TIMESTAMPADD(MINUTE, -125, CURRENT_TIMESTAMP), 120, 'Parking République', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('res-006', 'UV-333-WX', 'MOTORCYCLE', TIMESTAMPADD(MINUTE, -95, CURRENT_TIMESTAMP), 90, 'Parking Gare', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Réservations dépassées (overdue) - Dépassement modéré (15-30 min)
INSERT INTO reservations (id, licence_plate, vehicle_type, start_at, duration_minutes, address, status, created_at, updated_at) 
VALUES 
  ('res-007', 'YZ-444-AB', 'CAR', TIMESTAMPADD(MINUTE, -110, CURRENT_TIMESTAMP), 90, 'Parking Cathédrale', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('res-008', 'CD-555-EF', 'CAR', TIMESTAMPADD(MINUTE, -150, CURRENT_TIMESTAMP), 120, 'Parking Liberté', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('res-009', 'GH-666-IJ', 'ELECTRIC_SCOOTER', TIMESTAMPADD(MINUTE, -85, CURRENT_TIMESTAMP), 60, 'Parking Centre Ville', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Réservations dépassées (overdue) - Dépassement sévère (30+ min)
INSERT INTO reservations (id, licence_plate, vehicle_type, start_at, duration_minutes, address, status, created_at, updated_at) 
VALUES 
  ('res-010', 'KL-777-MN', 'CAR', TIMESTAMPADD(MINUTE, -180, CURRENT_TIMESTAMP), 120, 'Parking Gare', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('res-011', 'OP-888-QR', 'CAR', TIMESTAMPADD(MINUTE, -220, CURRENT_TIMESTAMP), 150, 'Parking République', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('res-012', 'ST-999-UV', 'MOTORCYCLE', TIMESTAMPADD(MINUTE, -170, CURRENT_TIMESTAMP), 120, 'Parking Mairie', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('res-013', 'WX-000-YZ', 'CAR', TIMESTAMPADD(MINUTE, -260, CURRENT_TIMESTAMP), 180, 'Parking Centre Ville', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Réservations déjà marquées comme OVERDUE
INSERT INTO reservations (id, licence_plate, vehicle_type, start_at, duration_minutes, address, status, created_at, updated_at) 
VALUES 
  ('res-014', 'AA-111-BB', 'CAR', TIMESTAMPADD(MINUTE, -240, CURRENT_TIMESTAMP), 120, 'Parking Cathédrale', 'OVERDUE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('res-015', 'CC-222-DD', 'MOTORCYCLE', TIMESTAMPADD(MINUTE, -200, CURRENT_TIMESTAMP), 90, 'Parking Gare', 'OVERDUE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Réservations terminées normalement (pas de dépassement)
INSERT INTO reservations (id, licence_plate, vehicle_type, start_at, duration_minutes, address, status, created_at, updated_at) 
VALUES 
  ('res-016', 'EE-333-FF', 'CAR', TIMESTAMPADD(HOUR, -5, CURRENT_TIMESTAMP), 120, 'Parking Liberté', 'COMPLETED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('res-017', 'GG-444-HH', 'CAR', TIMESTAMPADD(HOUR, -8, CURRENT_TIMESTAMP), 60, 'Parking Centre Ville', 'COMPLETED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('res-018', 'II-555-JJ', 'BICYCLE', TIMESTAMPADD(HOUR, -4, CURRENT_TIMESTAMP), 120, 'Parking Mairie', 'COMPLETED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Réservations annulées
INSERT INTO reservations (id, licence_plate, vehicle_type, start_at, duration_minutes, address, status, created_at, updated_at) 
VALUES 
  ('res-019', 'KK-666-LL', 'CAR', TIMESTAMPADD(HOUR, -2, CURRENT_TIMESTAMP), 60, 'Parking Gare', 'CANCELLED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('res-020', 'MM-777-NN', 'MOTORCYCLE', TIMESTAMPADD(HOUR, -6, CURRENT_TIMESTAMP), 60, 'Parking République', 'CANCELLED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
