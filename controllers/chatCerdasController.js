// Handler POST /api/chat versi lengkap PRD:
//  1) cek status pesanan (US-02)  2) jawab dari FAQ (F-07)  3) fallback ke Gemini (service lama)
//  + mencatat waktu respons, percakapan, dan saran eskalasi ke staf (US-04)
const geminiService = require('../services/gemini.service');
const faqModel = require('../models/faqModel');
const pesananModel = require('../models/pesananModel');
const percakapanModel = require('../models/percakapanModel');
const { formatRupiah } = require('../utils/formatter');

const BATAS_GAGAL = 2;
const TIMEOUT_AI_MS = 25000;
const PESAN_CADANGAN =
  'Maaf, layanan AI sedang lambat atau tidak tersedia. Silakan coba lagi sebentar lagi, atau tekan "Hubungi staf" agar tim kami membantu.';
const POLA_GAGAL = /(maaf|tidak (dapat|bisa) (membantu|menjawab)|di luar (konteks|cakupan)|tidak memiliki informasi|tidak ada (di|dalam) (sumber|data))/i;

const tglIndo = (d) => (d ? new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-');

const teksStatusPesanan = (p) =>
  `Pesanan ${p.nomor_pesanan} (${p.nama_produk} x${p.jumlah}, total ${formatRupiah(p.total)}) berstatus: ${p.status}.` +
  (['Diproses', 'Dikirim', 'Menunggu Pembayaran'].includes(p.status) && p.estimasi_tiba ? ` Estimasi tiba: ${tglIndo(p.estimasi_tiba)}.` : '');

const ambilNomorPesanan = (teks) => {
  const m = teks.match(/ORD-?\s?(\d{3,})/i) || teks.trim().match(/^(\d{4,})$/);
  return m ? 'ORD-' + m[1] : null;
};

const denganTimeout = (promise, ms) =>
  Promise.race([promise, new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), ms))]);

async function jawab(message, user) {
  const nomor = ambilNomorPesanan(message);
  const tanyaPesanan = /(pesanan|\border\b|resi|lacak|tracking)/i.test(message);

  // 1) Status pesanan (hanya untuk pelanggan yang login & hanya pesanan miliknya)
  if (nomor || tanyaPesanan) {
    if (!user || user.role !== 'pelanggan') {
      if (nomor) return { reply: 'Untuk mengecek pesanan, silakan masuk sebagai pelanggan terlebih dahulu.', gagal: false };
    } else if (nomor) {
      const p = await pesananModel.findForUser(nomor, user.id);
      if (p) return { reply: teksStatusPesanan(p), gagal: false };
      return {
        reply: `Nomor pesanan ${nomor} tidak ditemukan di akunmu. Mohon periksa kembali lalu kirim ulang (contoh: ORD-1001).`,
        gagal: false,
      };
    } else {
      const daftar = await pesananModel.listByUser(user.id);
      const contoh = daftar.slice(0, 3).map((p) => p.nomor_pesanan).join(', ');
      return {
        reply: 'Boleh kirim nomor pesananmu (contoh: ORD-1001)?' + (contoh ? ` Pesanan di akunmu: ${contoh}.` : ' Kamu belum punya pesanan di akun ini.'),
        gagal: false,
      };
    }
  }

  // 2) FAQ dari basis pengetahuan yang dikelola admin
  const faq = await faqModel.cari(message);
  if (faq) return { reply: faq.jawaban, gagal: false };

  // 3) Fallback ke AI (service Gemini yang sudah ada), dengan timeout + pesan cadangan
  try {
    const teks = await denganTimeout(geminiService.generateChatResponse(message), TIMEOUT_AI_MS);
    if (!teks || !String(teks).trim()) return { reply: PESAN_CADANGAN, gagal: true };
    return { reply: String(teks).trim(), gagal: POLA_GAGAL.test(teks) };
  } catch (err) {
    console.error('Chat AI gagal:', err.message);
    return { reply: PESAN_CADANGAN, gagal: true };
  }
}

async function kirimPesanCerdas(req, res) {
  try {
    const message = String(req.body.message || req.body.pesan || '').trim();
    const user = req.user;
    const catat = user && user.role === 'pelanggan'; // hanya percakapan pelanggan yang dicatat untuk statistik

    const mulai = Date.now();
    const cid = catat ? await percakapanModel.aktifAtauBaru(user.id) : null;
    if (cid) await percakapanModel.tambahPesan(cid, 'user', message);

    const hasil = await jawab(message, user);
    const ms = Date.now() - mulai;

    let saranStaf = false;
    if (cid) {
      await percakapanModel.tambahPesan(cid, 'bot', hasil.reply, ms, hasil.gagal);
      saranStaf = (await percakapanModel.gagalBeruntun(cid)) >= BATAS_GAGAL;
    }

    return res.status(200).json({
      success: true,
      data: { reply: hasil.reply, saran_staf: saranStaf, waktu_ms: ms },
      balasan: hasil.reply,
    });
  } catch (error) {
    console.error('Error di chatCerdasController:', error);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server saat memproses AI Assistant.' });
  }
}

// POST /api/chat/eskalasi -> teruskan percakapan aktif ke staf beserta riwayatnya
async function hubungiStaf(req, res) {
  try {
    const cid = await percakapanModel.aktifAtauBaru(req.user.id);
    await percakapanModel.buatEskalasi(cid, req.user.id);
    res.json({
      success: true,
      message: 'Percakapanmu sudah diteruskan ke staf layanan pelanggan beserta riwayat chat. Staf akan menindaklanjuti; balasannya bisa dilihat di halaman Pesanan Saya.',
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// POST /api/chat/rating {nilai: 1-5}
async function beriRating(req, res) {
  const nilai = Number(req.body.nilai);
  if (!Number.isInteger(nilai) || nilai < 1 || nilai > 5) {
    return res.status(400).json({ success: false, message: 'Rating harus 1 sampai 5.' });
  }
  try {
    const ok = await percakapanModel.beriRating(req.user.id, nilai);
    if (!ok) return res.status(400).json({ success: false, message: 'Belum ada percakapan yang bisa dinilai. Kirim pesan dulu ya.' });
    res.json({ success: true, message: 'Terima kasih atas penilaianmu! 🙏' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// GET /api/saya -> info user login untuk skrip tambahan di halaman toko
const saya = (req, res) => res.json({ user: req.user || null });

module.exports = { kirimPesanCerdas, hubungiStaf, beriRating, saya };
