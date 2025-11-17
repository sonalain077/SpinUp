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
--   - Parking Mairie : 1 véhicule (IJ-789-KL)
--
-- KPI Excès :
--   - En excès maintenant : 5 (ACTIVE avec dépassement)
--   - Déjà signalés : 2
--   - Régularisés : 5
--   - Durée moyenne excès : ~44 min (10+20+30+45+75) / 5 = 36 min + signalés
-- ================================================================================================



