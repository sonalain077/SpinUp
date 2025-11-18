-- Table des parkings
CREATE TABLE IF NOT EXISTS parkings (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address VARCHAR(500) NOT NULL,
    total_spots INTEGER NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Les données de test sont dans data.sql (exécuté après schema.sql)
-- Ne pas insérer de données ici pour éviter les conflits de clés primaires
