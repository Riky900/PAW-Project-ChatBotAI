// Statistik layanan chatbot untuk dashboard manager (metrik M-01, M-02, M-04, M-05)
const db = require('../config/database');

const persen = (a, b) => (Number(b) > 0 ? Math.round((Number(a) / Number(b)) * 1000) / 10 : null);

const ringkas = async (hari) => {
  const h = Number(hari);
  const sejak = h > 0 ? new Date(Date.now() - h * 24 * 3600 * 1000) : new Date(0);

  const [respRows] = await db.query(
    `SELECT AVG(pc.waktu_respons_ms) AS rata_ms, COUNT(*) AS jumlah
     FROM pesan_chat pc JOIN percakapan c ON c.id = pc.percakapan_id
     WHERE pc.pengirim = 'bot' AND pc.waktu_respons_ms IS NOT NULL AND c.dibuat >= ?`, [sejak]);

  const [ratingRows] = await db.query(
    `SELECT COUNT(rating) AS jumlah, COALESCE(SUM(rating >= 4), 0) AS puas, AVG(rating) AS rata
     FROM percakapan WHERE rating IS NOT NULL AND dibuat >= ?`, [sejak]);

  const [konvRows] = await db.query(
    `SELECT COUNT(*) AS total,
            COALESCE(SUM(CASE WHEN pesan_user >= 2 THEN 1 ELSE 0 END), 0) AS terlibat,
            COALESCE(SUM(CASE WHEN eskalasi = 0 THEN 1 ELSE 0 END), 0) AS tanpa_eskalasi,
            COALESCE(SUM(CASE WHEN eskalasi > 0 THEN 1 ELSE 0 END), 0) AS jumlah_eskalasi
     FROM (
       SELECT c.id,
         (SELECT COUNT(*) FROM pesan_chat p WHERE p.percakapan_id = c.id AND p.pengirim = 'user') AS pesan_user,
         (SELECT COUNT(*) FROM eskalasi e WHERE e.percakapan_id = c.id) AS eskalasi
       FROM percakapan c WHERE c.dibuat >= ?
     ) t`, [sejak]);

  const [pesanRows] = await db.query(
    `SELECT COUNT(*) AS total FROM pesan_chat pc JOIN percakapan c ON c.id = pc.percakapan_id
     WHERE pc.pengirim = 'user' AND c.dibuat >= ?`, [sejak]);

  const [harian] = await db.query(
    `SELECT DATE_FORMAT(c.dibuat, '%d/%m/%Y') AS tanggal, COUNT(DISTINCT c.id) AS percakapan,
            AVG(pc.waktu_respons_ms) AS rata_ms
     FROM percakapan c LEFT JOIN pesan_chat pc ON pc.percakapan_id = c.id AND pc.pengirim = 'bot'
     WHERE c.dibuat >= ? GROUP BY DATE(c.dibuat), DATE_FORMAT(c.dibuat, '%d/%m/%Y')
     ORDER BY DATE(c.dibuat) DESC LIMIT 14`, [sejak]);

  const r = respRows[0], g = ratingRows[0], k = konvRows[0];

  return {
    rataResponsDetik: r.rata_ms == null ? null : Math.round(Number(r.rata_ms) / 100) / 10,
    jumlahJawaban: Number(r.jumlah),
    kepuasanPersen: persen(g.puas, g.jumlah),
    jumlahRating: Number(g.jumlah),
    ratingRata: g.rata == null ? null : Math.round(Number(g.rata) * 10) / 10,
    penyelesaianPersen: persen(k.tanpa_eskalasi, k.total),
    keterlibatanPersen: persen(k.terlibat, k.total),
    totalPercakapan: Number(k.total),
    totalEskalasi: Number(k.jumlah_eskalasi),
    totalPesanPengguna: Number(pesanRows[0].total),
    harian,
  };
};

module.exports = { ringkas };
