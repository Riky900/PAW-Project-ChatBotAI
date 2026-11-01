// Model: komunikasi dengan Claude API (Anthropic)
const config = require('../config/config');
const produkModel = require('./produkModel');
const { formatRupiah } = require('../utils/formatter');

let client = null;

const getClient = () => {
  if (!config.anthropicApiKey) return null;
  if (!client) {
    const sdk = require('@anthropic-ai/sdk');
    const Anthropic = sdk.default || sdk;
    client = new Anthropic({ apiKey: config.anthropicApiKey, timeout: 20000, maxRetries: 1 });
  }
  return client;
};

const apiTersedia = () => Boolean(config.anthropicApiKey);

const buatSystemPrompt = () => {
  const katalog = produkModel
    .getAll()
    .map((p) => `- ${p.nama} (${p.kategori}): ${formatRupiah(p.harga)}, stok ${p.stok} unit`)
    .join('\n');

  return [
    `Kamu adalah asisten virtual customer service untuk toko online "${config.appName}".`,
    'Jawab dalam Bahasa Indonesia yang ramah dan singkat.',
    'Untuk harga dan stok, gunakan HANYA data katalog di bawah. Jangan mengarang produk, harga, atau stok.',
    'Kamu tidak punya akses ke data pesanan. Jika ditanya status pesanan, minta nomor pesanan dan arahkan ke tim customer service manusia (setiap hari 08.00-21.00 WIB).',
    'Kamu juga boleh menjawab pertanyaan umum di luar toko dengan ramah dan singkat. Setelah itu, tawarkan bantuan soal produk toko.',
    '',
    'Katalog produk:',
    katalog,
  ].join('\n');
};

const susunPesan = (riwayat, pesanBaru) => {
  const semua = [];
  (Array.isArray(riwayat) ? riwayat : []).forEach((m) => {
    if (m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string' && m.content.trim()) {
      semua.push({ role: m.role, content: m.content.slice(0, 1000) });
    }
  });
  semua.push({ role: 'user', content: String(pesanBaru).slice(0, 1000) });

  const hasil = [];
  semua.forEach((m) => {
    const akhir = hasil[hasil.length - 1];
    if (!akhir && m.role !== 'user') return;
    if (akhir && akhir.role === m.role) akhir.content += '\n' + m.content;
    else hasil.push({ ...m });
  });
  return hasil;
};

const balas = async (pesan, riwayat) => {
  const c = getClient();
  if (!c) throw new Error('ANTHROPIC_API_KEY belum diatur');

  const respons = await c.messages.create({
    model: config.claudeModel,
    max_tokens: 400,
    system: buatSystemPrompt(),
    messages: susunPesan(riwayat, pesan),
  });

  return respons.content
    .filter((b) => b.type === 'text')
    .map((b) => b.text)
    .join('')
    .trim();
};

module.exports = { balas, apiTersedia, susunPesan };
