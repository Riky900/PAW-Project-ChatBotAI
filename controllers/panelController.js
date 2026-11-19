// Controller halaman panel: pelanggan (Pesanan Saya), admin (FAQ, pesanan, eskalasi), manager (dashboard)
const faqModel = require('../models/faqModel');
const pesananModel = require('../models/pesananModel');
const percakapanModel = require('../models/percakapanModel');
const produkModel = require('../models/produkModel');
const userModel = require('../models/userModel');
const statistikModel = require('../models/statistikModel');

const kembali = (res, url, pesan, tipe = 'success') =>
  res.redirect(`${url}${url.includes('?') ? '&' : '?'}pesan=${encodeURIComponent(pesan)}&tipe=${tipe}`);

// ===== PELANGGAN =====
const halamanPesanan = async (req, res) => {
  try {
    const [pesanan, produk, eskalasi] = await Promise.all([
      pesananModel.listByUser(req.user.id),
      produkModel.getAll(),
      percakapanModel.eskalasiByUser(req.user.id),
    ]);
    res.render('pelanggan/pesanan', {
      title: 'Pesanan Saya', pesanan, produk, eskalasi,
      pesan: req.query.pesan || null, tipe: req.query.tipe || 'success',
    });
  } catch (err) {
    res.status(500).send('Gagal memuat halaman: ' + err.message);
  }
};

const buatPesanan = async (req, res) => {
  try {
    const nomor = await pesananModel.create({
      penggunaId: req.user.id, produkId: req.body.produk_id, jumlah: req.body.jumlah,
    });
    kembali(res, '/pesanan', `Pesanan ${nomor} berhasil dibuat.`);
  } catch (err) {
    kembali(res, '/pesanan', err.message, 'danger');
  }
};

// ===== ADMIN =====
const halamanAdmin = async (req, res) => {
  try {
    const [faq, pesanan, eskalasi, pelanggan, produk] = await Promise.all([
      faqModel.getAll(),
      pesananModel.listAll(),
      percakapanModel.listEskalasi(),
      userModel.listByRole('pelanggan'),
      produkModel.getAll(),
    ]);
    res.render('admin/index', {
      title: 'Panel Admin', faq, pesanan, eskalasi, pelanggan, produk,
      statusList: pesananModel.STATUS,
      tab: ['faq', 'pesanan', 'eskalasi'].includes(req.query.tab) ? req.query.tab : 'faq',
      pesan: req.query.pesan || null, tipe: req.query.tipe || 'success',
    });
  } catch (err) {
    res.status(500).send('Gagal memuat halaman: ' + err.message);
  }
};

const dataFaq = (b) => ({
  pertanyaan: String(b.pertanyaan || '').trim(),
  kata_kunci: String(b.kata_kunci || '').trim(),
  jawaban: String(b.jawaban || '').trim(),
  aktif: b.aktif === '1' || b.aktif === 'on',
});

const tambahFaq = async (req, res) => {
  const d = dataFaq(req.body);
  if (!d.pertanyaan || !d.kata_kunci || !d.jawaban) return kembali(res, '/admin?tab=faq', 'Semua kolom FAQ wajib diisi.', 'danger');
  try { await faqModel.create(d); kembali(res, '/admin?tab=faq', 'FAQ berhasil ditambahkan.'); }
  catch (err) { kembali(res, '/admin?tab=faq', err.message, 'danger'); }
};

const ubahFaq = async (req, res) => {
  const d = dataFaq(req.body);
  if (!d.pertanyaan || !d.kata_kunci || !d.jawaban) return kembali(res, '/admin?tab=faq', 'Semua kolom FAQ wajib diisi.', 'danger');
  try { await faqModel.update(req.params.id, d); kembali(res, '/admin?tab=faq', 'FAQ diperbarui. Chatbot memakai jawaban baru mulai percakapan berikutnya.'); }
  catch (err) { kembali(res, '/admin?tab=faq', err.message, 'danger'); }
};

const hapusFaq = async (req, res) => {
  try { await faqModel.remove(req.params.id); kembali(res, '/admin?tab=faq', 'FAQ dihapus.'); }
  catch (err) { kembali(res, '/admin?tab=faq', err.message, 'danger'); }
};

const tambahPesananAdmin = async (req, res) => {
  try {
    const nomor = await pesananModel.create({
      penggunaId: req.body.pengguna_id, produkId: req.body.produk_id, jumlah: req.body.jumlah,
    });
    kembali(res, '/admin?tab=pesanan', `Pesanan ${nomor} berhasil dibuat.`);
  } catch (err) { kembali(res, '/admin?tab=pesanan', err.message, 'danger'); }
};

const ubahStatusPesanan = async (req, res) => {
  try {
    await pesananModel.updateStatus(req.params.id, req.body.status, req.body.estimasi_tiba);
    kembali(res, '/admin?tab=pesanan', 'Status pesanan diperbarui.');
  } catch (err) { kembali(res, '/admin?tab=pesanan', err.message, 'danger'); }
};

const detailEskalasi = async (req, res) => {
  try {
    const e = await percakapanModel.eskalasiById(req.params.id);
    if (!e) return kembali(res, '/admin?tab=eskalasi', 'Eskalasi tidak ditemukan.', 'danger');
    const riwayat = await percakapanModel.riwayat(e.percakapan_id);
    res.render('admin/eskalasi', {
      title: 'Eskalasi #' + e.id, e, riwayat,
      pesan: req.query.pesan || null, tipe: req.query.tipe || 'success',
    });
  } catch (err) { res.status(500).send('Gagal memuat halaman: ' + err.message); }
};

const balasEskalasi = async (req, res) => {
  const balasan = String(req.body.balasan || '').trim();
  if (!balasan) return kembali(res, `/admin/eskalasi/${req.params.id}`, 'Balasan tidak boleh kosong.', 'danger');
  try {
    await percakapanModel.balasEskalasi(req.params.id, balasan);
    kembali(res, '/admin?tab=eskalasi', 'Eskalasi ditandai selesai dan balasan terkirim ke pelanggan.');
  } catch (err) { kembali(res, `/admin/eskalasi/${req.params.id}`, err.message, 'danger'); }
};

// ===== MANAGER =====
const dashboardManager = async (req, res) => {
  const periode = ['7', '30', '90', '0'].includes(req.query.periode) ? req.query.periode : '30';
  try {
    const s = await statistikModel.ringkas(periode);
    res.render('manager/dashboard', { title: 'Dashboard Manager', s, periode });
  } catch (err) { res.status(500).send('Gagal memuat dashboard: ' + err.message); }
};

module.exports = {
  halamanPesanan, buatPesanan,
  halamanAdmin, tambahFaq, ubahFaq, hapusFaq, tambahPesananAdmin, ubahStatusPesanan, detailEskalasi, balasEskalasi,
  dashboardManager,
};
