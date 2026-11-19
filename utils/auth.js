// Utilitas autentikasi: hash password (scrypt) + cookie login bertanda tangan (HMAC).
// Tanpa library tambahan, jadi package.json tidak perlu diubah.
const crypto = require('crypto');
require('../config/config'); // memastikan .env sudah dimuat

const SECRET = process.env.SESSION_SECRET || 'rahasia-dev-ganti-di-env';
const COOKIE = 'sid';
const MASA_AKTIF_MS = 1000 * 60 * 60 * 8; // 8 jam

const hashPassword = (password) => {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(String(password), salt, 64).toString('hex');
  return `${salt}:${hash}`;
};

const cekPassword = (password, tersimpan) => {
  const [salt, hash] = String(tersimpan || '').split(':');
  if (!salt || !hash) return false;
  const uji = crypto.scryptSync(String(password), salt, 64);
  const asli = Buffer.from(hash, 'hex');
  return asli.length === uji.length && crypto.timingSafeEqual(uji, asli);
};

const tandatangani = (data) =>
  crypto.createHmac('sha256', SECRET).update(data).digest('base64url');

const buatToken = (user) => {
  const isi = Buffer.from(
    JSON.stringify({ id: user.id, nama: user.nama, role: user.role, exp: Date.now() + MASA_AKTIF_MS })
  ).toString('base64url');
  return `${isi}.${tandatangani(isi)}`;
};

const bacaToken = (token) => {
  if (!token || !token.includes('.')) return null;
  const [isi, ttd] = token.split('.');
  const benar = tandatangani(isi);
  const a = Buffer.from(String(ttd));
  const b = Buffer.from(benar);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const data = JSON.parse(Buffer.from(isi, 'base64url').toString());
    if (!data.exp || data.exp < Date.now()) return null;
    return data;
  } catch (e) {
    return null;
  }
};

const bacaCookie = (header) => {
  const hasil = {};
  String(header || '').split(';').forEach((bagian) => {
    const i = bagian.indexOf('=');
    if (i > -1) hasil[bagian.slice(0, i).trim()] = decodeURIComponent(bagian.slice(i + 1).trim());
  });
  return hasil;
};

const setCookieLogin = (res, user) => {
  res.setHeader(
    'Set-Cookie',
    `${COOKIE}=${encodeURIComponent(buatToken(user))}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${MASA_AKTIF_MS / 1000}`
  );
};

const hapusCookie = (res) => {
  res.setHeader('Set-Cookie', `${COOKIE}=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0`);
};

module.exports = { COOKIE, hashPassword, cekPassword, bacaToken, bacaCookie, setCookieLogin, hapusCookie };
