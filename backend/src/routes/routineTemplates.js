const express = require('express');
const { getDb, saveDb } = require('../database');
const { authenticate } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/admin');

const router = express.Router();
router.use(authenticate, requireAdmin);

const DAY_NAMES = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

function mapExercise(row) {
  return {
    id: row[0], template_id: row[1], day_name: row[2], name: row[3],
    series: row[4], reps: row[5], rest: row[6] || '', observation: row[7] || '', gif_url: row[8] || '',
  };
}

function mapTemplate(row) {
  return { id: row[0], name: row[1], description: row[2] || '' };
}

// GET all templates
router.get('/', async (req, res) => {
  try {
    const db = await getDb();
    const result = db.exec(`SELECT id, name, description FROM routine_templates ORDER BY id`);
    const templates = result.length > 0 ? result[0].values.map(mapTemplate) : [];
    res.json(templates);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener plantillas' });
  }
});

// GET single template with exercises
router.get('/:id', async (req, res) => {
  try {
    const db = await getDb();
    const tResult = db.exec(`SELECT id, name, description FROM routine_templates WHERE id = ?`, [req.params.id]);
    if (tResult.length === 0 || tResult[0].values.length === 0) {
      return res.status(404).json({ error: 'Plantilla no encontrada' });
    }
    const template = mapTemplate(tResult[0].values[0]);
    const eResult = db.exec(`SELECT * FROM routine_template_exercises WHERE template_id = ?`, [req.params.id]);
    template.exercises = eResult.length > 0 ? eResult[0].values.map(mapExercise) : [];
    res.json(template);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener plantilla' });
  }
});

// POST create template
router.post('/', async (req, res) => {
  try {
    const { name, description, exercises } = req.body;
    if (!name) return res.status(400).json({ error: 'El nombre es requerido' });
    const db = await getDb();
    db.run(`INSERT INTO routine_templates (name, description) VALUES (?, ?)`, [name, description || '']);
    saveDb();
    const result = db.exec(`SELECT last_insert_rowid()`);
    const templateId = result[0].values[0][0];

    if (exercises && exercises.length > 0) {
      for (const ex of exercises) {
        db.run(`INSERT INTO routine_template_exercises (template_id, day_name, name, series, reps, rest, observation, gif_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [templateId, ex.day_name, ex.name, parseInt(ex.series) || 0, parseInt(ex.reps) || 0, ex.rest || '', ex.observation || '', ex.gif_url || '']);
      }
      saveDb();
    }

    res.json({ message: 'Plantilla creada', id: templateId });
  } catch (err) {
    res.status(500).json({ error: 'Error al crear plantilla' });
  }
});

// PUT update template
router.put('/:id', async (req, res) => {
  try {
    const { name, description, exercises } = req.body;
    const db = await getDb();
    db.run(`UPDATE routine_templates SET name = ?, description = ? WHERE id = ?`, [name, description || '', req.params.id]);

    if (exercises) {
      db.run(`DELETE FROM routine_template_exercises WHERE template_id = ?`, [req.params.id]);
      for (const ex of exercises) {
        db.run(`INSERT INTO routine_template_exercises (template_id, day_name, name, series, reps, rest, observation, gif_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [req.params.id, ex.day_name, ex.name, parseInt(ex.series) || 0, parseInt(ex.reps) || 0, ex.rest || '', ex.observation || '', ex.gif_url || '']);
      }
    }
    saveDb();
    res.json({ message: 'Plantilla actualizada' });
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar plantilla' });
  }
});

// DELETE template
router.delete('/:id', async (req, res) => {
  try {
    const db = await getDb();
    db.run(`DELETE FROM routine_template_exercises WHERE template_id = ?`, [req.params.id]);
    db.run(`DELETE FROM routine_templates WHERE id = ?`, [req.params.id]);
    saveDb();
    res.json({ message: 'Plantilla eliminada' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar plantilla' });
  }
});

// POST assign template to user
router.post('/:id/assign', async (req, res) => {
  try {
    const { user_id } = req.body;
    if (!user_id) return res.status(400).json({ error: 'user_id es requerido' });
    const db = await getDb();

    const tResult = db.exec(`SELECT id, name, description FROM routine_templates WHERE id = ?`, [req.params.id]);
    if (tResult.length === 0 || tResult[0].values.length === 0) {
      return res.status(404).json({ error: 'Plantilla no encontrada' });
    }

    const eResult = db.exec(`SELECT * FROM routine_template_exercises WHERE template_id = ?`, [req.params.id]);
    const exercises = eResult.length > 0 ? eResult[0].values : [];

    if (exercises.length === 0) {
      return res.status(400).json({ error: 'La plantilla no tiene ejercicios' });
    }

    // Get template days used
    const dayNames = [...new Set(exercises.map(ex => ex[2]))];

    // Delete existing routines for these days for the user
    for (const dayName of dayNames) {
      const existing = db.exec(`SELECT id FROM routines WHERE user_id = ? AND day_name = ?`, [user_id, dayName]);
      if (existing.length > 0 && existing[0].values.length > 0) {
        const routineId = existing[0].values[0][0];
        db.run(`DELETE FROM exercise_results WHERE exercise_id IN (SELECT id FROM exercises WHERE routine_id = ?)`, [routineId]);
        db.run(`DELETE FROM exercises WHERE routine_id = ?`, [routineId]);
        db.run(`DELETE FROM routines WHERE id = ?`, [routineId]);
      }
    }

    // Create copy
    for (const dayName of dayNames) {
      db.run(`INSERT INTO routines (user_id, day_name, day_label) VALUES (?, ?, ?)`, [user_id, dayName, dayName]);
      const rResult = db.exec(`SELECT last_insert_rowid()`);
      const newRoutineId = rResult[0].values[0][0];

      const dayExercises = exercises.filter(ex => ex[2] === dayName);
      for (const ex of dayExercises) {
        db.run(`INSERT INTO exercises (routine_id, name, series, reps, rest, observation, gif_url) VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [newRoutineId, ex[3], ex[4], ex[5], ex[6] || '', ex[7] || '', ex[8] || '']);
      }
    }
    saveDb();

    res.json({ message: `Plantilla asignada a ${dayNames.length} día(s)` });
  } catch (err) {
    res.status(500).json({ error: 'Error al asignar plantilla' });
  }
});

module.exports = router;
