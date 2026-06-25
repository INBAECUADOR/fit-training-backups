const express = require('express');
const archiver = require('archiver');
const path = require('path');
const fs = require('fs');
const { getDb, saveDb, closeDb } = require('../database');
const { authenticate } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/admin');
const multer = require('multer');

const router = express.Router();
router.use(authenticate, requireAdmin);

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 1024 * 1024 * 1024 } });

router.get('/', async (req, res) => {
  try {
    saveDb();
    const dbPath = path.join(__dirname, '..', 'data', 'fittraining.db');
    const uploadsPath = path.join(__dirname, '..', 'uploads');

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename=backup-${new Date().toISOString().slice(0, 10)}.zip`);

    const archive = archiver('zip', { zlib: { level: 9 } });
    archive.pipe(res);

    if (fs.existsSync(dbPath)) {
      archive.file(dbPath, { name: 'fittraining.db' });
    }
    if (fs.existsSync(uploadsPath)) {
      archive.directory(uploadsPath, 'uploads');
    }

    await archive.finalize();
  } catch (err) {
    console.error('Backup error:', err);
    res.status(500).json({ error: 'Error al crear backup' });
  }
});

const unzip = require('unzipper');

router.post('/restore', upload.single('backup'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Selecciona un archivo de backup' });
    if (!req.file.originalname.endsWith('.zip')) return res.status(400).json({ error: 'Solo se aceptan archivos .zip' });

    const extractDir = path.join(__dirname, '..', '..', 'temp_restore');
    if (fs.existsSync(extractDir)) fs.rmSync(extractDir, { recursive: true });
    fs.mkdirSync(extractDir, { recursive: true });

    const zipPath = path.join(extractDir, 'backup.zip');
    fs.writeFileSync(zipPath, req.file.buffer);

    await new Promise((resolve, reject) => {
      fs.createReadStream(zipPath)
        .pipe(unzip.Extract({ path: extractDir }))
        .on('close', resolve)
        .on('error', reject);
    });

    const dbPath = path.join(__dirname, '..', 'data', 'fittraining.db');
    const restoreDb = path.join(extractDir, 'fittraining.db');
    const uploadsPath = path.join(__dirname, '..', 'uploads');
    const restoreUploads = path.join(extractDir, 'uploads');

    if (fs.existsSync(restoreDb)) {
      closeDb();
      fs.copyFileSync(restoreDb, dbPath);
    }
    if (fs.existsSync(restoreUploads)) {
      if (fs.existsSync(uploadsPath)) fs.rmSync(uploadsPath, { recursive: true });
      fs.cpSync(restoreUploads, uploadsPath, { recursive: true });
    }

    fs.rmSync(extractDir, { recursive: true });

    res.json({ message: 'Backup restaurado correctamente. El servidor se reiniciará para aplicar cambios.' });
    process.exit(0);
  } catch (err) {
    console.error('Restore error:', err);
    res.status(500).json({ error: 'Error al restaurar backup: ' + err.message });
  }
});

module.exports = router;
