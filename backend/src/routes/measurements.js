const express = require('express');
const { getDb, saveDb } = require('../database');
const { authenticate } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const UPLOADS_DIR = path.join(__dirname, '..', '..', 'uploads', 'measurements');
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, unique + ext);
  }
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

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
      SELECT id, weight, chest, waist, arms, legs, notes, photo1, photo2, photo3, photo4,
             height, neck, shoulders, back, biceps, forearms, wrist,
             mid_abdomen, hips, thigh, mid_thigh, calf, created_at
      FROM measurements WHERE user_id = ? ORDER BY created_at DESC
    `, [uid]);
    const measurements = result.length > 0 ? result[0].values.map(row => ({
      id: row[0], weight: row[1], chest: row[2], waist: row[3],
      arms: row[4], legs: row[5], notes: row[6],
      photo1: row[7], photo2: row[8], photo3: row[9], photo4: row[10],
      height: row[11], neck: row[12], shoulders: row[13], back: row[14],
      biceps: row[15], forearms: row[16], wrist: row[17],
      mid_abdomen: row[18], hips: row[19], thigh: row[20],
      mid_thigh: row[21], calf: row[22], date: row[23]
    })) : [];
    res.json(measurements);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener medidas' });
  }
});

router.post('/', authenticate, upload.fields([
  { name: 'photo1', maxCount: 1 },
  { name: 'photo2', maxCount: 1 },
  { name: 'photo3', maxCount: 1 },
  { name: 'photo4', maxCount: 1 }
]), async (req, res) => {
  try {
    const { weight, chest, waist, arms, legs, notes,
            height, neck, shoulders, back, biceps, forearms, wrist,
            mid_abdomen, hips, thigh, mid_thigh, calf, created_at } = req.body;
    const db = await getDb();
    const uid = await targetUser(req);
    const photo1 = req.files?.photo1 ? '/uploads/measurements/' + req.files.photo1[0].filename : '';
    const photo2 = req.files?.photo2 ? '/uploads/measurements/' + req.files.photo2[0].filename : '';
    const photo3 = req.files?.photo3 ? '/uploads/measurements/' + req.files.photo3[0].filename : '';
    const photo4 = req.files?.photo4 ? '/uploads/measurements/' + req.files.photo4[0].filename : '';
    if (created_at) {
      db.run(`INSERT INTO measurements (user_id, weight, chest, waist, arms, legs, notes, photo1, photo2, photo3, photo4,
              height, neck, shoulders, back, biceps, forearms, wrist, mid_abdomen, hips, thigh, mid_thigh, calf, created_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [uid, weight || 0, chest || 0, waist || 0, arms || 0, legs || 0, notes || '',
         photo1, photo2, photo3, photo4,
         height || 0, neck || 0, shoulders || 0, back || 0, biceps || 0,
         forearms || 0, wrist || 0, mid_abdomen || 0, hips || 0,
         thigh || 0, mid_thigh || 0, calf || 0, created_at]);
    } else {
      db.run(`INSERT INTO measurements (user_id, weight, chest, waist, arms, legs, notes, photo1, photo2, photo3, photo4,
              height, neck, shoulders, back, biceps, forearms, wrist, mid_abdomen, hips, thigh, mid_thigh, calf)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [uid, weight || 0, chest || 0, waist || 0, arms || 0, legs || 0, notes || '',
         photo1, photo2, photo3, photo4,
         height || 0, neck || 0, shoulders || 0, back || 0, biceps || 0,
         forearms || 0, wrist || 0, mid_abdomen || 0, hips || 0,
         thigh || 0, mid_thigh || 0, calf || 0]);
    }
    saveDb();
    res.json({ message: 'Medidas guardadas' });
  } catch (err) {
    res.status(500).json({ error: 'Error al guardar medidas' });
  }
});

router.get('/weight', authenticate, async (req, res) => {
  try {
    const db = await getDb();
    const uid = await targetUser(req);
    const result = db.exec(`
      SELECT weight, created_at FROM measurements
      WHERE user_id = ? AND weight > 0 ORDER BY created_at DESC LIMIT 30
    `, [uid]);
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
    const uid = await targetUser(req);
    db.run(`INSERT INTO measurements (user_id, weight) VALUES (?, ?)`,
      [uid, parseFloat(weight) || 0]);
    saveDb();
    res.json({ message: 'Peso guardado' });
  } catch (err) {
    res.status(500).json({ error: 'Error al guardar peso' });
  }
});

router.delete('/:id', authenticate, async (req, res) => {
  try {
    const db = await getDb();
    const result = db.exec('SELECT user_id, photo1, photo2, photo3, photo4 FROM measurements WHERE id = ?', [req.params.id]);
    if (!result[0]) return res.status(404).json({ error: 'No encontrado' });
    const row = result[0].values[0];
    const ownerId = row[0];
    const uid = await targetUser(req);
    if (uid !== ownerId) return res.status(403).json({ error: 'Sin permiso' });
    for (let i = 1; i <= 4; i++) {
      const p = row[i] ? path.join(__dirname, '..', '..', row[i]) : null;
      if (p && fs.existsSync(p)) fs.unlinkSync(p);
    }
    db.run('DELETE FROM measurements WHERE id = ?', [req.params.id]);
    saveDb();
    res.json({ message: 'Medida eliminada' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar medida' });
  }
});

module.exports = router;
