-- Données de test pour les réservations de parking
-- Format: id, licence_plate, vehicle_type, start_at, duration_minutes, address, created_at

-- Réservations actives avec dépassement (10 véhicules en excès)
INSERT INTO reservations (id, licence_plate, vehicle_type, start_at, duration_minutes, address, created_at) 
VALUES ('res-001', 'AB-123-CD', 'CAR', TIMESTAMPADD(MINUTE, -90, CURRENT_TIMESTAMP), 60, 'Parking Centre Ville', CURRENT_TIMESTAMP);

INSERT INTO reservations (id, licence_plate, vehicle_type, start_at, duration_minutes, address, created_at) 
VALUES ('res-002', 'EF-456-GH', 'CAR', TIMESTAMPADD(MINUTE, -80, CURRENT_TIMESTAMP), 60, 'Parking Gare', CURRENT_TIMESTAMP);

INSERT INTO reservations (id, licence_plate, vehicle_type, start_at, duration_minutes, address, created_at) 
VALUES ('res-003', 'IJ-789-KL', 'MOTORCYCLE', TIMESTAMPADD(MINUTE, -95, CURRENT_TIMESTAMP), 60, 'Parking Mairie', CURRENT_TIMESTAMP);

INSERT INTO reservations (id, licence_plate, vehicle_type, start_at, duration_minutes, address, created_at) 
VALUES ('res-004', 'MN-012-OP', 'CAR', TIMESTAMPADD(MINUTE, -75, CURRENT_TIMESTAMP), 60, 'Parking Centre Ville', CURRENT_TIMESTAMP);

INSERT INTO reservations (id, licence_plate, vehicle_type, start_at, duration_minutes, address, created_at) 
VALUES ('res-005', 'QR-345-ST', 'VAN', TIMESTAMPADD(MINUTE, -120, CURRENT_TIMESTAMP), 90, 'Parking Stade', CURRENT_TIMESTAMP);

INSERT INTO reservations (id, licence_plate, vehicle_type, start_at, duration_minutes, address, created_at) 
VALUES ('res-006', 'UV-678-WX', 'CAR', TIMESTAMPADD(MINUTE, -65, CURRENT_TIMESTAMP), 30, 'Parking Gare', CURRENT_TIMESTAMP);

INSERT INTO reservations (id, licence_plate, vehicle_type, start_at, duration_minutes, address, created_at) 
VALUES ('res-007', 'YZ-901-AB', 'MOTORCYCLE', TIMESTAMPADD(MINUTE, -100, CURRENT_TIMESTAMP), 60, 'Parking Mairie', CURRENT_TIMESTAMP);

INSERT INTO reservations (id, licence_plate, vehicle_type, start_at, duration_minutes, address, created_at) 
VALUES ('res-008', 'CD-234-EF', 'CAR', TIMESTAMPADD(MINUTE, -85, CURRENT_TIMESTAMP), 60, 'Parking Centre Ville', CURRENT_TIMESTAMP);

INSERT INTO reservations (id, licence_plate, vehicle_type, start_at, duration_minutes, address, created_at) 
VALUES ('res-009', 'GH-567-IJ', 'TRUCK', TIMESTAMPADD(MINUTE, -150, CURRENT_TIMESTAMP), 120, 'Parking Industriel', CURRENT_TIMESTAMP);

INSERT INTO reservations (id, licence_plate, vehicle_type, start_at, duration_minutes, address, created_at) 
VALUES ('res-010', 'KL-890-MN', 'CAR', TIMESTAMPADD(MINUTE, -70, CURRENT_TIMESTAMP), 30, 'Parking Stade', CURRENT_TIMESTAMP);

-- Réservations actives SANS dépassement (3 véhicules OK)
INSERT INTO reservations (id, licence_plate, vehicle_type, start_at, duration_minutes, address, created_at) 
VALUES ('res-011', 'OP-123-QR', 'CAR', TIMESTAMPADD(MINUTE, -15, CURRENT_TIMESTAMP), 60, 'Parking Gare', CURRENT_TIMESTAMP);

INSERT INTO reservations (id, licence_plate, vehicle_type, start_at, duration_minutes, address, created_at) 
VALUES ('res-012', 'ST-456-UV', 'MOTORCYCLE', TIMESTAMPADD(MINUTE, -10, CURRENT_TIMESTAMP), 30, 'Parking Mairie', CURRENT_TIMESTAMP);

INSERT INTO reservations (id, licence_plate, vehicle_type, start_at, duration_minutes, address, created_at) 
VALUES ('res-013', 'WX-789-YZ', 'VAN', TIMESTAMPADD(MINUTE, -5, CURRENT_TIMESTAMP), 120, 'Parking Centre Ville', CURRENT_TIMESTAMP);
