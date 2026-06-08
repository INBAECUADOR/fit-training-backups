const express = require('express');
const { getDb } = require('../database');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticate, async (req, res) => {
  try {
    const db = await getDb();
    const result = db.exec(`SELECT id, day_name, day_label FROM routines WHERE user_id = ? ORDER BY id`, [req.userId]);
    const routines = result.length > 0 ? result[0].values.map(row => ({
      id: row[0], day_name: row[1], day_label: row[2]
    })) : [];
    res.json(routines);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener rutinas' });
  }
});

router.get('/:dayName', authenticate, async (req, res) => {
  try {
    const db = await getDb();
    const result = db.exec(`
      SELECT e.id, e.name, e.series, e.reps, e.observation, e.gif_url, e.rest
      FROM exercises e
      JOIN routines r ON e.routine_id = r.id
      WHERE r.user_id = ? AND r.day_name = ?
      ORDER BY e.id
    `, [req.userId, req.params.dayName]);

    const exercises = result.length > 0 ? result[0].values.map(row => ({
      id: row[0], name: row[1], series: row[2], reps: row[3],
      observation: row[4],
      gifUrl: row[5] ? (row[5].includes('://') ? row[5] : `https://adminweb.blob.core.windows.net/gym1/${row[5]}.gif`) : '',
      rest: row[6] || '',
    })) : [];

    res.json(exercises);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener ejercicios' });
  }
});

router.post('/result', authenticate, async (req, res) => {
  try {
    const { exercise_id, weight, time, repetitions, observation } = req.body;
    const db = await getDb();
    db.run(`INSERT INTO exercise_results (user_id, exercise_id, weight, time, repetitions, observation) VALUES (?, ?, ?, ?, ?, ?)`,
      [req.userId, exercise_id, weight || 0, time || '', repetitions || 0, observation || '']);
    const { saveDb } = require('../database');
    saveDb();
    res.json({ message: 'Resultado guardado' });
  } catch (err) {
    res.status(500).json({ error: 'Error al guardar resultado' });
  }
});

router.get('/results/:exerciseId', authenticate, async (req, res) => {
  try {
    const db = await getDb();
    const result = db.exec(`
      SELECT id, weight, time, repetitions, observation, created_at
      FROM exercise_results
      WHERE user_id = ? AND exercise_id = ?
      ORDER BY created_at DESC
    `, [req.userId, req.params.exerciseId]);

    const results = result.length > 0 ? result[0].values.map(row => ({
      id: row[0], weight: row[1], time: row[2], repetitions: row[3],
      observation: row[4], created_at: row[5]
    })) : [];

    res.json(results);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener resultados' });
  }
});

router.get('/suggest/:exerciseId', authenticate, async (req, res) => {
  try {
    const db = await getDb();
    const exerciseId = req.params.exerciseId;

    const exResult = db.exec(`SELECT name, series, reps FROM exercises WHERE id = ?`, [exerciseId]);
    if (exResult.length === 0 || exResult[0].values.length === 0) {
      return res.status(404).json({ error: 'Ejercicio no encontrado' });
    }
    const [exName, targetSeries, targetReps] = exResult[0].values[0];

    const results = db.exec(`
      SELECT weight, repetitions, created_at FROM exercise_results
      WHERE user_id = ? AND exercise_id = ?
      ORDER BY created_at DESC LIMIT 10
    `, [req.userId, exerciseId]);

    let suggestion = { weight: null, reps: targetReps, reason: '', recommended: false };

    if (results.length > 0 && results[0].values.length > 0) {
      const vals = results[0].values.map(r => ({ weight: r[0], reps: r[1], date: r[2] }));
      const last = vals[0];

      const bestWeight = Math.max(...vals.map(v => v.weight));
      const bestReps = Math.max(...vals.filter(v => v.weight === bestWeight).map(v => v.reps));
      const avgWeight = vals.reduce((s, v) => s + v.weight, 0) / vals.length;
      const recentAvgReps = vals.slice(0, 3).reduce((s, v) => s + v.reps, 0) / Math.min(3, vals.length);

      const completedAllReps = recentAvgReps >= targetReps;

      if (completedAllReps && last.weight > 0) {
        const increment = last.weight >= 60 ? 5 : 2.5;
        suggestion.weight = Math.round((last.weight + increment) * 2) / 2;
        suggestion.reason = `Completaste las ${targetReps} reps. Probá subir a ${suggestion.weight}kg`;
        suggestion.recommended = true;
      } else if (last.weight > 0) {
        suggestion.weight = last.weight;
        suggestion.reason = `Intentá llegar a las ${targetReps} reps con ${last.weight}kg`;
        suggestion.recommended = false;
      }

      suggestion = {
        ...suggestion,
        lastWeight: last.weight,
        lastReps: last.reps,
        bestWeight,
        bestReps,
        totalLogs: vals.length,
        exerciseName: exName,
      };
    } else {
      suggestion = {
        weight: null,
        reps: targetReps,
        reason: 'Registrá tu primer resultado para recibir sugerencias',
        recommended: false,
        lastWeight: 0,
        lastReps: 0,
        bestWeight: 0,
        bestReps: 0,
        totalLogs: 0,
        exerciseName: exName,
      };
    }

    res.json(suggestion);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al generar sugerencia' });
  }
});

module.exports = router;
