const produkModel = require('../models/produkModel');
const config = require('../config/config');

// GET /api/produk  -> JSON
const getProdukApi = (req, res) => {
  res.json(produkModel.getAll());
};

// GET /  -> halaman EJS dengan data dari model
const tampilkanHalaman = (req, res) => {
  res.render('index', {
    title: config.appName,
    tagline: config.tagline,
    produk: produkModel.getAll(),
  });
};

module.exports = { getProdukApi, tampilkanHalaman };
