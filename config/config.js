// Memuat konfigurasi dari file .env
require('dotenv').config();

// Konfigurasi aplikasi (environment)
module.exports = {
  appName: 'ChatBot AI Store',
  tagline: 'Implementasi Chatbot Berbasis AI dalam Meningkatkan Interaksi Pengguna pada Platform Web',
  port: process.env.PORT || 3000,
  env: process.env.NODE_ENV || 'development',
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
};