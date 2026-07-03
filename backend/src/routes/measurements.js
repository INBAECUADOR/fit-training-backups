const express = require('express');
const { getDb, saveDb } = require('../database');
const { authenticate } = require('../middleware/auth');
const { createDiskUpload } = require('../middleware/upload');
const path = require('path');
const fs = require('fs');

const UPLOADS_DIR = path.join(__dirname, '..', '..', 'uploads', 'measurements');
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const upload = createDiskUpload(UPLOADS_DIR, 10);

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
    console.error('Error al obtener medidas:', err.message);
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
    console.error('Error al guardar medidas:', err.message);
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
    console.error('Error al obtener peso:', err.message);
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
    console.error('Error al guardar peso:', err.message);
    res.status(500).json({ error: 'Error al guardar peso' });
  }
});

// Body composition estimation (Navy method)
router.get('/composition', authenticate, async (req, res) => {
  try {
    const db = await getDb();
    const uid = await targetUser(req);
    const result = db.exec(`
      SELECT weight, height, neck, waist, hips, created_at
      FROM measurements WHERE user_id = ? AND weight > 0
      ORDER BY created_at DESC LIMIT 1
    `, [uid]);
    if (result.length === 0 || result[0].values.length === 0) {
      return res.json({ bf: null, bfCategory: '', leanMass: null, fatMass: null });
    }
    const [weight, height, neck, waist, hips] = result[0].values[0];
    if (!height || !neck || !waist) {
      return res.json({ bf: null, bfCategory: '', leanMass: null, fatMass: null });
    }

    const userResult = db.exec('SELECT gender FROM users WHERE id = ?', [uid]);
    const gender = (userResult.length > 0 ? userResult[0].values[0][0] || '' : '').toLowerCase();

    let bf = 0;
    if (gender === 'femenino' || gender === 'female') {
      // Navy method for women
      bf = 163.205 * Math.log10(waist + hips - neck) - 97.684 * Math.log10(height) - 78.387;
    } else {
      // Navy method for men
      bf = 86.010 * Math.log10(waist - neck) - 70.041 * Math.log10(height) + 36.76;
    }
    bf = Math.max(3, Math.min(60, Math.round(bf * 10) / 10));

    const fatMass = Math.round((weight * bf / 100) * 10) / 10;
    const leanMass = Math.round((weight - fatMass) * 10) / 10;

    let bfCategory = '';
    if (gender === 'femenino' || gender === 'female') {
      if (bf < 14) bfCategory = 'Atleta';
      else if (bf < 21) bfCategory = 'Saludable';
      else if (bf < 28) bfCategory = 'Aceptable';
      else if (bf < 35) bfCategory = 'Elevado';
      else bfCategory = 'Muy elevado';
    } else {
      if (bf < 6) bfCategory = 'Atleta';
      else if (bf < 14) bfCategory = 'Saludable';
      else if (bf < 18) bfCategory = 'Aceptable';
      else if (bf < 25) bfCategory = 'Elevado';
      else bfCategory = 'Muy elevado';
    }

    res.json({ bf, bfCategory, leanMass, fatMass, weight, height, neck, waist, hips, gender, date: result[0].values[0][4] });
  } catch (err) {
    console.error('Error en composition:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Evolution history (for charts)
router.get('/history', authenticate, async (req, res) => {
  try {
    const db = await getDb();
    const uid = await targetUser(req);
    const result = db.exec(`
      SELECT weight, chest, waist, arms, legs, created_at
      FROM measurements WHERE user_id = ? AND weight > 0
      ORDER BY created_at ASC
    `, [uid]);
    const rows = result.length > 0 ? result[0].values.map(r => ({
      weight: r[0], chest: r[1], waist: r[2], arms: r[3], legs: r[4],
      date: r[5]
    })) : [];
    res.json(rows);
  } catch (err) {
    console.error('Error en history:', err.message);
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', authenticate, upload.fields([
  { name: 'photo1', maxCount: 1 },
  { name: 'photo2', maxCount: 1 },
  { name: 'photo3', maxCount: 1 },
  { name: 'photo4', maxCount: 1 }
]), async (req, res) => {
  try {
    const db = await getDb();
    const existing = db.exec('SELECT user_id, photo1, photo2, photo3, photo4 FROM measurements WHERE id = ?', [req.params.id]);
    if (!existing[0]) return res.status(404).json({ error: 'No encontrado' });
    const row = existing[0].values[0];
    const ownerId = row[0];
    const uid = await targetUser(req);
    if (uid !== ownerId) return res.status(403).json({ error: 'Sin permiso' });

    const { weight, chest, waist, arms, legs, notes,
            height, neck, shoulders, back, biceps, forearms, wrist,
            mid_abdomen, hips, thigh, mid_thigh, calf, created_at } = req.body;

    // Delete old photos if new ones uploaded
    const oldPhotos = [row[1], row[2], row[3], row[4]];
    const newPhotos = ['photo1', 'photo2', 'photo3', 'photo4'].map(k =>
      req.files?.[k] ? '/uploads/measurements/' + req.files[k][0].filename : ''
    );
    for (let i = 0; i < 4; i++) {
      if (newPhotos[i] && oldPhotos[i]) {
        const p = path.join(__dirname, '..', '..', oldPhotos[i]);
        if (fs.existsSync(p)) fs.unlinkSync(p);
      }
    }

    // Keep old photo URL if no new photo uploaded
    const photo1 = newPhotos[0] || oldPhotos[0] || '';
    const photo2 = newPhotos[1] || oldPhotos[1] || '';
    const photo3 = newPhotos[2] || oldPhotos[2] || '';
    const photo4 = newPhotos[3] || oldPhotos[3] || '';

    if (created_at) {
      db.run(`UPDATE measurements SET weight=?, chest=?, waist=?, arms=?, legs=?, notes=?,
              photo1=?, photo2=?, photo3=?, photo4=?,
              height=?, neck=?, shoulders=?, back=?, biceps=?, forearms=?, wrist=?,
              mid_abdomen=?, hips=?, thigh=?, mid_thigh=?, calf=?, created_at=?
              WHERE id=?`,
        [weight || 0, chest || 0, waist || 0, arms || 0, legs || 0, notes || '',
         photo1, photo2, photo3, photo4,
         height || 0, neck || 0, shoulders || 0, back || 0, biceps || 0,
         forearms || 0, wrist || 0, mid_abdomen || 0, hips || 0,
         thigh || 0, mid_thigh || 0, calf || 0, created_at, req.params.id]);
    } else {
      db.run(`UPDATE measurements SET weight=?, chest=?, waist=?, arms=?, legs=?, notes=?,
              photo1=?, photo2=?, photo3=?, photo4=?,
              height=?, neck=?, shoulders=?, back=?, biceps=?, forearms=?, wrist=?,
              mid_abdomen=?, hips=?, thigh=?, mid_thigh=?, calf=?
              WHERE id=?`,
        [weight || 0, chest || 0, waist || 0, arms || 0, legs || 0, notes || '',
         photo1, photo2, photo3, photo4,
         height || 0, neck || 0, shoulders || 0, back || 0, biceps || 0,
         forearms || 0, wrist || 0, mid_abdomen || 0, hips || 0,
         thigh || 0, mid_thigh || 0, calf || 0, req.params.id]);
    }
    saveDb();
    res.json({ message: 'Medida actualizada' });
  } catch (err) {
    console.error('Error al actualizar medida:', err.message);
    res.status(500).json({ error: 'Error al actualizar medida' });
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
    console.error('Error al eliminar medida:', err.message);
    res.status(500).json({ error: 'Error al eliminar medida' });
  }
});

module.exports = router;
