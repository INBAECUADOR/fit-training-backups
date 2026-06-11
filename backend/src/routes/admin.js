const express = require('express');
const bcrypt = require('bcryptjs');
const { getDb, saveDb } = require('../database');
const { authenticate } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/admin');

const router = express.Router();
router.use(authenticate, requireAdmin);

function targetUser(req) {
  return parseInt(req.query.user_id) || req.userId;
}

// --- USERS ---

router.get('/users', async (req, res) => {
  try {
    const db = await getDb();
    const result = db.exec(`SELECT id, document_id, email, name, role, membership_end_date, membership_start_date, avatar_url FROM users ORDER BY id`);
    const users = result.length > 0 ? result[0].values.map(row => ({
      id: row[0], document_id: row[1], email: row[2], name: row[3], role: row[4], membership_end_date: row[5] || '', membership_start_date: row[6] || '', avatar_url: row[7] || '',
    })) : [];
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
});

router.post('/users', async (req, res) => {
  try {
    const { document_id, email, name, password, membership_start_date, membership_end_date } = req.body;
    if (!document_id || !name || !password) return res.status(400).json({ error: 'document_id, name y password son requeridos' });
    const db = await getDb();
    const existing = db.exec(`SELECT id FROM users WHERE document_id = ?`, [document_id]);
    if (existing.length > 0 && existing[0].values.length > 0) {
      return res.status(400).json({ error: 'Ya existe un usuario con ese documento' });
    }
    const hashed = bcrypt.hashSync(password, 10);
    db.run(`INSERT INTO users (document_id, email, name, password, role, membership_start_date, membership_end_date) VALUES (?, ?, ?, ?, 'user', ?, ?)`,
      [document_id, email || '', name, hashed, membership_start_date || '', membership_end_date || '']);
    saveDb();
    const res2 = db.exec(`SELECT id FROM users WHERE document_id = ?`, [document_id]);
    const newId = res2[0].values[0][0];

    const routines = [
      { day: 'Lunes', label: 'Día 1' }, { day: 'Martes', label: 'Día 2' },
      { day: 'Miércoles', label: 'Día 3' }, { day: 'Jueves', label: 'Día 4' }, { day: 'Viernes', label: 'Día 5' },
    ];
    for (const r of routines) {
      db.run(`INSERT INTO routines (user_id, day_name, day_label) VALUES (?, ?, ?)`, [newId, r.day, r.label]);
    }
    saveDb();
    res.json({ message: 'Usuario creado con rutinas vacías', id: newId });
  } catch (err) {
    res.status(500).json({ error: 'Error al crear usuario' });
  }
});

router.put('/users/:id', async (req, res) => {
  try {
    const { document_id, email, name, password, membership_start_date, membership_end_date } = req.body;
    const db = await getDb();
    let sql = 'UPDATE users SET document_id = ?, email = ?, name = ?, membership_start_date = ?, membership_end_date = ?';
    const params = [document_id || '', email || '', name || '', membership_start_date || '', membership_end_date || ''];
    if (password) {
      const hashed = bcrypt.hashSync(password, 10);
      sql += ', password = ?';
      params.push(hashed);
    }
    sql += ' WHERE id = ?';
    params.push(req.params.id);
    db.run(sql, params);
    saveDb();
    res.json({ message: 'Usuario actualizado' });
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar usuario' });
  }
});

router.delete('/users/:id', async (req, res) => {
  try {
    const id = req.params.id;
    if (id == 1) return res.status(400).json({ error: 'No se puede eliminar al administrador principal' });
    const db = await getDb();
    const routines = db.exec(`SELECT id FROM routines WHERE user_id = ?`, [id]);
    if (routines.length > 0) {
      for (const row of routines[0].values) {
        db.run(`DELETE FROM exercise_results WHERE exercise_id IN (SELECT id FROM exercises WHERE routine_id = ?)`, [row[0]]);
        db.run(`DELETE FROM exercises WHERE routine_id = ?`, [row[0]]);
      }
      db.run(`DELETE FROM routines WHERE user_id = ?`, [id]);
    }
    db.run(`DELETE FROM diets WHERE user_id = ?`, [id]);
    db.run(`DELETE FROM measurements WHERE user_id = ?`, [id]);
    db.run(`DELETE FROM users WHERE id = ?`, [id]);
    saveDb();
    res.json({ message: 'Usuario y todos sus datos eliminados' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar usuario' });
  }
});

// --- ROUTINES ---

router.get('/routines', async (req, res) => {
  try {
    const db = await getDb();
    const uid = targetUser(req);
    const result = db.exec(`SELECT id, day_name, day_label FROM routines WHERE user_id = ? ORDER BY id`, [uid]);
    const routines = result.length > 0 ? result[0].values.map(r => ({ id: r[0], day_name: r[1], day_label: r[2] })) : [];
    res.json(routines);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener rutinas' });
  }
});

router.put('/routines/:id', async (req, res) => {
  try {
    const { day_label } = req.body;
    const db = await getDb();
    db.run(`UPDATE routines SET day_label = ? WHERE id = ?`, [day_label, req.params.id]);
    saveDb();
    res.json({ message: 'Rutina actualizada' });
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar rutina' });
  }
});

// --- EXERCISES ---

router.get('/exercises', async (req, res) => {
  try {
    const db = await getDb();
    const uid = targetUser(req);
    const result = db.exec(`
      SELECT e.id, e.name, e.series, e.reps, e.observation, e.gif_url, e.rest, e.routine_id, r.day_name, r.day_label
      FROM exercises e
      JOIN routines r ON e.routine_id = r.id
      WHERE r.user_id = ?
      ORDER BY r.id, e.id
    `, [uid]);
    const exercises = result.length > 0 ? result[0].values.map(row => ({
      id: row[0], name: row[1], series: row[2], reps: row[3],
      observation: row[4], gif_url: row[5], rest: row[6] || '',
      routine_id: row[7], day_name: row[8], day_label: row[9],
    })) : [];
    res.json(exercises);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener ejercicios' });
  }
});

router.post('/exercises', async (req, res) => {
  try {
    const { routine_id, name, series, reps, rest, observation, gif_url, global_exercise_id } = req.body;
    if (!routine_id || !name) return res.status(400).json({ error: 'routine_id y name son requeridos' });
    const db = await getDb();
    db.run(`INSERT INTO exercises (routine_id, name, series, reps, rest, observation, gif_url, global_exercise_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [routine_id, name, series || 0, reps || 0, rest || '', observation || '', gif_url || '', global_exercise_id || null]);
    saveDb();
    res.json({ message: 'Ejercicio creado' });
  } catch (err) {
    res.status(500).json({ error: 'Error al crear ejercicio' });
  }
});

router.put('/exercises/:id', async (req, res) => {
  try {
    const { name, series, reps, rest, observation, gif_url } = req.body;
    const db = await getDb();
    db.run(`UPDATE exercises SET name = ?, series = ?, reps = ?, rest = ?, observation = ?, gif_url = ? WHERE id = ?`,
      [name, series || 0, reps || 0, rest || '', observation || '', gif_url || '', req.params.id]);
    saveDb();
    res.json({ message: 'Ejercicio actualizado' });
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar ejercicio' });
  }
});

router.delete('/exercises/:id', async (req, res) => {
  try {
    const db = await getDb();
    db.run(`DELETE FROM exercise_results WHERE exercise_id = ?`, [req.params.id]);
    db.run(`DELETE FROM exercises WHERE id = ?`, [req.params.id]);
    saveDb();
    res.json({ message: 'Ejercicio eliminado' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar ejercicio' });
  }
});

// --- GLOBAL EXERCISES CATALOG ---

router.get('/global-exercises', async (req, res) => {
  try {
    const db = await getDb();
    const { search, group } = req.query;
    let sql = 'SELECT id, name, muscle_group, description, gif_url, name_es FROM global_exercises';
    const params = [];
    const conditions = [];
    if (search) { conditions.push('(name LIKE ? OR name_es LIKE ?)'); params.push(`%${search}%`, `%${search}%`); }
    if (group) { conditions.push('muscle_group = ?'); params.push(group); }
    if (conditions.length > 0) sql += ' WHERE ' + conditions.join(' AND ');
    sql += ' ORDER BY muscle_group, name';
    const result = db.exec(sql, params);
    const exercises = result.length > 0 ? result[0].values.map(row => ({
      id: row[0], name: row[1], muscle_group: row[2], description: row[3], gif_url: row[4], name_es: row[5],
    })) : [];
    res.json(exercises);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener catálogo' });
  }
});

router.post('/global-exercises', async (req, res) => {
  try {
    const { name, name_es, muscle_group, description, gif_url } = req.body;
    if (!name || !muscle_group) return res.status(400).json({ error: 'name y muscle_group son requeridos' });
    const db = await getDb();
    db.run(`INSERT INTO global_exercises (name, name_es, muscle_group, description, gif_url) VALUES (?, ?, ?, ?, ?)`,
      [name, name_es || '', muscle_group, description || '', gif_url || '']);
    saveDb();
    res.json({ message: 'Ejercicio global creado' });
  } catch (err) {
    res.status(500).json({ error: 'Error al crear ejercicio global' });
  }
});

router.put('/global-exercises/:id', async (req, res) => {
  try {
    const { name, name_es, muscle_group, description, gif_url } = req.body;
    const db = await getDb();
    db.run(`UPDATE global_exercises SET name = ?, name_es = ?, muscle_group = ?, description = ?, gif_url = ? WHERE id = ?`,
      [name, name_es || '', muscle_group || '', description || '', gif_url || '', req.params.id]);
    saveDb();
    res.json({ message: 'Ejercicio global actualizado' });
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar ejercicio global' });
  }
});

router.delete('/global-exercises/:id', async (req, res) => {
  try {
    const db = await getDb();
    db.run(`UPDATE exercises SET global_exercise_id = NULL WHERE global_exercise_id = ?`, [req.params.id]);
    db.run(`DELETE FROM global_exercises WHERE id = ?`, [req.params.id]);
    saveDb();
    res.json({ message: 'Ejercicio global eliminado' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar ejercicio global' });
  }
});

router.get('/api-key', async (req, res) => {
  try {
    const db = await getDb();
    const r = db.exec('SELECT value FROM config WHERE key = ?', ['openrouter_api_key']);
    res.json({ configured: !!(process.env.OPENROUTER_API_KEY || (r.length && r[0].values.length)) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/api-key', async (req, res) => {
  try {
    const { key } = req.body;
    if (!key) return res.status(400).json({ error: 'API key requerida' });
    const db = await getDb();
    db.run('INSERT OR REPLACE INTO config (key, value) VALUES (?, ?)', ['openrouter_api_key', key]);
    saveDb();
    res.json({ message: 'API key guardada' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- MOTIVATIONAL QUOTES ---

router.get('/motivation', async (req, res) => {
  try {
    const db = await getDb();
    const r = db.exec('SELECT id, text, author FROM motivational_quotes ORDER BY id');
    const quotes = r.length > 0 ? r[0].values.map(row => ({ id: row[0], text: row[1], author: row[2] })) : [];
    res.json(quotes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/motivation', async (req, res) => {
  try {
    const { text, author } = req.body;
    if (!text) return res.status(400).json({ error: 'El texto es requerido' });
    const db = await getDb();
    db.run('INSERT INTO motivational_quotes (text, author) VALUES (?, ?)', [text, author || '']);
    saveDb();
    res.json({ message: 'Frase guardada' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/motivation/:id', async (req, res) => {
  try {
    const db = await getDb();
    db.run('DELETE FROM motivational_quotes WHERE id = ?', [req.params.id]);
    saveDb();
    res.json({ message: 'Frase eliminada' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
