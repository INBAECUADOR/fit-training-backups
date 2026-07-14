const express = require('express');
const zlib = require('zlib');
const path = require('path');
const fs = require('fs');
const { getDb, saveDb, closeDb } = require('../database');
const { authenticate } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/admin');
const multer = require('multer');

const router = express.Router();
router.use(authenticate, requireAdmin);
router.use(function(req, res, next) {
  console.error('BACKUP ROUTE HIT:', req.method, req.originalUrl, req.path);
  next();
});

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 1024 * 1024 * 1024 } });

function getDbPath() {
  return path.join(__dirname, '..', '..', 'data', 'fittraining.db');
}

router.get('/', async (req, res) => {
  try {
    saveDb();
    const dbPath = getDbPath();
    if (!fs.existsSync(dbPath)) {
      return res.status(404).json({ error: 'Base de datos no encontrada' });
    }
    res.setHeader('Content-Type', 'application/x-sqlite3');
    res.setHeader('Content-Disposition', `attachment; filename=fittraining-${new Date().toISOString().slice(0, 10)}.db`);
    res.sendFile(dbPath);
  } catch (err) {
    console.error('Backup error:', err);
    res.status(500).json({ error: 'Error al crear backup: ' + err.message });
  }
});

// BUILD_ID=20260714051102690
router.get('/test', function(req, res) {
  res.json({ test: true, path: req.path, url: req.originalUrl });
});

router.get('/db', async (req, res) => {
  try {
    saveDb();
    const dbPath = getDbPath();
    if (!fs.existsSync(dbPath)) {
      return res.status(404).json({ error: 'Base de datos no encontrada' });
    }
    res.setHeader('Content-Type', 'application/x-sqlite3');
    res.setHeader('Content-Disposition', `attachment; filename=fittraining-${new Date().toISOString().slice(0, 10)}.db`);
    res.sendFile(dbPath);
  } catch (err) {
    console.error('DB download error:', err);
    res.status(500).json({ error: 'Error al descargar base de datos' });
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

    const dbPath = path.join(__dirname, '..', '..', 'data', 'fittraining.db');
    const restoreDb = path.join(extractDir, 'fittraining.db');
    const uploadsPath = path.join(__dirname, '..', '..', 'uploads');
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

    res.json({ message: 'Backup restaurado correctamente. El servidor se reiniciarÃ¡ para aplicar cambios.' });
    process.exit(0);
  } catch (err) {
    console.error('Restore error:', err);
    res.status(500).json({ error: 'Error al restaurar backup: ' + err.message });
  }
});

async function createBackupBuffer() {
  saveDb();
  const dbPath = getDbPath();
  const dbBuffer = fs.readFileSync(dbPath);
  return new Promise((resolve, reject) => {
    zlib.gzip(dbBuffer, (err, compressed) => {
      if (err) reject(err);
      else resolve(compressed);
    });
  });
}

// POST /cron â€” Automatic daily backup to GitHub Releases
// Protected by CRON_SECRET env var (passed as ?secret= or x-cron-secret header)
router.post('/cron', async (req, res) => {
  try {
    const secret = req.query.secret || req.headers['x-cron-secret'];
    if (!secret || secret !== process.env.CRON_SECRET) {
      return res.status(403).json({ error: 'Invalid cron secret' });
    }

    const token = process.env.BACKUP_GITHUB_TOKEN;
    const repo = process.env.BACKUP_GITHUB_REPO;
    if (!token || !repo) {
      return res.status(400).json({ error: 'BACKUP_GITHUB_TOKEN y BACKUP_GITHUB_REPO no configurados' });
    }

    const dateStr = new Date().toISOString().slice(0, 10);
    const tag = `backup-${dateStr}`;

    const buffer = await createBackupBuffer();

    // 1. Create GitHub Release
    const releaseRes = await fetch(`https://api.github.com/repos/${repo}/releases`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'fit-training-app-backup',
      },
      body: JSON.stringify({
        tag_name: tag,
        name: `Backup ${dateStr}`,
        body: `Backup automÃ¡tico del ${dateStr}`,
        prerelease: false,
      }),
    });

    if (!releaseRes.ok) {
      const errText = await releaseRes.text();
      // If release already exists, delete old release and retry
      if (releaseRes.status === 422) {
        // Get existing release and delete it
        const getRes = await fetch(`https://api.github.com/repos/${repo}/releases/tags/${tag}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'fit-training-app-backup',
          },
        });
        if (getRes.ok) {
          const existing = await getRes.json();
          await fetch(`https://api.github.com/repos/${repo}/releases/${existing.id}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/vnd.github.v3+json',
              'User-Agent': 'fit-training-app-backup',
            },
          });
          // Delete tag too
          await fetch(`https://api.github.com/repos/${repo}/git/refs/tags/${tag}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/vnd.github.v3+json',
              'User-Agent': 'fit-training-app-backup',
            },
          });
          // Retry creating release
          const retryRes = await fetch(`https://api.github.com/repos/${repo}/releases`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
              'Accept': 'application/vnd.github.v3+json',
              'User-Agent': 'fit-training-app-backup',
            },
            body: JSON.stringify({
              tag_name: tag,
              name: `Backup ${dateStr}`,
              body: `Backup automÃ¡tico del ${dateStr}`,
              prerelease: false,
            }),
          });
          if (!retryRes.ok) {
            return res.status(500).json({ error: 'Error al crear release: ' + await retryRes.text() });
          }
        }
      } else {
        return res.status(500).json({ error: 'Error al crear release: ' + errText });
      }
    }

    // Get the release ID (might have been created by retry or original)
    const finalRelease = await fetch(`https://api.github.com/repos/${repo}/releases/tags/${tag}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'fit-training-app-backup',
      },
    });
    if (!finalRelease.ok) {
      return res.status(500).json({ error: 'Error al obtener release creado' });
    }
    const releaseData = await finalRelease.json();

    // 2. Upload ZIP as release asset
    const uploadUrl = releaseData.upload_url.replace('{?name,label}', '');
    const assetRes = await fetch(`${uploadUrl}?name=backup-${dateStr}.db.gz`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/gzip',
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'fit-training-app-backup',
        'Content-Length': String(buffer.length),
      },
      body: buffer,
    });

    if (!assetRes.ok) {
      return res.status(500).json({ error: 'Error al subir asset: ' + await assetRes.text() });
    }

    res.json({ message: `Backup subido a ${repo} como release ${tag}`, size: buffer.length });
  } catch (err) {
    console.error('GitHub backup error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

