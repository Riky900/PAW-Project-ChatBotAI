const config = require('../config/config');

// GET /api/status
const getStatus = (req, res) => {
  res.json({
    status: 'ok',
    message: 'Server berjalan dengan baik',
    app: config.appName,
    environment: config.env,
    uptime: Math.round(process.uptime()) + ' detik',
    timestamp: new Date().toISOString(),
  });
};

module.exports = { getStatus };
