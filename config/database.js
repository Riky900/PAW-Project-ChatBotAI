const mysql = require('mysql2/promise');

// Membuat connection pool ke MySQL XAMPP
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',      // User default XAMPP
    password: '',      // Password default XAMPP kosong
    database: 'db_chatbot_paw',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Cek koneksi saat server dijalankan
pool.getConnection()
    .then(connection => {
        console.log('Berhasil terhubung ke MySQL XAMPP!');
        connection.release();
    })
    .catch(err => {
        console.error('Gagal terhubung ke database:', err.message);
    });

module.exports = pool;