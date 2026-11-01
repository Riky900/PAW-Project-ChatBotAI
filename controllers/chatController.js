const chatbotModel = require('../models/chatbotModel');

// POST /api/chat
const kirimPesan = async (req, res) => {
  try {
    // Mendukung key 'pesan', 'message', ataupun 'prompt' dari request body
    const userMessage = req.body.pesan || req.body.message || req.body.prompt;

    if (!userMessage || !String(userMessage).trim()) {
      return res.status(400).json({ 
        status: 'error', 
        success: false, 
        message: 'Field "pesan" wajib diisi' 
      });
    }

    // Gunakan await karena fungsi balas sekarang asynchronous
    const botReply = await chatbotModel.balas(userMessage);

    res.status(200).json({ 
      status: 'success',
      success: true, 
      pesan: String(userMessage),
      balasan: botReply,
      reply: botReply, // Menyediakan key 'balasan' dan 'reply' sekaligus agar aman untuk frontend lama/baru
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error di controller chat:", error);
    res.status(500).json({ 
      status: 'error',
      success: false, 
      message: "Gagal memproses pesan." 
    });
  }
};

module.exports = { kirimPesan };