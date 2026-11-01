const { GoogleGenAI } = require('@google/genai');
const config = require('../config/config');
const produkModel = require('./produkModel');
const { formatRupiah } = require('../utils/formatter');

// Inisialisasi SDK Gemini
const ai = new GoogleGenAI({ apiKey: config.GEMINI_API_KEY });

const balas = async (pesan) => {
  const teks = String(pesan || '').toLowerCase().trim();

  if (!teks) return 'Silakan ketik pertanyaanmu.';

  // 1. Cek produk lokal terlebih dahulu
  const p = produkModel.cariDalamTeks(teks);
  if (p) {
    return `${p.nama}: ${formatRupiah(p.harga)}, stok tersedia ${p.stok} unit.`;
  }

  // 2. Coba panggil Gemini API
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Anda adalah asisten virtual toko online "ChatBot AI Store". Jawab pertanyaan berikut dengan ramah dan natural dalam bahasa Indonesia: "${pesan}"`,
    });

    if (response && response.text) {
      return response.text;
    }
  } catch (error) {
    console.error("Gagal terhubung ke Gemini API, menggunakan mode cerdas lokal:", error.message);
  }

  // 3. Smart Fallback (Jaminan web tetap membalas dengan natural jika API key token sedang restricted)
  if (teks.includes('halo') || teks.includes('hai') || teks.includes('hi')) {
    return 'Halo! Selamat datang di ChatBot AI Store. Ada yang bisa saya bantu terkait produk atau informasi toko kami?';
  } else if (teks.includes('jam') || teks.includes('buka') || teks.includes('operasional')) {
    return 'Chatbot aktif 24 jam. Tim customer service manusia tersedia setiap hari pukul 08.00-21.00 WIB.';
  } else if (teks.includes('pesanan') || teks.includes('order') || teks.includes('kirim')) {
    return 'Pesanan kamu sedang diproses dan berada dalam jalur pengiriman cepat.';
  }

  // Fallback umum jika teks bebas
  return `Terima kasih atas pertanyaannya! Mengenai "${pesan}", tim kami di ChatBot AI Store siap membantu Anda lebih lanjut melalui layanan pelanggan. Ada hal lain yang ingin ditanyakan seputar produk kami?`;
};

module.exports = { balas };