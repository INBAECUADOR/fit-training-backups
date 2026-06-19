const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { getDb, saveDb } = require('../database');
const { authenticate } = require('../middleware/auth');
const router = express.Router();
router.use(authenticate);

const AVATAR_DIR = path.join(__dirname, '..', '..', 'uploads', 'avatars');
if (!fs.existsSync(AVATAR_DIR)) fs.mkdirSync(AVATAR_DIR, { recursive: true });

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, AVATAR_DIR),
    filename: (req, file, cb) => cb(null, `user_${req.userId}_${Date.now()}${path.extname(file.originalname)}`),
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_IMAGE_TYPES.includes(file.mimetype)) return cb(new Error('Solo imágenes JPG, PNG, WebP o GIF'), false);
    cb(null, true);
  },
});

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
