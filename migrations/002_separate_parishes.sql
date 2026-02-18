-- Migration: Separate parishes from users, add role column, remove organizations
-- Run with: sudo mariadb -u root survey_profiling < migration_separate_parishes.sql

-- Step 1: Create parishes table
CREATE TABLE IF NOT EXISTS parishes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    diocese VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Step 2: Add role column to users (admin, archdiocese, parish)
ALTER TABLE users ADD COLUMN role ENUM('admin', 'archdiocese', 'parish') DEFAULT 'parish';

-- Step 3: Insert parishes from existing users data
INSERT INTO parishes (name, diocese) VALUES
('St. Padre Pio of Pietrelcina Parish', 'Archdiocese of Tuguegarao'),
('Dana-ili, Immaculate Conception Parish', 'Archdiocese of Tuguegarao'),
('St. Thomas Aquinas Parish', 'Archdiocese of Tuguegarao'),
('St. Philomene Parish', 'Archdiocese of Tuguegarao'),
('Our Lady of Fatima Parish', 'Archdiocese of Tuguegarao'),
('Our Lady of the Most Holy Rosary Parish', 'Archdiocese of Tuguegarao'),
('Cordova, St. Vincent Ferrer Parish', 'Archdiocese of Tuguegarao'),
('St. Peter Gonzales of Thelmo Parish', 'Archdiocese of Tuguegarao'),
('Bukig, Mary, Mother of the Church Parish', 'Archdiocese of Tuguegarao'),
('Centro Baggao, St. Dominic de Guzman Parish', 'Archdiocese of Tuguegarao'),
('San Jose, St. Joseph the Worker Parish and Shrines', 'Archdiocese of Tuguegarao'),
('Tallang, Our Lady of Peace and Good Voyage Parish', 'Archdiocese of Tuguegarao'),
('Holy Cross Parish', 'Archdiocese of Tuguegarao'),
('St. Anne Parish', 'Archdiocese of Tuguegarao'),
('St. Bartholomew Parish', 'Archdiocese of Tuguegarao'),
('St. Hyacinth of Poland Parish', 'Archdiocese of Tuguegarao'),
('Dugo, St. Isidore the Farmer Parish', 'Archdiocese of Tuguegarao'),
('St. Vincent Ferrer Parish (Camiguin)', 'Archdiocese of Tuguegarao'),
('St. Vincent Ferrer Parish (Solana)', 'Archdiocese of Tuguegarao'),
('St. Joseph Parish', 'Archdiocese of Tuguegarao'),
('Our Lady of Snows Parish', 'Archdiocese of Tuguegarao'),
('St. Catherine of Alexandria Parish', 'Archdiocese of Tuguegarao'),
('St. Roch Parish (Gonzaga)', 'Archdiocese of Tuguegarao'),
('San Isidro Labrador Parish Church (Nabaccayan)', 'Archdiocese of Tuguegarao'),
('St. James the Apostle Parish', 'Archdiocese of Tuguegarao'),
('St. Dominic de Guzman Parish', 'Archdiocese of Tuguegarao'),
('Magapit, Our Lady of the Miraculous Medal Parish', 'Archdiocese of Tuguegarao'),
('San Isidro Labrador Parish (Lasam)', 'Archdiocese of Tuguegarao'),
('St. Peter the Martyr Parish', 'Archdiocese of Tuguegarao'),
('St. Dominic de Guzman Parish — Basilica Minore of Our Lady of Piat', 'Archdiocese of Tuguegarao'),
('St. Joseph, Husband of Mary Parish', 'Archdiocese of Tuguegarao'),
('Our Mother of Perpetual Help Parish (Nannarian, Peñablanca)', 'Archdiocese of Tuguegarao'),
('St. Raymund Peñafort Parish', 'Archdiocese of Tuguegarao'),
('Mauanan, St. Francis of Assisi Parish', 'Archdiocese of Tuguegarao'),
('Sto. Niño Parish – Archdiocesan Shrine of Sto. Niño', 'Archdiocese of Tuguegarao'),
('Sto. Niño Parish (Faire)', 'Archdiocese of Tuguegarao'),
('St. Roch Parish (Sanchez Mira)', 'Archdiocese of Tuguegarao'),
('Our Lady of Perpetual Help Parish (Namuac)', 'Archdiocese of Tuguegarao'),
('Holy Family Parish (Gadu, Solana)', 'Archdiocese of Tuguegarao'),
('St. Anthony de Padua Parish', 'Archdiocese of Tuguegarao'),
('Casambalangan, Sts. Peter and Paul Parish', 'Archdiocese of Tuguegarao'),
('San Isidro Labrador Parish (Sta. Praxedes)', 'Archdiocese of Tuguegarao'),
('Sta. Rosa de Lima Parish (under Tuguegarao City)', 'Archdiocese of Tuguegarao'),
('Our Lady of the Angels Parish', 'Archdiocese of Tuguegarao'),
('Holy Guardian Angels Parish', 'Archdiocese of Tuguegarao'),
('Naruangan, San Roque Parish', 'Archdiocese of Tuguegarao'),
('Annafunan, Sta. Rosa de Lima Parish', 'Archdiocese of Tuguegarao'),
('Cataggaman, St. Dominic de Guzman Parish', 'Archdiocese of Tuguegarao'),
('Leonarda, Parish of the Divine Mercy of Our Lord Jesus Christ', 'Archdiocese of Tuguegarao'),
('San Gabriel, Sto. Niño Parish – Archdiocesan Shrine of Sto. Niño', 'Archdiocese of Tuguegarao'),
('St. Peter''s Metropolitan Cathedral', 'Archdiocese of Tuguegarao')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Step 4: Update existing users to have parish role
UPDATE users SET role = 'parish' WHERE role IS NULL OR role = '';

-- Step 5: Add admin user (update existing or insert new)
UPDATE users SET role = 'admin' WHERE username = 'SJCB_Admin';
INSERT INTO users (username, password, role) VALUES ('admin', 'admin123', 'admin')
ON DUPLICATE KEY UPDATE role = 'admin';

-- Step 6: Remove organizations column from socio_economic (now in family_members)
ALTER TABLE socio_economic DROP COLUMN IF EXISTS organizations;
ALTER TABLE socio_economic DROP COLUMN IF EXISTS organizations_others_text;

-- Add organization column to family_members if not exists
ALTER TABLE family_members ADD COLUMN IF NOT EXISTS organization_code TEXT;
