const db = require('../config/database');

const getAll = async () => {
  const [rows] = await db.query('SELECT * FROM faq ORDER BY id DESC');
  return rows;
};

const create = async ({ pertanyaan, kata_kunci, jawaban, aktif }) => {
  const [r] = await db.query(
    'INSERT INTO faq (pertanyaan, kata_kunci, jawaban, aktif) VALUES (?, ?, ?, ?)',
    [pertanyaan, kata_kunci, jawaban, aktif ? 1 : 0]
  );
  return r.insertId;
};

const update = async (id, { pertanyaan, kata_kunci, jawaban, aktif }) => {
  await db.query(
    'UPDATE faq SET pertanyaan = ?, kata_kunci = ?, jawaban = ?, aktif = ? WHERE id = ?',
    [pertanyaan, kata_kunci, jawaban, aktif ? 1 : 0, Number(id)]
  );
};

const remove = async (id) => {
  await db.query('DELETE FROM faq WHERE id = ?', [Number(id)]);
};

// Cari FAQ aktif yang paling cocok dengan teks pengguna (berdasarkan kata kunci)
const cari = async (teks) => {
  const t = String(teks || '').toLowerCase().trim();
  const [rows] = await db.query('SELECT * FROM faq WHERE aktif = 1');
  let terbaik = null;
  let skorTerbaik = 0;
  rows.forEach((f) => {
    const kunci = String(f.kata_kunci || '').toLowerCase().split(',').map((s) => s.trim()).filter((s) => s.length >= 3);
    let skor = kunci.filter((k) => t.includes(k)).length;
    if (String(f.pertanyaan).toLowerCase().trim() === t) skor += 5;
    if (skor > skorTerbaik) { skorTerbaik = skor; terbaik = f; }
  });
  return terbaik;
};

module.exports = { getAll, create, update, remove, cari };
