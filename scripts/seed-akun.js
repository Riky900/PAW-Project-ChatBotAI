// Mengisi data awal: akun demo (admin, manager, pelanggan), FAQ, dan contoh pesanan.
// Jalankan SETELAH schema.sql dan schema_auth.sql:   node scripts/seed-akun.js
const db = require('../config/database');
const userModel = require('../models/userModel');
const pesananModel = require('../models/pesananModel');
const { hashPassword } = require('../utils/auth');

const AKUN = [
  { nama: 'Budi Admin', email: 'admin@sigapchat.local', password: 'admin123', role: 'admin' },
  { nama: 'Sari Manager', email: 'manager@sigapchat.local', password: 'manager123', role: 'manager' },
  { nama: 'Rina Pelanggan', email: 'rina@sigapchat.local', password: 'rina123', role: 'pelanggan' },
];

const FAQ = [
  ['Jam layanan kapan?', 'jam, buka, operasional, layanan', 'Chatbot aktif 24 jam. Tim customer service manusia tersedia setiap hari pukul 08.00-21.00 WIB.'],
  ['Berapa lama pengiriman?', 'pengiriman, kirim, ongkir, kurir, durasi', 'Pengiriman memakan waktu 2-4 hari kerja tergantung lokasi. Status terbaru bisa dicek dengan mengirim nomor pesanan (contoh: ORD-1001) ke chat ini.'],
  ['Bagaimana cara retur atau refund?', 'retur, refund, kembali, batal', 'Retur/refund tidak diproses lewat chatbot. Tekan tombol "Hubungi staf" agar tim kami membantu prosesnya.'],
  ['Apakah ada garansi?', 'garansi, rusak, cacat', 'Semua produk bergaransi toko 7 hari untuk kerusakan bawaan pabrik. Hubungi staf jika produkmu bermasalah.'],
  ['Metode pembayaran apa saja?', 'pembayaran, bayar, transfer, metode', 'Pembayaran dilakukan melalui transfer bank. Pembayaran tidak dapat diproses lewat chatbot.'],
];

(async () => {
  try {
    for (const a of AKUN) {
      if (await userModel.findByEmail(a.email)) { console.log('Sudah ada :', a.email); continue; }
      await userModel.create({ nama: a.nama, email: a.email, passwordHash: hashPassword(a.password), role: a.role });
      console.log('Dibuat     :', a.email, '/', a.password, `(${a.role})`);
    }

    const [cekFaq] = await db.query('SELECT COUNT(*) AS n FROM faq');
    if (cekFaq[0].n === 0) {
      for (const [q, k, j] of FAQ) {
        await db.query('INSERT INTO faq (pertanyaan, kata_kunci, jawaban, aktif) VALUES (?, ?, ?, 1)', [q, k, j]);
      }
      console.log('FAQ awal ditambahkan:', FAQ.length);
    }

    const rina = await userModel.findByEmail('rina@sigapchat.local');
    const [cek] = await db.query('SELECT COUNT(*) AS n FROM pesanan WHERE pengguna_id = ?', [rina.id]);
    const [produk] = await db.query('SELECT id FROM produk ORDER BY id LIMIT 2');
    if (cek[0].n === 0 && produk.length) {
      const n1 = await pesananModel.create({ penggunaId: rina.id, produkId: produk[0].id, jumlah: 1 });
      const n2 = await pesananModel.create({ penggunaId: rina.id, produkId: produk[produk.length - 1].id, jumlah: 2 });
      await db.query("UPDATE pesanan SET status = 'Dikirim' WHERE nomor_pesanan = ?", [n2]);
      console.log('Contoh pesanan:', n1, n2);
    }
    console.log('Selesai.');
  } catch (err) {
    console.error('Seed gagal:', err.message);
  } finally {
    await db.end();
  }
})();
