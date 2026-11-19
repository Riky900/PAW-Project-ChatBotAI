const crypto = require('crypto');
const db = require('../config/database');

const STATUS = ['Menunggu Pembayaran', 'Diproses', 'Dikirim', 'Selesai', 'Dibatalkan'];

// Buat pesanan + kurangi stok produk (dalam satu transaksi). Mengembalikan nomor pesanan.
const create = async ({ penggunaId, produkId, jumlah }) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const [rows] = await conn.query('SELECT * FROM produk WHERE id = ? FOR UPDATE', [Number(produkId)]);
    const produk = rows[0];
    if (!produk) throw new Error('Produk tidak ditemukan.');
    const qty = Number(jumlah);
    if (!Number.isInteger(qty) || qty < 1) throw new Error('Jumlah tidak valid.');
    if (produk.stok < qty) throw new Error('Stok tidak mencukupi (tersisa ' + produk.stok + ').');

    const estimasi = new Date(Date.now() + 3 * 24 * 3600 * 1000).toISOString().slice(0, 10);
    const [r] = await conn.query(
      'INSERT INTO pesanan (nomor_pesanan, pengguna_id, produk_id, nama_produk, jumlah, total, status, estimasi_tiba) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      ['TMP-' + crypto.randomBytes(4).toString('hex'), Number(penggunaId), produk.id, produk.nama, qty, produk.harga * qty, 'Diproses', estimasi]
    );
    const nomor = 'ORD-' + (1000 + r.insertId);
    await conn.query('UPDATE pesanan SET nomor_pesanan = ? WHERE id = ?', [nomor, r.insertId]);
    await conn.query('UPDATE produk SET stok = stok - ? WHERE id = ?', [qty, produk.id]);
    await conn.commit();
    return nomor;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

const listByUser = async (penggunaId) => {
  const [rows] = await db.query('SELECT * FROM pesanan WHERE pengguna_id = ? ORDER BY id DESC', [Number(penggunaId)]);
  return rows;
};

// Hanya mengembalikan pesanan milik pengguna tsb (data pelanggan lain tidak boleh bocor)
const findForUser = async (nomor, penggunaId) => {
  const [rows] = await db.query(
    'SELECT * FROM pesanan WHERE nomor_pesanan = ? AND pengguna_id = ?',
    [String(nomor).toUpperCase().trim(), Number(penggunaId)]
  );
  return rows[0];
};

const listAll = async () => {
  const [rows] = await db.query(
    'SELECT p.*, u.nama AS nama_pelanggan, u.email FROM pesanan p JOIN pengguna u ON u.id = p.pengguna_id ORDER BY p.id DESC'
  );
  return rows;
};

const updateStatus = async (id, status, estimasi) => {
  if (!STATUS.includes(status)) throw new Error('Status tidak valid.');
  await db.query('UPDATE pesanan SET status = ?, estimasi_tiba = ? WHERE id = ?', [status, estimasi || null, Number(id)]);
};

module.exports = { STATUS, create, listByUser, findForUser, listAll, updateStatus };
