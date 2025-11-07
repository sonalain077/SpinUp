-- Table des parkings
CREATE TABLE IF NOT EXISTS parkings (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address VARCHAR(500) NOT NULL,
    total_spots INTEGER NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Données de test : 6 parkings
INSERT INTO parkings (id, name, address, total_spots, created_at, updated_at) VALUES
('park-001', 'Parking Centre-Ville', '10 Rue de la République', 150, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('park-002', 'Parking Gare Nord', '25 Avenue de la Gare', 200, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('park-003', 'Parking République', '5 Place de la République', 100, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('park-004', 'Parking Hôtel de Ville', '15 Rue du Maire', 80, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('park-005', 'Parking Cité Judiciaire', '30 Boulevard des Tribunaux', 120, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('park-006', 'Parking des Arts', '8 Avenue des Artistes', 90, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
