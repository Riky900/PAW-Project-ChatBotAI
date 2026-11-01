# PAW-Project-ChatbotAI

Implementasi Chatbot Berbasis AI dalam Meningkatkan Interaksi Pengguna pada Platform Web.
Stack: Express.js + EJS + Bootstrap (CDN), pola MVC.

## Menjalankan
```
npm install
npm run dev     # atau: npm start
```
Buka http://localhost:3000

## Endpoint
- GET  /            -> halaman frontend (EJS) + widget chatbot
- GET  /api/status  -> status server (JSON)
- GET  /api/produk  -> daftar produk (JSON)
- POST /api/chat    -> kirim pesan ke chatbot, body: {"pesan": "harga mouse?"}
