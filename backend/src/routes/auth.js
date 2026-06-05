const express = require('express');
const bcrypt = require('bcryptjs');
const { getDb } = require('../database');
const { generateToken } = require('../middleware/auth');

const router = express.Router();

router.post('/login', async (req, res) => {
  try {
    const { document_id, password } = req.body;
    if (!document_id || !password) {
      return res.status(400).json({ error: 'Documento y contraseña requeridos' });
    }
    const db = await getDb();
    const result = db.exec(`SELECT id, name, document_id, password FROM users WHERE document_id = ?`, [document_id]);
    if (result.length === 0 || result[0].values.length === 0) {
      return res.status(401).json({ error: 'Documento o contraseña incorrectos' });
    }
    const row = result[0].values[0];
    const user = { id: row[0], name: row[1], document_id: row[2], password: row[3] };

    const valid = bcrypt.compareSync(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: 'Documento o contraseña incorrectos' });
    }

    const token = generateToken(user.id);
    res.json({ token, user: { id: user.id, name: user.name, document_id: user.document_id } });
  } catch (err) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;
