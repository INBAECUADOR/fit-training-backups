const express = require('express');
const bcrypt = require('bcryptjs');
const { getDb } = require('../database');
const { generateToken } = require('../middleware/auth');

const router = express.Router();

router.post('/login', async (req, res) => {
  try {
    const { document_id, password, email } = req.body;
    const credential = email || document_id;
    if (!credential || !password) {
      return res.status(400).json({ error: 'Email/documento y contraseña requeridos' });
    }
    const db = await getDb();

    let userRow = null;
    if (credential.includes('@')) {
      const result = db.exec(`SELECT id, name, document_id, email, password, role, membership_end_date, membership_start_date FROM users WHERE email = ?`, [credential]);
      if (result.length > 0 && result[0].values.length > 0) userRow = result[0].values[0];
    }
    if (!userRow) {
      const result = db.exec(`SELECT id, name, document_id, email, password, role, membership_end_date, membership_start_date FROM users WHERE document_id = ?`, [credential]);
      if (result.length > 0 && result[0].values.length > 0) userRow = result[0].values[0];
    }

    if (!userRow) {
      return res.status(401).json({ error: 'Email/documento o contraseña incorrectos' });
    }

    const user = { id: userRow[0], name: userRow[1], document_id: userRow[2], email: userRow[3], password: userRow[4], role: userRow[5], membership_end_date: userRow[6] || '', membership_start_date: userRow[7] || '' };

    const valid = bcrypt.compareSync(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: 'Email/documento o contraseña incorrectos' });
    }

    const token = generateToken(user.id);
    res.json({ token, user: { id: user.id, name: user.name, document_id: user.document_id, email: user.email, role: user.role, membership_end_date: user.membership_end_date, membership_start_date: user.membership_start_date } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;
