const express = require('express');
const { getDb } = require('../database');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticate, async (req, res) => {
  try {
    const db = await getDb();
    const userId = req.userId;

    const result = db.exec(`
      SELECT e.id, e.name, r.day_name, r.day_label,
             MAX(er.weight) as best_weight,
             MAX(er.repetitions) as best_reps,
             COUNT(er.id) as total_logs,
             (SELECT created_at FROM exercise_results
              WHERE exercise_id = e.id AND user_id = ?
              ORDER BY weight DESC, created_at DESC LIMIT 1) as achieved_at
      FROM exercises e
      JOIN exercise_results er ON e.id = er.exercise_id
      JOIN routines r ON e.routine_id = r.id
      WHERE er.user_id = ?
      GROUP BY e.id
      ORDER BY best_weight DESC
    `, [userId, userId]);

    const prs = result.length > 0
      ? result[0].values.map(row => ({
          exercise_id: row[0], exercise_name: row[1], day_name: row[2], day_label: row[3],
          best_weight: row[4], best_reps: row[5], total_logs: row[6], achieved_at: row[7],
        }))
      : [];

    res.json(prs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener records personales' });
  }
});

module.exports = router;
