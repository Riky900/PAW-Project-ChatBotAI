const express = require('express');
const router = express.Router();
const { getStatus } = require('../controllers/statusController');
const { getProdukApi } = require('../controllers/produkController');
const { kirimPesan } = require('../controllers/chatController');

router.get('/status', getStatus);
router.get('/produk', getProdukApi);
router.post('/chat', kirimPesan); // tambahan: endpoint chatbot

module.exports = router;
