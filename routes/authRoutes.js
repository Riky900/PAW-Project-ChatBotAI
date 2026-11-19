// Halaman pertama: login / daftar
const express = require('express');
const router = express.Router();
const auth = require('../controllers/authController');

router.get('/', auth.halamanLogin);
router.get('/masuk', auth.halamanLogin);
router.post('/masuk', auth.prosesLogin);
router.post('/daftar', auth.prosesDaftar);
router.get('/keluar', auth.keluar);

module.exports = router;
