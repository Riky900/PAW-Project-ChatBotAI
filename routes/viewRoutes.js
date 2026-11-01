const express = require('express');
const router = express.Router();
const { tampilkanHalaman } = require('../controllers/produkController');

router.get('/', tampilkanHalaman);

module.exports = router;
