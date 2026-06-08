const { getDb, saveDb } = require('./database');
getDb().then(db => {
  const r = db.exec("SELECT id, name FROM global_exercises WHERE name_es IS NULL OR name_es = ''");
  if (!r[0]) { console.log('Ninguno pendiente'); return; }
  const rows = r[0].values;
  for (const [id, name] of rows) {
    db.run('UPDATE global_exercises SET name_es = ? WHERE id = ?', [name, id]);
  }
  saveDb();
  console.log('Actualizados', rows.length, 'ejercicios con name_es = name (fallback)');
});
