const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');
(async () => {
  const SQL = await initSqlJs();
  const buffer = fs.readFileSync(path.join(__dirname, 'data', 'fittraining.db'));
  const db = new SQL.Database(buffer);
  console.log('=== ELIO EXERCISES (user 15) ===');
  const r1 = db.exec('SELECT e.id, e.name, e.gif_url, ge.gif_url as global_gif FROM exercises e LEFT JOIN global_exercises ge ON e.global_exercise_id = ge.id JOIN routines r ON e.routine_id = r.id WHERE r.user_id = 15 ORDER BY e.id');
  if (r1[0]) {
    console.log('id | name | gif_url | global_gif');
    for (const row of r1[0].values) {
      console.log(row[0] + ' | ' + row[1] + ' | [' + row[2] + '] | [' + row[3] + ']');
    }
  }
  console.log('');
  console.log('=== COUNT non-empty gif_url in exercises for user 15 ===');
  const r2 = db.exec("SELECT COUNT(*) FROM exercises e JOIN routines r ON e.routine_id = r.id WHERE r.user_id = 15 AND e.gif_url != ''");
  console.log('Count:', r2[0].values[0][0]);
  console.log('');
  console.log('=== GLOBAL_EXERCISES with non-empty gif_url ===');
  const r3 = db.exec("SELECT id, name, gif_url FROM global_exercises WHERE gif_url != '' LIMIT 20");
  if (r3[0]) {
    for (const row of r3[0].values) {
      console.log(row[0] + ' | ' + row[1] + ' | [' + row[2] + ']');
    }
  } else {
    console.log('NONE');
  }
  db.close();
})();
