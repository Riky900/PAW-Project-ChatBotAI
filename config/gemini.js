// config/gemini.js
const { GoogleGenAI } = require('@google/genai');
require('dotenv').config();

// Inisialisasi client Gemini dengan API Key dari .env
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Gunakan model gemini-2.5-flash yang cepat dan hemat kuota
const MODEL_NAME = 'gemini-2.5-flash';

module.exports = {
  ai,
  MODEL_NAME
};