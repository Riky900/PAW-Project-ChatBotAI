// Halaman per role: pelanggan, admin, manager
const express = require('express');
const router = express.Router();
const { requireRole } = require('../middlewares/auth');
const p = require('../controllers/panelController');

// Pelanggan
router.get('/pesanan', requireRole('pelanggan'), p.halamanPesanan);
router.post('/pesanan', requireRole('pelanggan'), p.buatPesanan);

// Admin
router.get('/admin', requireRole('admin'), p.halamanAdmin);
router.post('/admin/faq', requireRole('admin'), p.tambahFaq);
router.post('/admin/faq/:id', requireRole('admin'), p.ubahFaq);
router.post('/admin/faq/:id/hapus', requireRole('admin'), p.hapusFaq);
router.post('/admin/pesanan', requireRole('admin'), p.tambahPesananAdmin);
router.post('/admin/pesanan/:id/status', requireRole('admin'), p.ubahStatusPesanan);
router.get('/admin/eskalasi/:id', requireRole('admin'), p.detailEskalasi);
router.post('/admin/eskalasi/:id', requireRole('admin'), p.balasEskalasi);

// Manager
router.get('/manager', requireRole('manager'), p.dashboardManager);

module.exports = router;
