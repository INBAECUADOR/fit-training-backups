const express = require('express');
const { getDb, saveDb } = require('../database');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticate, async (req, res) => {
  try {
    const db = await getDb();
    const result = db.exec(`
      SELECT id, weight, chest, waist, arms, legs, notes, created_at
      FROM measurements WHERE user_id = ? ORDER BY created_at DESC
    `, [req.userId]);
    const measurements = result.length > 0 ? result[0].values.map(row => ({
      id: row[0], weight: row[1], chest: row[2], waist: row[3],
      arms: row[4], legs: row[5], notes: row[6], date: row[7]
    })) : [];
    res.json(measurements);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener medidas' });
  }
});

router.post('/', authenticate, async (req, res) => {
  try {
    const { weight, chest, waist, arms, legs, notes } = req.body;
    const db = await getDb();
    db.run(`INSERT INTO measurements (user_id, weight, chest, waist, arms, legs, notes) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [req.userId, weight || 0, chest || 0, waist || 0, arms || 0, legs || 0, notes || '']);
    saveDb();
    res.json({ message: 'Medidas guardadas' });
  } catch (err) {
    res.status(500).json({ error: 'Error al guardar medidas' });
  }
});

router.get('/weight', authenticate, async (req, res) => {
  try {
    const db = await getDb();
    const result = db.exec(`
      SELECT weight, created_at FROM measurements
      WHERE user_id = ? AND weight > 0 ORDER BY created_at DESC LIMIT 30
    `, [req.userId]);
    const weights = result.length > 0
      ? result[0].values.map(row => ({ weight: row[0], date: row[1] })) : [];
    res.json(weights);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener peso' });
  }
});

router.post('/weight', authenticate, async (req, res) => {
  try {
    const { weight } = req.body;
    if (!weight) return res.status(400).json({ error: 'Peso requerido' });
    const db = await getDb();
    db.run(`INSERT INTO measurements (user_id, weight) VALUES (?, ?)`,
      [req.userId, parseFloat(weight) || 0]);
    saveDb();
    res.json({ message: 'Peso guardado' });
  } catch (err) {
    res.status(500).json({ error: 'Error al guardar peso' });
  }
});

module.exports = router;
