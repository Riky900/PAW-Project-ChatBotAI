const db = require('../config/database');

const getAll = async () => {
  const [rows] = await db.query('SELECT * FROM produk ORDER BY id DESC');
  return rows;
};

const getById = async (id) => {
  const [rows] = await db.query('SELECT * FROM produk WHERE id = ?', [Number(id)]);
  return rows[0];
};

const cariDalamTeks = async (teks) => {
  const produk = await getAll();
  const t = teks.toLowerCase();
  return produk.find((p) => t.includes(p.nama.toLowerCase())) ||
    produk.find((p) => p.nama.toLowerCase().split(' ').some((kata) => kata.length > 4 && t.includes(kata)));
};

const create = async ({ gambar, nama, kategori, harga, stok, deskripsi }) => {
  const [result] = await db.query(
    'INSERT INTO produk (gambar, nama, kategori, harga, stok, deskripsi) VALUES (?, ?, ?, ?, ?, ?)',
    [gambar || '/images/headset.svg', nama, kategori, Number(harga), Number(stok), deskripsi]
  );
  return result.insertId;
};

const update = async (id, { gambar, nama, kategori, harga, stok, deskripsi }) => {
  await db.query(
    'UPDATE produk SET gambar = ?, nama = ?, kategori = ?, harga = ?, stok = ?, deskripsi = ? WHERE id = ?',
    [gambar || '/images/headset.svg', nama, kategori, Number(harga), Number(stok), deskripsi, Number(id)]
  );
};

const remove = async (id) => {
  await db.query('DELETE FROM produk WHERE id = ?', [Number(id)]);
};

module.exports = { getAll, getById, cariDalamTeks, create, update, remove };