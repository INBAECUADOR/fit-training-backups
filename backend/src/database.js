const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'data', 'fittraining.db');

let db = null;

async function getDb() {
  if (db) return db;
  const SQL = await initSqlJs();
  
  if (fs.existsSync(DB_PATH)) {
    const buffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(buffer);
  } else {
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    db = new SQL.Database();
  }

  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    document_id TEXT UNIQUE NOT NULL,
    email TEXT DEFAULT '',
    name TEXT NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'user'
  )`);

  try { db.run(`ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user'`); } catch (e) {}
  try { db.run(`ALTER TABLE users ADD COLUMN email TEXT DEFAULT ''`); } catch (e) {}
  try { db.run(`ALTER TABLE users ADD COLUMN membership_end_date TEXT DEFAULT ''`); } catch (e) {}
  try { db.run(`ALTER TABLE users ADD COLUMN membership_start_date TEXT DEFAULT ''`); } catch (e) {}
  try { db.run(`ALTER TABLE users ADD COLUMN avatar_url TEXT DEFAULT ''`); } catch (e) {}

  db.run(`CREATE TABLE IF NOT EXISTS routines (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    day_name TEXT NOT NULL,
    day_label TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS global_exercises (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    muscle_group TEXT NOT NULL,
    description TEXT DEFAULT '',
    gif_url TEXT DEFAULT ''
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS exercises (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    routine_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    series INTEGER DEFAULT 0,
    reps INTEGER DEFAULT 0,
    observation TEXT DEFAULT '',
    gif_url TEXT DEFAULT '',
    global_exercise_id INTEGER DEFAULT NULL,
    FOREIGN KEY (routine_id) REFERENCES routines(id)
  )`);

  try { db.run(`ALTER TABLE exercises ADD COLUMN global_exercise_id INTEGER DEFAULT NULL`); } catch (e) {}
  try { db.run(`ALTER TABLE exercises ADD COLUMN rest TEXT DEFAULT ''`); } catch (e) {}

  try { db.run(`ALTER TABLE measurements ADD COLUMN photo1 TEXT DEFAULT ''`); } catch (e) {}
  try { db.run(`ALTER TABLE measurements ADD COLUMN photo2 TEXT DEFAULT ''`); } catch (e) {}
  try { db.run(`ALTER TABLE measurements ADD COLUMN photo3 TEXT DEFAULT ''`); } catch (e) {}
  try { db.run(`ALTER TABLE measurements ADD COLUMN photo4 TEXT DEFAULT ''`); } catch (e) {}
  try { db.run(`ALTER TABLE measurements ADD COLUMN height REAL DEFAULT 0`); } catch (e) {}
  try { db.run(`ALTER TABLE measurements ADD COLUMN neck REAL DEFAULT 0`); } catch (e) {}
  try { db.run(`ALTER TABLE measurements ADD COLUMN shoulders REAL DEFAULT 0`); } catch (e) {}
  try { db.run(`ALTER TABLE measurements ADD COLUMN back REAL DEFAULT 0`); } catch (e) {}
  try { db.run(`ALTER TABLE measurements ADD COLUMN biceps REAL DEFAULT 0`); } catch (e) {}
  try { db.run(`ALTER TABLE measurements ADD COLUMN forearms REAL DEFAULT 0`); } catch (e) {}
  try { db.run(`ALTER TABLE measurements ADD COLUMN wrist REAL DEFAULT 0`); } catch (e) {}
  try { db.run(`ALTER TABLE measurements ADD COLUMN mid_abdomen REAL DEFAULT 0`); } catch (e) {}
  try { db.run(`ALTER TABLE measurements ADD COLUMN hips REAL DEFAULT 0`); } catch (e) {}
  try { db.run(`ALTER TABLE measurements ADD COLUMN thigh REAL DEFAULT 0`); } catch (e) {}
  try { db.run(`ALTER TABLE measurements ADD COLUMN mid_thigh REAL DEFAULT 0`); } catch (e) {}
  try { db.run(`ALTER TABLE measurements ADD COLUMN calf REAL DEFAULT 0`); } catch (e) {}

  db.run(`CREATE TABLE IF NOT EXISTS exercise_results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    exercise_id INTEGER NOT NULL,
    weight REAL DEFAULT 0,
    time TEXT DEFAULT '',
    repetitions INTEGER DEFAULT 0,
    observation TEXT DEFAULT '',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (exercise_id) REFERENCES exercises(id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS measurements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    weight REAL DEFAULT 0,
    chest REAL DEFAULT 0,
    waist REAL DEFAULT 0,
    arms REAL DEFAULT 0,
    legs REAL DEFAULT 0,
    notes TEXT DEFAULT '',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS diets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    day_name TEXT NOT NULL,
    meal_type TEXT NOT NULL,
    description TEXT DEFAULT '',
    FOREIGN KEY (user_id) REFERENCES users(id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS config (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS motivational_quotes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    text TEXT NOT NULL,
    author TEXT DEFAULT ''
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS login_attempts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    credential TEXT NOT NULL,
    success INTEGER NOT NULL DEFAULT 0,
    ip TEXT DEFAULT '',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS routine_templates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT DEFAULT ''
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS routine_template_exercises (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    template_id INTEGER NOT NULL,
    day_name TEXT NOT NULL,
    name TEXT NOT NULL,
    series INTEGER DEFAULT 0,
    reps INTEGER DEFAULT 0,
    rest TEXT DEFAULT '',
    observation TEXT DEFAULT '',
    gif_url TEXT DEFAULT '',
    FOREIGN KEY (template_id) REFERENCES routine_templates(id) ON DELETE CASCADE
  )`);

  saveDb();
  return db;
}

function saveDb() {
  if (!db) return;
  const data = db.export();
  const buffer = Buffer.from(data);
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(DB_PATH, buffer);
}

function closeDb() {
  if (db) { saveDb(); db.close(); db = null; }
}

module.exports = { getDb, saveDb, closeDb };
