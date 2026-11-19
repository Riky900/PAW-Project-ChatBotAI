// Entry point BARU (menggantikan `node app.js`): app.js lama tidak diubah.
// Menambahkan login 3 role, panel admin/manager, FAQ, status pesanan, eskalasi, rating.
// Jalankan dengan: node server.js   (atau: npx nodemon server.js)
const express = require('express');
const path = require('path');

const config = require('./config/config');
const logger = require('./middlewares/logger');
const apiRoutes = require('./routes/apiRoutes');   // route lama
const viewRoutes = require('./routes/viewRoutes'); // route lama (halaman toko)
const authRoutes = require('./routes/authRoutes');
const panelRoutes = require('./routes/panelRoutes');
const chatExtraRoutes = require('./routes/chatExtraRoutes');
const { attachUser, requireLogin } = require('./middlewares/auth');
const { formatRupiah, formatTimestamp } = require('./utils/formatter');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.locals.formatRupiah = formatRupiah;
app.locals.formatTimestamp = formatTimestamp;

app.use(logger);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(attachUser);

// Menyisipkan skrip tambahan (Hubungi staf, rating, menu per role) ke halaman toko lama
const sisipkanChatExtras = (req, res, next) => {
  const renderAsli = res.render.bind(res);
  res.render = (view, options, cb) => {
    renderAsli(view, options, (err, html) => {
      if (err) return cb ? cb(err) : next(err);
      res.send(html.replace('</body>', '<script src="/js/chat-extras.js"></script>\n</body>'));
    });
  };
  next();
};

// API: chatExtraRoutes lebih dulu agar /api/chat memakai handler baru
app.use('/api', chatExtraRoutes);
app.use('/api', apiRoutes);

// Halaman
app.use('/', authRoutes);                                   // /  (login), /masuk, /daftar, /keluar
app.use('/toko', requireLogin, sisipkanChatExtras, viewRoutes); // halaman toko lama (wajib login)
app.use('/', panelRoutes);                                  // /pesanan, /admin, /manager

app.use((req, res) => {
  res.status(404).json({ status: 'error', message: 'Endpoint tidak ditemukan' });
});

app.listen(config.port, () => {
  console.log(`Server (dengan login) berjalan di http://localhost:${config.port}`);
});
