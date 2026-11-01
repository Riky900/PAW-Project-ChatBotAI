// Fungsi bantuan yang dapat dipakai ulang

// 25000 -> "Rp 25.000"
const formatRupiah = (angka) =>
  'Rp ' + Number(angka).toLocaleString('id-ID');

// Timestamp lokal Indonesia, contoh: "01/11/2026 11.20.35"
const formatTimestamp = (date = new Date()) =>
  date.toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });

module.exports = { formatRupiah, formatTimestamp };
