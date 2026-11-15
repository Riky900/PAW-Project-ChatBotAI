// routes/chat.routes.js
const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const validateChatInput = require('../middlewares/validateChatInput');
const logger = require('../middlewares/logger');

// Gunakan chatController.kirimPesan karena di controller fungsinya bernama kirimPesan
router.post('/chat', logger, validateChatInput, chatController.kirimPesan);

module.exports = router;