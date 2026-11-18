// routes/apiRoutes.js
const express = require('express');
const router = express.Router();
const { getStatus } = require('../controllers/statusController');
const {
  getProdukApi,
  loginAdmin,
  tambahProdukApi,
  editProdukApi,
  hapusProdukApi,
} = require('../controllers/produkController');

// Import chatController secara utuh
const chatController = require('../controllers/chatController'); 
const validateChatInput = require('../middlewares/validateChatInput');
const logger = require('../middlewares/logger');

router.get('/status', logger, getStatus);
router.get('/produk', logger, getProdukApi);

// Endpoint Admin (CRUD Produk)
router.post('/admin/login', logger, loginAdmin);
router.post('/produk', logger, tambahProdukApi);
router.put('/produk/:id', logger, editProdukApi);
router.delete('/produk/:id', logger, hapusProdukApi);

// Gunakan chatController.kirimPesan karena di controller namanya kirimPesan
router.post('/chat', logger, validateChatInput, chatController.kirimPesan);

module.exports = router;