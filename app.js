// Entry point aplikasi
const express = require('express');
const path = require('path');

const config = require('./config/config');
const logger = require('./middlewares/logger');
const apiRoutes = require('./routes/apiRoutes');
const viewRoutes = require('./routes/viewRoutes');
const { formatRupiah } = require('./utils/formatter');

const app = express();

// View engine EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Helper tersedia di semua template EJS
app.locals.formatRupiah = formatRupiah;

// Middleware (logger dipasang paling awal supaya semua request tercatat)
app.use(logger);
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public'))); // gambar, dll.

// Routes
app.use('/api', apiRoutes);
app.use('/', viewRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ status: 'error', message: 'Endpoint tidak ditemukan' });
});

app.listen(config.port, () => {
  console.log(`Server berjalan di http://localhost:${config.port}`);
});
