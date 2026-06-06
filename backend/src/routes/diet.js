const express = require('express');
const { getDb, saveDb } = require('../database');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

async function targetUser(req) {
  if (req.query.user_id) {
    const uid = parseInt(req.query.user_id);
    const db = await getDb();
    const result = db.exec(`SELECT role FROM users WHERE id = ?`, [req.userId]);
    const role = result.length > 0 ? result[0].values[0][0] : 'user';
    if (role === 'admin') return uid;
  }
  return req.userId;
}

router.get('/', authenticate, async (req, res) => {
  try {
    const db = await getDb();
    const uid = await targetUser(req);
    const result = db.exec(`
      SELECT day_name, meal_type, description FROM diets
      WHERE user_id = ? ORDER BY day_name, meal_type
    `, [uid]);
    const rows = result.length > 0 ? result[0].values : [];
    const meals = {};
    for (const [day, type, desc] of rows) {
      if (!meals[day]) meals[day] = {};
      meals[day][type] = desc;
    }
    res.json(meals);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener dieta' });
  }
});

router.put('/', authenticate, async (req, res) => {
  try {
    const db = await getDb();
    const uid = await targetUser(req);
    const meals = req.body;
    db.run(`DELETE FROM diets WHERE user_id = ?`, [uid]);
    for (const [day, types] of Object.entries(meals)) {
      for (const [mealType, description] of Object.entries(types)) {
        if (description.trim()) {
          db.run(`INSERT INTO diets (user_id, day_name, meal_type, description) VALUES (?, ?, ?, ?)`,
            [uid, day, mealType, description]);
        }
      }
    }
    saveDb();
    res.json({ message: 'Dieta guardada' });
  } catch (err) {
    res.status(500).json({ error: 'Error al guardar dieta' });
  }
});

module.exports = router;
