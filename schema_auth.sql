-- ==========================================================
-- Tambahan schema (login 3 role, pesanan, FAQ, log chat, eskalasi, rating)
-- Jalankan SETELAH schema.sql. Aman dijalankan berulang (tidak ada DROP).
-- ==========================================================
USE `db_chatbot_paw`;

CREATE TABLE IF NOT EXISTS `pengguna` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `nama` VARCHAR(100) NOT NULL,
  `email` VARCHAR(120) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `role` ENUM('pelanggan','admin','manager') NOT NULL DEFAULT 'pelanggan',
  `dibuat` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `pesanan` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `nomor_pesanan` VARCHAR(30) NOT NULL UNIQUE,
  `pengguna_id` INT NOT NULL,
  `produk_id` INT NULL,
  `nama_produk` VARCHAR(100) NOT NULL,
  `jumlah` INT NOT NULL,
  `total` INT NOT NULL,
  `status` VARCHAR(30) NOT NULL DEFAULT 'Diproses',
  `estimasi_tiba` DATE NULL,
  `dibuat` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`pengguna_id`) REFERENCES `pengguna`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `faq` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `pertanyaan` VARCHAR(255) NOT NULL,
  `kata_kunci` VARCHAR(255) NOT NULL,
  `jawaban` TEXT NOT NULL,
  `aktif` TINYINT(1) NOT NULL DEFAULT 1,
  `diperbarui` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `percakapan` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `pengguna_id` INT NOT NULL,
  `status` ENUM('aktif','selesai') NOT NULL DEFAULT 'aktif',
  `rating` TINYINT NULL,
  `dibuat` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `selesai_pada` TIMESTAMP NULL DEFAULT NULL,
  FOREIGN KEY (`pengguna_id`) REFERENCES `pengguna`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `pesan_chat` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `percakapan_id` INT NOT NULL,
  `pengirim` ENUM('user','bot','staf') NOT NULL,
  `isi` TEXT NOT NULL,
  `waktu_respons_ms` INT NULL,
  `gagal` TINYINT(1) NOT NULL DEFAULT 0,
  `dibuat` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`percakapan_id`) REFERENCES `percakapan`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `eskalasi` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `percakapan_id` INT NOT NULL,
  `pengguna_id` INT NOT NULL,
  `status` ENUM('Menunggu','Selesai') NOT NULL DEFAULT 'Menunggu',
  `balasan_staf` TEXT NULL,
  `dibuat` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `ditangani_pada` TIMESTAMP NULL DEFAULT NULL,
  FOREIGN KEY (`percakapan_id`) REFERENCES `percakapan`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`pengguna_id`) REFERENCES `pengguna`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
