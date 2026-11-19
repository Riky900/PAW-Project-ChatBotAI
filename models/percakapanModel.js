// Log percakapan chatbot, eskalasi ke staf, dan rating kepuasan
const db = require('../config/database');

const aktifAtauBaru = async (penggunaId) => {
  const [rows] = await db.query(
    "SELECT id FROM percakapan WHERE pengguna_id = ? AND status = 'aktif' ORDER BY id DESC LIMIT 1",
    [Number(penggunaId)]
  );
  if (rows[0]) return rows[0].id;
  const [r] = await db.query('INSERT INTO percakapan (pengguna_id) VALUES (?)', [Number(penggunaId)]);
  return r.insertId;
};

const aktifSaja = async (penggunaId) => {
  const [rows] = await db.query(
    "SELECT id FROM percakapan WHERE pengguna_id = ? AND status = 'aktif' ORDER BY id DESC LIMIT 1",
    [Number(penggunaId)]
  );
  return rows[0] ? rows[0].id : null;
};

const tambahPesan = async (percakapanId, pengirim, isi, ms = null, gagal = false) => {
  await db.query(
    'INSERT INTO pesan_chat (percakapan_id, pengirim, isi, waktu_respons_ms, gagal) VALUES (?, ?, ?, ?, ?)',
    [percakapanId, pengirim, String(isi).slice(0, 4000), ms, gagal ? 1 : 0]
  );
};

// Berapa jawaban bot gagal berturut-turut di akhir percakapan
const gagalBeruntun = async (percakapanId) => {
  const [rows] = await db.query(
    "SELECT gagal FROM pesan_chat WHERE percakapan_id = ? AND pengirim = 'bot' ORDER BY id DESC LIMIT 5",
    [percakapanId]
  );
  let n = 0;
  for (const r of rows) { if (r.gagal) n++; else break; }
  return n;
};

const riwayat = async (percakapanId) => {
  const [rows] = await db.query('SELECT * FROM pesan_chat WHERE percakapan_id = ? ORDER BY id ASC', [percakapanId]);
  return rows;
};

// ----- Eskalasi -----
const buatEskalasi = async (percakapanId, penggunaId) => {
  const [ada] = await db.query(
    "SELECT id FROM eskalasi WHERE percakapan_id = ? AND status = 'Menunggu' LIMIT 1",
    [percakapanId]
  );
  if (ada[0]) return ada[0].id;
  const [r] = await db.query('INSERT INTO eskalasi (percakapan_id, pengguna_id) VALUES (?, ?)', [percakapanId, Number(penggunaId)]);
  return r.insertId;
};

const listEskalasi = async () => {
  const [rows] = await db.query(
    'SELECT e.*, u.nama AS nama_pelanggan, u.email FROM eskalasi e JOIN pengguna u ON u.id = e.pengguna_id ORDER BY (e.status = \'Menunggu\') DESC, e.id DESC'
  );
  return rows;
};

const eskalasiById = async (id) => {
  const [rows] = await db.query(
    'SELECT e.*, u.nama AS nama_pelanggan, u.email FROM eskalasi e JOIN pengguna u ON u.id = e.pengguna_id WHERE e.id = ?',
    [Number(id)]
  );
  return rows[0];
};

const balasEskalasi = async (id, balasan) => {
  const e = await eskalasiById(id);
  if (!e) throw new Error('Eskalasi tidak ditemukan.');
  await db.query(
    "UPDATE eskalasi SET status = 'Selesai', balasan_staf = ?, ditangani_pada = NOW() WHERE id = ?",
    [balasan, Number(id)]
  );
  await tambahPesan(e.percakapan_id, 'staf', balasan);
};

const eskalasiByUser = async (penggunaId) => {
  const [rows] = await db.query('SELECT * FROM eskalasi WHERE pengguna_id = ? ORDER BY id DESC', [Number(penggunaId)]);
  return rows;
};

// ----- Rating (sekaligus menandai percakapan selesai) -----
const beriRating = async (penggunaId, nilai) => {
  const [r] = await db.query(
    "UPDATE percakapan SET rating = ?, status = 'selesai', selesai_pada = NOW() WHERE pengguna_id = ? AND status = 'aktif'",
    [Number(nilai), Number(penggunaId)]
  );
  return r.affectedRows > 0;
};

module.exports = {
  aktifAtauBaru, aktifSaja, tambahPesan, gagalBeruntun, riwayat,
  buatEskalasi, listEskalasi, eskalasiById, balasEskalasi, eskalasiByUser, beriRating,
};
