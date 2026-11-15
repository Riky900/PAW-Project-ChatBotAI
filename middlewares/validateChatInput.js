// middlewares/validateChatInput.js
function validateChatInput(req, res, next) {
  const { message } = req.body;

  // Cek apakah pesan kosong atau bukan string
  if (!message || typeof message !== 'string' || message.trim() === '') {
    return res.status(400).json({
      success: false,
      message: 'Pesan tidak boleh kosong dan harus berupa teks.'
    });
  }

  // Batasi panjang pesan (misal maksimal 500 karakter) untuk mencegah spam
  if (message.length > 500) {
    return res.status(400).json({
      success: false,
      message: 'Pesan terlalu panjang (maksimal 500 karakter).'
    });
  }

  next();
}

module.exports = validateChatInput;