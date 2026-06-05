const express = require('express');
const { getDb } = require('../database');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.get('/results', authenticate, async (req, res) => {
  try {
    const db = await getDb();
    const result = db.exec(`
      SELECT e.name, er.weight, er.repetitions, er.time, er.observation, er.created_at
      FROM exercise_results er
      JOIN exercises e ON er.exercise_id = e.id
      WHERE er.user_id = ?
      ORDER BY er.created_at DESC
    `, [req.userId]);

    const rows = result.length > 0 ? result[0].values : [];
    let csv = 'Ejercicio,Peso (kg),Repeticiones,Tiempo,Observacion,Fecha\n';
    for (const r of rows) {
      const escaped = r.map(v => {
        const s = String(v ?? '');
        return s.includes(',') || s.includes('"') ? `"${s.replace(/"/g, '""')}"` : s;
      });
      csv += escaped.join(',') + '\n';
    }

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename=resultados.csv');
    res.send('\uFEFF' + csv);
  } catch (err) {
    res.status(500).json({ error: 'Error al exportar' });
  }
});

router.get('/measurements', authenticate, async (req, res) => {
  try {
    const db = await getDb();
    const result = db.exec(`
      SELECT weight, chest, waist, arms, legs, notes, created_at
      FROM measurements WHERE user_id = ? ORDER BY created_at DESC
    `, [req.userId]);

    const rows = result.length > 0 ? result[0].values : [];
    let csv = 'Peso (kg),Pecho (cm),Cintura (cm),Brazos (cm),Piernas (cm),Notas,Fecha\n';
    for (const r of rows) {
      const escaped = r.map(v => {
        const s = String(v ?? '');
        return s.includes(',') || s.includes('"') ? `"${s.replace(/"/g, '""')}"` : s;
      });
      csv += escaped.join(',') + '\n';
    }

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename=mediciones.csv');
    res.send('\uFEFF' + csv);
  } catch (err) {
    res.status(500).json({ error: 'Error al exportar' });
  }
});

module.exports = router;