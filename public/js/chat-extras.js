// Tambahan untuk halaman toko (index.ejs lama tidak diubah; skrip ini disisipkan oleh server.js):
//  - menu sesuai role di navbar, tombol "Hubungi staf" (US-04), rating (US-05)
(function () {
  var css = document.createElement('style');
  css.textContent =
    '.chat-extra{display:flex;gap:6px;padding:8px 12px;background:#fff;border-top:1px solid #e2e8f0}' +
    '.chat-extra button{flex:1;border:1px solid #c7d2fe;background:#fff;color:#3730a3;border-radius:999px;padding:4px 8px;font-size:.76rem;font-weight:600;transition:all .2s}' +
    '.chat-extra button:hover{background:#eef2ff}' +
    '.chat-extra button.sorot{background:#4f46e5;color:#fff;border-color:#4f46e5}' +
    '.rating-bar{display:flex;gap:4px}.rating-bar button{border:0;background:#eef2ff;border-radius:8px;padding:2px 10px;font-weight:600}' +
    '.rating-bar button:hover{background:#4f46e5;color:#fff}' +
    '.user-nav{display:flex;align-items:center;gap:6px;flex-wrap:wrap}' +
    '.user-nav a{font-size:.8rem;font-weight:600;border:1.5px solid #cbd5e1;border-radius:999px;padding:5px 14px;color:#0f172a;text-decoration:none;background:#fff}' +
    '.user-nav a:hover{border-color:#4f46e5;color:#4f46e5}' +
    '.user-nav .nama{font-size:.8rem;color:#64748b}';
  document.head.appendChild(css);

  // Memantau balasan /api/chat: jika server menyarankan staf (gagal 2x berturut-turut), sorot tombolnya
  var fetchAsli = window.fetch;
  window.fetch = function (url, opts) {
    var p = fetchAsli.apply(this, arguments);
    if (typeof url === 'string' && url.indexOf('/api/chat') === 0 && url === '/api/chat') {
      p.then(function (r) { return r.clone().json(); }).then(function (d) {
        var btn = document.getElementById('btn-hubungi-staf');
        if (btn && d && d.data && d.data.saran_staf) {
          btn.classList.add('sorot');
          setTimeout(function () { botBubble('Sepertinya aku belum bisa membantu dengan baik. Tekan "👩‍💼 Hubungi staf" supaya tim kami menindaklanjuti ya.'); }, 1500);
        }
      }).catch(function () {});
    }
    return p;
  };

  function simpanRiwayat() {
    var msgs = document.getElementById('chat-messages');
    if (msgs) localStorage.setItem('chat_history', msgs.innerHTML);
  }

  function botBubble(teks) {
    var msgs = document.getElementById('chat-messages');
    if (!msgs) return null;
    var div = document.createElement('div');
    div.className = 'bubble bot';
    div.textContent = teks;
    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
    simpanRiwayat();
    return div;
  }

  function post(url, body) {
    return fetchAsli(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body || {})
    }).then(function (r) { return r.json(); });
  }

  function pasangMenu(user) {
    var tombolAdminLama = document.getElementById('btn-open-admin');
    if (!tombolAdminLama) return;
    var wadah = tombolAdminLama.parentElement;
    if (user.role !== 'admin') tombolAdminLama.style.display = 'none'; // modal admin berpassword hanya untuk role admin

    var nav = document.createElement('div');
    nav.className = 'user-nav';
    var tautan = [];
    if (user.role === 'pelanggan') tautan.push(['/pesanan', '📦 Pesanan Saya']);
    if (user.role === 'admin') tautan.push(['/admin', '🛠️ Panel Admin']);
    if (user.role === 'manager') tautan.push(['/manager', '📊 Dashboard']);
    tautan.push(['/keluar', 'Keluar']);
    var nama = document.createElement('span');
    nama.className = 'nama';
    nama.textContent = '👤 ' + user.nama;
    nav.appendChild(nama);
    tautan.forEach(function (t) {
      var a = document.createElement('a');
      a.href = t[0];
      a.textContent = t[1];
      nav.appendChild(a);
    });
    wadah.insertBefore(nav, wadah.firstChild);
  }

  function pasangTombolChat() {
    var chips = document.getElementById('chips');
    if (!chips || document.getElementById('btn-hubungi-staf')) return;
    var bar = document.createElement('div');
    bar.className = 'chat-extra';
    bar.innerHTML =
      '<button type="button" id="btn-hubungi-staf">👩‍💼 Hubungi staf</button>' +
      '<button type="button" id="btn-rating">⭐ Akhiri &amp; nilai</button>';
    chips.parentNode.insertBefore(bar, chips);

    document.getElementById('btn-hubungi-staf').onclick = function () {
      var btn = this;
      post('/api/chat/eskalasi').then(function (d) {
        btn.classList.remove('sorot');
        botBubble(d.message || 'Gagal menghubungi staf.');
      }).catch(function () { botBubble('Gagal menghubungi staf. Coba lagi ya.'); });
    };

    document.getElementById('btn-rating').onclick = function () {
      var msgs = document.getElementById('chat-messages');
      var div = botBubble('Bagaimana layanan chatbot tadi? Beri nilai 1–5:');
      var bar2 = document.createElement('div');
      bar2.className = 'rating-bar mt-2';
      for (var i = 1; i <= 5; i++) {
        (function (n) {
          var b = document.createElement('button');
          b.type = 'button';
          b.textContent = n;
          b.onclick = function () {
            post('/api/chat/rating', { nilai: n }).then(function (d) {
              bar2.remove();
              botBubble(d.message || 'Gagal menyimpan rating.');
            });
          };
          bar2.appendChild(b);
        })(i);
      }
      div.appendChild(bar2);
      msgs.scrollTop = msgs.scrollHeight;
    };
  }

  fetchAsli('/api/saya').then(function (r) { return r.json(); }).then(function (d) {
    if (!d.user) return;
    // Riwayat chat tersimpan di localStorage browser: bersihkan jika akun berganti
    var pemilik = localStorage.getItem('chat_owner');
    if (pemilik !== String(d.user.id)) {
      localStorage.removeItem('chat_history');
      localStorage.setItem('chat_owner', String(d.user.id));
      if (pemilik !== null) location.reload();
    }
    pasangMenu(d.user);
    if (d.user.role === 'pelanggan') pasangTombolChat();
  }).catch(function () {});
})();
