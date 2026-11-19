# Tambahan: Login 3 Role + Fitur PRD SigapChat

Semua file di sini **baru**. File lama (app.js, routes, controllers, views/index.ejs, dll.) tidak diubah.

## Cara menjalankan
1. Import `schema.sql` (jika belum), lalu import **`schema_auth.sql`** lewat phpMyAdmin (database `db_chatbot_paw`).
2. Isi data awal: `node scripts/seed-akun.js`
3. Jalankan server dengan **`node server.js`** (atau `npx nodemon server.js`) — bukan `app.js`.
4. Buka http://localhost:3000 → halaman pertama adalah Login.

Opsional di `.env`: `SESSION_SECRET`, `ADMIN_CODE` (default `makkauhijau`), `MANAGER_CODE` (default `manager2026`).

## Akun demo (dari seed)
| Role | Email | Password |
|---|---|---|
| Admin | admin@sigapchat.local | admin123 |
| Manager | manager@sigapchat.local | manager123 |
| Pelanggan | rina@sigapchat.local | rina123 |

## Halaman
| URL | Role | Isi |
|---|---|---|
| `/` | semua | Login / Daftar (pilih Pelanggan, Admin, Manager) |
| `/toko` | login | Halaman toko lama + chatbot (ditambah Hubungi staf & rating untuk pelanggan) |
| `/pesanan` | pelanggan | Buat pesanan, riwayat & status pesanan, balasan staf |
| `/admin` | admin | Kelola FAQ (F-07), pesanan & statusnya, eskalasi (F-04) |
| `/manager` | manager | Dashboard statistik (F-06): M-01, M-02, M-04, M-05 |

## Pemetaan ke PRD
- F-01 chat AI: tetap (Gemini lama), kini dengan timeout 25 dtk + pesan cadangan
- F-02 status pesanan: kirim `ORD-1001` di chat (hanya pesanan milik sendiri)
- F-03 sapaan & tombol saran: sudah ada di `index.ejs`
- F-04 eskalasi: tombol "Hubungi staf" → admin lihat riwayat chat & membalas
- F-05 rating: tombol "Akhiri & nilai" (1–5)
- F-06 dashboard: `/manager`
- F-07 FAQ: `/admin` tab FAQ, dipakai chatbot sebelum AI
