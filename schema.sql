-- ==========================================================
-- Database Schema untuk Proyek PAW - ChatBot AI Store
-- ==========================================================

CREATE DATABASE IF NOT EXISTS `db_chatbot_paw`
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `db_chatbot_paw`;

-- Hapus tabel jika sudah ada (untuk reset ulang)
DROP TABLE IF EXISTS `produk`;

-- Buat tabel produk
CREATE TABLE `produk` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `gambar` VARCHAR(255) NOT NULL,
  `nama` VARCHAR(100) NOT NULL,
  `kategori` VARCHAR(50) NOT NULL,
  `harga` INT NOT NULL,
  `stok` INT NOT NULL,
  `deskripsi` TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Isi data awal produk
INSERT INTO `produk` (`gambar`, `nama`, `kategori`, `harga`, `stok`, `deskripsi`) VALUES
('/images/headset.svg', 'Headset Bluetooth', 'Audio', 250000, 20, 'Headset nirkabel dengan kualitas suara jernih, bass mendalam, dan baterai tahan hingga 12 jam pemakaian.'),
('/images/keyboard.svg', 'Keyboard Mechanical', 'Komputer', 450000, 15, 'Keyboard gaming dengan blue switch responsif, lampu backlight RGB, dan desain ergonomis yang nyaman untuk mengetik lama.'),
('/images/mouse.svg', 'Mouse Wireless', 'Komputer', 150000, 40, 'Mouse tanpa kabel dengan sensor optik presisi tinggi, klik senyap (silent click), dan koneksi stabil hingga jarak 10 meter.'),
('/images/powerbank.svg', 'Power Bank 10000mAh', 'Aksesoris', 180000, 30, 'Power bank kapasitas besar 10.000mAh dengan dukungan fast charging 22.5W dan dual port USB-A serta Type-C.'),
('/images/webcam.svg', 'Webcam Full HD', 'Komputer', 320000, 12, 'Webcam resolusi 1080p 30fps dilengkapi mikrofon noise-cancelling bawaan dan fitur auto low-light correction.');