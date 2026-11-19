const db = require('../config/database');

const findByEmail = async (email) => {
  const [rows] = await db.query('SELECT * FROM pengguna WHERE email = ?', [String(email).toLowerCase().trim()]);
  return rows[0];
};

const findById = async (id) => {
  const [rows] = await db.query('SELECT * FROM pengguna WHERE id = ?', [Number(id)]);
  return rows[0];
};

const create = async ({ nama, email, passwordHash, role }) => {
  const [result] = await db.query(
    'INSERT INTO pengguna (nama, email, password_hash, role) VALUES (?, ?, ?, ?)',
    [String(nama).trim(), String(email).toLowerCase().trim(), passwordHash, role]
  );
  return result.insertId;
};

const listByRole = async (role) => {
  const [rows] = await db.query('SELECT id, nama, email FROM pengguna WHERE role = ? ORDER BY nama', [role]);
  return rows;
};

module.exports = { findByEmail, findById, create, listByRole };
