// services/gemini.service.js
const { ai } = require('../config/gemini.js');
const produkModel = require('../models/produkModel.js');

async function generateChatResponse(userMessage) {
  try {
    // Tambahkan 'await' karena getAll() sekarang mengambil data dari database MySQL
    const daftarProduk = typeof produkModel.getAll === 'function' ? await produkModel.getAll() : [];
    const contextProduk = JSON.stringify(daftarProduk);

    // Susun System Instruction & Guardrail yang ketat
    const systemInstruction = `
      Kamu adalah AI Assistant resmi untuk aplikasi katalog aksesori komputer dan gadget.
      Tugasmu adalah membantu pengguna memahami informasi produk, harga, stok, deskripsi produk, jam layanan, dan panduan pengecekan pesanan.
      
      SUMBER DATA APLIKASI & TOKO:
- Katalog Produk: ${contextProduk}
- Jam Layanan: Senin - Sabtu, pukul 08.00 - 21.00 WIB. Hari Minggu / Tanggal Merah Libur.
- Info Cek Pesanan: Pelanggan dapat mengecek status pesanan melalui halaman Riwayat Pesanan di akun masing-masing atau memasukkan nomor resi di menu tracking pengiriman.

      ATURAN KETAT (GUARDRAILS):
1. Kamu HANYA boleh menjawab pertanyaan yang berkaitan dengan produk, informasi toko, jam layanan, dan layanan yang ada di aplikasi ini.
2. Jika pengguna bertanya di luar konteks aplikasi (misal: coding game, resep masakan, politik, dll), tolak secara sopan.
3. Jangan pernah mengarang informasi yang tidak ada di dalam sumber data.
    `;

    console.log('Mengirim pesan ke Gemini API...');
    const startTime = Date.now();

    // Gunakan model gemini-2.5-flash yang valid dan cepat
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        { role: 'user', parts: [{ text: userMessage }] }
      ],
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.3,
        maxOutputTokens: 300,
      }
    });

    console.log(`Respons diterima dalam ${Date.now() - startTime} ms`);
    return response.text;
  } catch (error) {
    console.error('Error pada Gemini Service:', error);
    
    // Fallback cerdas jika API Google 503 / Overload saat demo
    if (error.status === 503 || (error.message && error.message.includes('503'))) {
      return "Maaf ya, sistem AI sedang mengalami lonjakan trafik (503). Namun berdasarkan katalog kami, produk aksesori komputer dan gadget kami lengkap mulai dari Keyboard, Mouse, Headset, hingga Powerbank. Ada yang ingin kamu cari?";
    }

    throw new Error('Gagal terhubung ke layanan AI Gemini.');
  }
}

module.exports = {
  generateChatResponse,
};