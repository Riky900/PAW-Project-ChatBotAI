// Middleware autentikasi & otorisasi per role (pelanggan / admin / manager)
const { COOKIE, bacaToken, bacaCookie } = require('../utils/auth');

const halamanAwal = (role) => (role === 'admin' ? '/admin' : role === 'manager' ? '/manager' : '/toko');
const apiRequest = (req) => req.originalUrl.startsWith('/api');

// Membaca cookie login -> req.user (atau null). Juga tersedia di EJS sebagai `user`.
const attachUser = (req, res, next) => {
  const data = bacaToken(bacaCookie(req.headers.cookie)[COOKIE]);
  req.user = data ? { id: data.id, nama: data.nama, role: data.role } : null;
  res.locals.user = req.user;
  next();
};

const requireLogin = (req, res, next) => {
  if (req.user) return next();
  if (apiRequest(req)) return res.status(401).json({ success: false, message: 'Silakan login terlebih dahulu.' });
  return res.redirect('/');
};

const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) return requireLogin(req, res, next);
  if (roles.includes(req.user.role)) return next();
  if (apiRequest(req)) return res.status(403).json({ success: false, message: 'Akses ditolak untuk role Anda.' });
  return res.redirect(halamanAwal(req.user.role));
};

module.exports = { attachUser, requireLogin, requireRole, halamanAwal };
