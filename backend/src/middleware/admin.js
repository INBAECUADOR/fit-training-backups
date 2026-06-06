const { getDb } = require('../database');

async function requireAdmin(req, res, next) {
  try {
    const db = await getDb();
    const result = db.exec(`SELECT role FROM users WHERE id = ?`, [req.userId]);
    const role = result.length > 0 ? result[0].values[0][0] : 'user';
    if (role !== 'admin') {
      return res.status(403).json({ error: 'Se requieren permisos de administrador' });
    }
    next();
  } catch {
    res.status(500).json({ error: 'Error al verificar permisos' });
  }
}

module.exports = { requireAdmin };
