// Login / daftar / logout untuk 3 role: pelanggan, admin, manager
const userModel = require('../models/userModel');
const { hashPassword, cekPassword, setCookieLogin, hapusCookie } = require('../utils/auth');
const { halamanAwal } = require('../middlewares/auth');

const ROLES = ['pelanggan', 'admin', 'manager'];
// Admin & manager mendaftar memakai kode akses (bisa diubah lewat .env)
const KODE_AKSES = {
  admin: process.env.ADMIN_CODE || 'makkauhijau',
  manager: process.env.MANAGER_CODE || 'manager2026',
};

const tampil = (res, data = {}) =>
  res.render('auth/masuk', Object.assign(
    { title: 'Masuk - SigapChat', mode: 'masuk', role: 'pelanggan', error: null, info: null, values: {} },
    data
  ));

// GET / dan GET /masuk -> halaman pertama (login)
const halamanLogin = (req, res) => {
  if (req.user) return res.redirect(halamanAwal(req.user.role));
  tampil(res, {
    mode: req.query.mode === 'daftar' ? 'daftar' : 'masuk',
    role: ROLES.includes(req.query.role) ? req.query.role : 'pelanggan',
  });
};

const prosesLogin = async (req, res) => {
  const { email, password } = req.body;
  const role = ROLES.includes(req.body.role) ? req.body.role : 'pelanggan';
  const values = { email: email || '' };
  try {
    const u = await userModel.findByEmail(email || '');
    if (!u || !cekPassword(password || '', u.password_hash)) {
      return tampil(res.status(401), { mode: 'masuk', role, values, error: 'Email atau password salah.' });
    }
    if (u.role !== role) {
      return tampil(res.status(403), {
        mode: 'masuk', role, values,
        error: `Akun ini terdaftar sebagai ${u.role}. Pilih role "${u.role}" untuk masuk.`,
      });
    }
    setCookieLogin(res, u);
    res.redirect(halamanAwal(u.role));
  } catch (err) {
    tampil(res.status(500), { mode: 'masuk', role, values, error: 'Terjadi kesalahan server: ' + err.message });
  }
};

const prosesDaftar = async (req, res) => {
  const { nama, email, password, konfirmasi, kode } = req.body;
  const role = ROLES.includes(req.body.role) ? req.body.role : 'pelanggan';
  const values = { nama: nama || '', email: email || '' };
  const gagal = (pesan, status = 400) => tampil(res.status(status), { mode: 'daftar', role, values, error: pesan });

  if (!nama || !nama.trim()) return gagal('Nama wajib diisi.');
  if (!/^\S+@\S+\.\S+$/.test(email || '')) return gagal('Format email tidak valid.');
  if (!password || password.length < 6) return gagal('Password minimal 6 karakter.');
  if (password !== konfirmasi) return gagal('Konfirmasi password tidak sama.');
  if (role !== 'pelanggan' && kode !== KODE_AKSES[role]) return gagal(`Kode akses ${role} salah.`, 403);

  try {
    await userModel.create({ nama, email, passwordHash: hashPassword(password), role });
    tampil(res, {
      mode: 'masuk', role, values: { email },
      info: 'Akun berhasil dibuat. Silakan masuk.',
    });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return gagal('Email sudah terdaftar.', 409);
    tampil(res.status(500), { mode: 'daftar', role, values, error: 'Terjadi kesalahan server: ' + err.message });
  }
};

const keluar = (req, res) => {
  hapusCookie(res);
  res.redirect('/');
};

module.exports = { halamanLogin, prosesLogin, prosesDaftar, keluar };
