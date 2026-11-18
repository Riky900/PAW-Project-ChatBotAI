const produkModel = require('../models/produkModel');
const config = require('../config/config');

const ADMIN_PASS = 'makkauhijau';

const cekPasswordAdmin = (req, res) => {
  const pass = req.headers['x-admin-password'] || req.body.password;
  if (pass !== ADMIN_PASS) {
    res.status(401).json({ success: false, message: 'Password admin salah!' });
    return false;
  }
  return true;
};

// POST /api/admin/login
const loginAdmin = (req, res) => {
  if (!cekPasswordAdmin(req, res)) return;
  res.json({ success: true, message: 'Login admin berhasil!' });
};

// GET /api/produk -> JSON
const getProdukApi = async (req, res) => {
  try {
    const dataProduk = await produkModel.getAll();
    res.json(dataProduk);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST /api/produk -> Tambah produk
const tambahProdukApi = async (req, res) => {
  if (!cekPasswordAdmin(req, res)) return;
  try {
    const id = await produkModel.create(req.body);
    res.status(201).json({ success: true, id, message: 'Produk berhasil ditambahkan!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/produk/:id -> Edit produk
const editProdukApi = async (req, res) => {
  if (!cekPasswordAdmin(req, res)) return;
  try {
    await produkModel.update(req.params.id, req.body);
    res.json({ success: true, message: 'Produk berhasil diperbarui!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/produk/:id -> Hapus produk
const hapusProdukApi = async (req, res) => {
  if (!cekPasswordAdmin(req, res)) return;
  try {
    await produkModel.remove(req.params.id);
    res.json({ success: true, message: 'Produk berhasil dihapus!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET / -> halaman EJS dengan data dari model
const tampilkanHalaman = async (req, res) => {
  try {
    const dataProduk = await produkModel.getAll();
    res.render('index', {
      title: config.appName,
      tagline: config.tagline,
      produk: dataProduk,
    });
  } catch (error) {
    res.status(500).send('Gagal memuat halaman: ' + error.message);
  }
};

module.exports = {
  getProdukApi,
  tampilkanHalaman,
  loginAdmin,
  tambahProdukApi,
  editProdukApi,
  hapusProdukApi,
};