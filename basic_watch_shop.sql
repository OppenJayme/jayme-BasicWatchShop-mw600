-- Import this file using phpMyAdmin's Import tab in XAMPP.
CREATE DATABASE IF NOT EXISTS basic_watch_shop
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE basic_watch_shop;

CREATE TABLE IF NOT EXISTS watches (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(150) NOT NULL,
  brand VARCHAR(100) NOT NULL,
  category VARCHAR(100) NOT NULL,
  price DECIMAL(10, 2) UNSIGNED NOT NULL,
  image VARCHAR(2048) NOT NULL,
  description TEXT NOT NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add the website's sample records. Re-importing preserves existing records.
INSERT INTO watches (id, name, brand, category, price, image, description)
VALUES
  (1, 'Classic Leather', 'Timex', 'Classic', 120.00,
   'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=700&q=80',
   'A simple classic watch with a brown leather strap.'),
  (2, 'Silver Sport', 'Casio', 'Sport', 180.00,
   'https://images.unsplash.com/photo-1547996160-81dfa63595aa?auto=format&fit=crop&w=700&q=80',
   'A strong everyday watch with a silver metal band.'),
  (3, 'Gold Edition', 'Fossil', 'Luxury', 350.00,
   'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=700&q=80',
   'An elegant gold watch made for special occasions.')
ON DUPLICATE KEY UPDATE id = watches.id;
