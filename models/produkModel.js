// Model: data produk toko online (array statis, tanpa database)
const produk = [
  { id: 1, gambar: '/images/headset.svg', nama: 'Headset Bluetooth', kategori: 'Audio', harga: 250000, stok: 20 },
  { id: 2, gambar: '/images/keyboard.svg', nama: 'Keyboard Mechanical', kategori: 'Komputer', harga: 450000, stok: 15 },
  { id: 3, gambar: '/images/mouse.svg', nama: 'Mouse Wireless', kategori: 'Komputer', harga: 150000, stok: 40 },
  { id: 4, gambar: '/images/powerbank.svg', nama: 'Power Bank 10000mAh', kategori: 'Aksesoris', harga: 180000, stok: 30 },
  { id: 5, gambar: '/images/webcam.svg', nama: 'Webcam Full HD', kategori: 'Komputer', harga: 320000, stok: 12 },
];

const getAll = () => produk;

const getById = (id) => produk.find((p) => p.id === Number(id));

// Cari produk yang namanya disebut dalam teks pesan
const cariDalamTeks = (teks) => {
  const t = teks.toLowerCase();
  return produk.find((p) => t.includes(p.nama.toLowerCase()) ||
    p.nama.toLowerCase().split(' ').some((kata) => kata.length > 4 && t.includes(kata)));
};

module.exports = { getAll, getById, cariDalamTeks };
