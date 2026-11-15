// controllers/chatController.js
const geminiService = require('../services/gemini.service.js');

async function kirimPesan(req, res) {
  try {
    // Mendukung key 'message' atau 'pesan' dari frontend agar fleksibel
    const message = req.body.message || req.body.pesan;

    if (!message || typeof message !== 'string' || message.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Pesan tidak boleh kosong dan harus berupa teks.'
      });
    }

    // Panggil service untuk mendapatkan respons dari Gemini AI
    const reply = await geminiService.generateChatResponse(message);

    // Kirim respons sukses (mendukung format .data.reply maupun .balasan untuk frontend)
    return res.status(200).json({
      success: true,
      data: {
        reply: reply
      },
      balasan: reply // Kompatibilitas cadangan jika frontend memakai .balasan
    });

  } catch (error) {
    console.error('Error di chatController:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server saat memproses AI Assistant.'
    });
  }
}

module.exports = {
  kirimPesan,
};