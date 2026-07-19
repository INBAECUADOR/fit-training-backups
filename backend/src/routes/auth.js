const express = require('express');
const bcrypt = require('bcryptjs');
const rateLimit = require('express-rate-limit');
const { getDb, saveDb } = require('../database');
const { generateToken, generateRefreshToken } = require('../middleware/auth');

const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Demasiados intentos. Espera 15 minutos.' },
  standardHeaders: true, legacyHeaders: false,
});

function auditLog(db, credential, success, ip) {
  db.run(`INSERT INTO login_attempts (credential, success, ip, created_at) VALUES (?, ?, ?, datetime('now'))`,
    [credential, success ? 1 : 0, ip || '']);
}

function isLocked(db, credential, ip) {
  const since = new Date(Date.now() - 15 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' ');
  const recent = db.exec(`SELECT COUNT(*) FROM login_attempts WHERE credential = ? AND success = 0 AND created_at >= ?`, [credential, since]);
  const attempts = recent.length ? recent[0].values[0][0] : 0;
  if (attempts >= 5) return true;
  if (!ip) return false;
  const ipAttempts = db.exec(`SELECT COUNT(*) FROM login_attempts WHERE ip = ? AND success = 0 AND created_at >= ?`, [ip, since]);
  const ipCount = ipAttempts.length ? ipAttempts[0].values[0][0] : 0;
  return ipCount >= 20;
}

function validatePassword(password) {
  if (!password || password.length < 6) return 'La contraseña debe tener al menos 6 caracteres';
  return null;
}

router.post('/login', loginLimiter, async (req, res) => {
  try {
    const { document_id, password, email } = req.body;
    const credential = email || document_id;
    const ip = req.ip || req.connection?.remoteAddress || '';
    if (!credential || !password) {
      return res.status(400).json({ error: 'Email/documento y contraseña requeridos' });
    }
    const db = await getDb();

    if (isLocked(db, credential, ip)) {
      auditLog(db, credential, false, ip);
      saveDb();
      return res.status(429).json({ error: 'Cuenta temporalmente bloqueada por muchos intentos. Espera 15 minutos.' });
    }

    let userRow = null;
    if (credential.includes('@')) {
      const result = db.exec(`SELECT id, name, document_id, email, password, role, membership_end_date, membership_start_date, avatar_url FROM users WHERE email = ?`, [credential]);
      if (result.length > 0 && result[0].values.length > 0) userRow = result[0].values[0];
    }
    if (!userRow) {
      const result = db.exec(`SELECT id, name, document_id, email, password, role, membership_end_date, membership_start_date, avatar_url FROM users WHERE document_id = ?`, [credential]);
      if (result.length > 0 && result[0].values.length > 0) userRow = result[0].values[0];
    }

    if (!userRow) {
      auditLog(db, credential, false, ip);
      saveDb();
      return res.status(401).json({ error: 'Email/documento o contraseña incorrectos' });
    }

    const user = { id: userRow[0], name: userRow[1], document_id: userRow[2], email: userRow[3], password: userRow[4], role: userRow[5], membership_end_date: userRow[6] || '', membership_start_date: userRow[7] || '', avatar_url: userRow[8] || '' };

    const valid = bcrypt.compareSync(password, user.password);
    if (!valid) {
      auditLog(db, credential, false, ip);
      saveDb();
      return res.status(401).json({ error: 'Email/documento o contraseña incorrectos' });
    }

    auditLog(db, credential, true, ip);
    saveDb();

    const token = generateToken(user.id);
    const refreshToken = generateRefreshToken(user.id);
    res.json({ token, refreshToken, user: { id: user.id, name: user.name, document_id: user.document_id, email: user.email, role: user.role, membership_end_date: user.membership_end_date, membership_start_date: user.membership_start_date, avatar_url: user.avatar_url } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken: token } = req.body;
    if (!token) return res.status(400).json({ error: 'Refresh token requerido' });
    const jwt = require('jsonwebtoken');
    const { JWT_SECRET } = require('../middleware/auth');
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.type !== 'refresh') return res.status(401).json({ error: 'Token inválido' });
    const db = await getDb();
    const result = db.exec(`SELECT id, name, document_id, email, role, membership_end_date, membership_start_date, avatar_url FROM users WHERE id = ?`, [decoded.id]);
    if (!result.length || !result[0].values.length) return res.status(404).json({ error: 'Usuario no encontrado' });
    const row = result[0].values[0];
    const user = { id: row[0], name: row[1], document_id: row[2], email: row[3], role: row[4], membership_end_date: row[5] || '', membership_start_date: row[6] || '', avatar_url: row[7] || '' };
    const newToken = generateToken(user.id);
    const newRefresh = generateRefreshToken(user.id);
    res.json({ token: newToken, refreshToken: newRefresh, user });
  } catch { return res.status(401).json({ error: 'Refresh token inválido o expirado' }); }
});

router.put('/password', async (req, res) => {
  try {
    const { document_id, current_password, new_password } = req.body;
    if (!document_id || !current_password || !new_password) {
      return res.status(400).json({ error: 'document_id, current_password y new_password son requeridos' });
    }
    const pwErr = validatePassword(new_password);
    if (pwErr) return res.status(400).json({ error: pwErr });
    const db = await getDb();
    const result = db.exec(`SELECT id, password FROM users WHERE document_id = ?`, [document_id]);
    if (!result.length || !result[0].values.length) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    const [userId, currentHash] = result[0].values[0];
    if (!bcrypt.compareSync(current_password, currentHash)) {
      return res.status(401).json({ error: 'Contraseña actual incorrecta' });
    }
    const newHash = bcrypt.hashSync(new_password, 10);
    db.run(`UPDATE users SET password = ? WHERE id = ?`, [newHash, userId]);
    saveDb();
    res.json({ message: 'Contraseña actualizada correctamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;
