const express = require('express');
const multer = require('multer');
const path = require('path');
const { getDb, saveDb } = require('../database');
const { authenticate } = require('../middleware/auth');
const router = express.Router();
router.use(authenticate);

const AVATAR_DIR = path.join(__dirname, '..', '..', 'uploads', 'avatars');
const fs = require('fs');
if (!fs.existsSync(AVATAR_DIR)) fs.mkdirSync(AVATAR_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, AVATAR_DIR),
  filename: (req, file, cb) => cb(null, `user_${req.userId}_${Date.now()}${path.extname(file.originalname)}`),
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

router.post('/upload', upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Selecciona una imagen' });
    const db = await getDb();
    const avatar_url = `/uploads/avatars/${req.file.filename}`;
    db.run(`UPDATE users SET avatar_url = ? WHERE id = ?`, [avatar_url, req.userId]);
    saveDb();
    res.json({ avatar_url });
  } catch (err) {
    console.error('Avatar upload error:', err);
    res.status(500).json({ error: 'Error al subir avatar' });
  }
});

module.exports = router;
