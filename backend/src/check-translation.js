const { getDb } = require('./database');
getDb().then(db => {
  const untranslated = db.exec("SELECT COUNT(*) FROM global_exercises WHERE name_es IS NULL OR name_es = ''")[0].values[0][0];
  const total = db.exec("SELECT COUNT(*) FROM global_exercises")[0].values[0][0];
  console.log('Sin traducir:', untranslated, 'de', total);
  const samples = db.exec("SELECT id, name, name_es FROM global_exercises WHERE name_es != '' LIMIT 5");
  if (samples[0]) samples[0].values.forEach(x => console.log(x[0], x[1], '->', x[2]));
});
