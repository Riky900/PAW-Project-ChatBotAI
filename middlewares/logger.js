// Middleware logger: mencatat method, path, status, dan timestamp
const fs = require('fs');
const path = require('path');
const { formatTimestamp } = require('../utils/formatter');

const logDir = path.join(__dirname, '..', 'logs');
const logFile = path.join(logDir, 'access.log');

const logger = (req, res, next) => {
  const start = Date.now();

  // 'finish' dipanggil setelah response terkirim, jadi status code sudah final
  res.on('finish', () => {
    const durasi = Date.now() - start;
    const baris = `[${formatTimestamp()}] ${req.method} ${req.originalUrl} ${res.statusCode} - ${durasi}ms`;

    console.log(baris);

    // Simpan juga ke file logs/access.log (opsional)
    fs.mkdir(logDir, { recursive: true }, () => {
      fs.appendFile(logFile, baris + '\n', () => {});
    });
  });

  next();
};

module.exports = logger;
