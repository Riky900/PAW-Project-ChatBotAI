// Endpoint chat tambahan. Dipasang SEBELUM apiRoutes sehingga POST /api/chat memakai versi lengkap
// (status pesanan + FAQ + AI), sedangkan file routes lama tetap tidak diubah.
const express = require('express');
const router = express.Router();
const validateChatInput = require('../middlewares/validateChatInput');
const { requireRole } = require('../middlewares/auth');
const chat = require('../controllers/chatCerdasController');

router.get('/saya', chat.saya);
router.post('/chat', validateChatInput, chat.kirimPesanCerdas);
router.post('/chat/eskalasi', requireRole('pelanggan'), chat.hubungiStaf);
router.post('/chat/rating', requireRole('pelanggan'), chat.beriRating);

module.exports = router;
