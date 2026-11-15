// routes/apiRoutes.js
const express = require('express');
const router = express.Router();
const { getStatus } = require('../controllers/statusController');
const { getProdukApi } = require('../controllers/produkController');

// Import chatController secara utuh
const chatController = require('../controllers/chatController'); 
const validateChatInput = require('../middlewares/validateChatInput');
const logger = require('../middlewares/logger');

router.get('/status', logger, getStatus);
router.get('/produk', logger, getProdukApi);

// Gunakan chatController.kirimPesan karena di controller namanya kirimPesan
router.post('/chat', logger, validateChatInput, chatController.kirimPesan);

module.exports = router;