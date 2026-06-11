const bcrypt = require('bcryptjs');

async function migrate(db) {
  const q = (sql, params) => db.exec(sql, params);
  const qOne = (sql, params) => { const r = db.exec(sql, params); return r.length && r[0].values.length ? r[0].values[0] : null; };
  
  console.log('Running migrations...');
  
  // 0. Fix admin name
  q("UPDATE users SET name = 'Admin' WHERE id = 1 AND name != 'Admin'", []);
  
  // 1. Fix Elio Escalona password
  const elio = qOne("SELECT id, password FROM users WHERE id = 15", []);
  if (elio) {
    const valid = bcrypt.compareSync('1234', elio[1]);
    if (!valid) {
      const hash = bcrypt.hashSync('1234', 10);
      q("UPDATE users SET password = ? WHERE id = 15", [hash]);
      console.log('Fixed Elio password -> 1234');
    }
  }
  
  // 2. GIF URLs for catalog exercises (from exercisedb.dev)
  const gifUrls = {
    1052: 'https://static.exercisedb.dev/media/rjiM4L3.gif', 1055: 'https://static.exercisedb.dev/media/a8VDgLw.gif',
    1057: 'https://static.exercisedb.dev/media/EIeI8Vf.gif', 1058: 'https://static.exercisedb.dev/media/SpYC0Kp.gif',
    1059: 'https://static.exercisedb.dev/media/0CXGHya.gif', 1060: 'https://static.exercisedb.dev/media/2NpxjC1.gif',
    1061: 'https://static.exercisedb.dev/media/DhMl549.gif', 1062: 'https://static.exercisedb.dev/media/10Z2DXU.gif',
    1063: 'https://static.exercisedb.dev/media/Ul5OFSV.gif', 1064: 'https://static.exercisedb.dev/media/CmEr4pM.gif',
    1065: 'https://static.exercisedb.dev/media/6cKQC5E.gif', 1066: 'https://static.exercisedb.dev/media/LEprlgG.gif',
    1067: 'https://static.exercisedb.dev/media/9tvVVM9.gif', 1068: 'https://static.exercisedb.dev/media/f1jf47L.gif',
    1069: 'https://static.exercisedb.dev/media/f1jf47L.gif', 1070: 'https://static.exercisedb.dev/media/DsgkuIt.gif',
    1071: 'https://static.exercisedb.dev/media/1xHyxys.gif', 1073: 'https://static.exercisedb.dev/media/4f8RXP8.gif',
    1074: 'https://static.exercisedb.dev/media/A3P4O0R.gif', 1075: 'https://static.exercisedb.dev/media/hBGWILP.gif',
    1076: 'https://static.exercisedb.dev/media/NN8nSNT.gif', 1083: 'https://static.exercisedb.dev/media/0S75mYG.gif',
    1084: 'https://static.exercisedb.dev/media/0jp9Rlz.gif', 1085: 'https://static.exercisedb.dev/media/1V1gj1u.gif',
    1088: 'https://static.exercisedb.dev/media/17lJ1kr.gif',
  };

  const catalogToAdd = [
    [1052, 'treadmill (cardio)', 'Cinta Caminadora (Cardio)', 'cardio', 'Caminadora o treadmill para cardio'],
    [1053, 'treadmill jogging (cardio)', 'Trote en Cinta (Cardio)', 'cardio', 'Trote ligero en cinta caminadora'],
    [1054, 'elliptical (cardio)', 'Elíptica (Cardio)', 'cardio', 'Máquina elíptica para cardio'],
    [1055, 'stationary bike (cardio)', 'Bicicleta Estática (Cardio)', 'cardio', 'Bicicleta estática para cardio'],
    [1056, 'jogging (cardio)', 'Trote Ligero (Cardio)', 'cardio', 'Trote ligero como calentamiento'],
    [1057, 'barbell bench press', 'Press de Banca con Barra', 'chest', 'Press de banca plano con barra'],
    [1058, 'dumbbell bench press', 'Press de Banca con Mancuernas', 'chest', 'Press de banca plano con mancuernas'],
    [1059, 'cable crossover', 'Cruce de Polea', 'chest', 'Cruces en polea para pecho'],
    [1060, 'dumbbell hammer curl', 'Curl de Martillo', 'arms', 'Curl martillo con mancuernas'],
    [1061, 'barbell squat', 'Sentadilla con Barra', 'upper legs', 'Sentadilla con barra trasera'],
    [1062, 'leg press machine', 'Prensa de Piernas', 'upper legs', 'Prensa de piernas en máquina'],
    [1063, 'leg extension machine', 'Extensión de Pierna', 'upper legs', 'Máquina de extensión de cuádriceps'],
    [1064, 'pull-up', 'Dominadas', 'back', 'Dominadas con agarre prono'],
    [1065, 'dumbbell row', 'Remo con Mancuernas', 'back', 'Remo a una mano con mancuerna'],
    [1066, 'cable lat pulldown', 'Jalón al Pecho en Polea', 'back', 'Jalón de polea al pecho'],
    [1067, 'cable triceps pushdown', 'Jalón de Tríceps en Polea', 'arms', 'Extensión de tríceps en polea'],
    [1068, 'seated shoulder press machine', 'Prensa de Hombros Máquina', 'shoulders', 'Press de hombros en máquina'],
    [1069, 'dumbbell shoulder press', 'Press de Hombros con Mancuernas', 'shoulders', 'Press de hombros con mancuernas'],
    [1070, 'incline dumbbell lateral raise', 'Elevaciones Laterales Inclinadas con Mancuernas', 'shoulders', 'Elevaciones laterales inclinadas'],
    [1071, 'face pull', 'Facepull', 'shoulders', 'Facepull para deltoides posteriores'],
    [1072, 'lying leg curl machine', 'Curl Femoral Tumbado', 'upper legs', 'Curl femoral en máquina tumbado'],
    [1073, 'cable standing row', 'Remo en Polea Alta', 'back', 'Remo de pie en polea alta'],
    [1074, 'cable low row', 'Remo en Polea Baja', 'back', 'Remo sentado en polea baja'],
    [1075, 'cable hip thrust', 'Hip Thrust', 'upper legs', 'Hip thrust con polea o peso'],
    [1076, 'high cable crossover', 'Cruces de Poleas Altas', 'chest', 'Cruces de poleas altas para pecho'],
    [1077, 'low cable crossover', 'Cruces de Polea Bajas', 'chest', 'Cruces de polea bajas para pecho'],
    [1078, 'cable crossover fly', 'Aperturas en Polea', 'chest', 'Aperturas en polea para pecho'],
    [1079, 'incline dumbbell press', 'Press Inclinado con Mancuernas', 'chest', 'Press inclinado con mancuernas'],
    [1080, 'barbell row', 'Remo con Barra', 'back', 'Remo con barra para espalda'],
    [1081, 'machine chest press', 'Press Chest Press Máquina', 'chest', 'Press de pecho en máquina'],
    [1082, 'one arm dumbbell row', 'Remo con Mancuerna a una mano', 'back', 'Remo a una mano con mancuerna'],
    [1083, 'seated calf raise', 'Elevación de Talones Sentado', 'lower legs', 'Elevación de talones sentado en máquina'],
    [1084, 'standing calf raise', 'Elevación de Talones de Pie', 'lower legs', 'Elevación de talones de pie'],
    [1085, 'concentration curl', 'Curl Concentrado', 'arms', 'Curl de concentración con mancuerna'],
    [1086, 'assisted pull-up machine', 'Dominadas Asistidas', 'back', 'Máquina de dominadas asistidas'],
    [1087, 'glute bridge', 'Puente de Glúteos', 'upper legs', 'Puente de glúteos en el suelo'],
    [1088, 'lying leg curl (seated)', 'Curl Femoral Sentado', 'upper legs', 'Curl femoral en máquina sentado'],
    [1089, 'cable glute kickback', 'Patada de Glúteo en Polea', 'upper legs', 'Patada de glúteo en polea'],
  ];
  
  let added = 0;
  for (const [id, name, nameEs, mg, desc] of catalogToAdd) {
    const existing = qOne("SELECT id FROM global_exercises WHERE id = ?", [id]);
    if (!existing) {
      const gif = gifUrls[id] || '';
      q("INSERT INTO global_exercises (id, name, name_es, muscle_group, description, gif_url) VALUES (?, ?, ?, ?, ?, ?)", [id, name, nameEs, mg, desc, gif]);
      added++;
    }
  }
  if (added) console.log('Added', added, 'new catalog exercises');

  // 2b. Update existing catalog exercises with missing gif_url
  for (const [id, url] of Object.entries(gifUrls)) {
    const r = qOne("SELECT gif_url FROM global_exercises WHERE id = ? AND (gif_url IS NULL OR gif_url = '')", [parseInt(id)]);
    if (r) {
      q("UPDATE global_exercises SET gif_url = ? WHERE id = ?", [url, parseInt(id)]);
    }
  }
  
  // 3. Fix exercise matches for all unmatched exercises
  const fixMap = {
    'PRESS DE BANCA CON BARRA': 1057, 'PRESS DE BANCA CON MANCUERNAS': 1058,
    'CRUCE DE POLEA': 1059, 'CURL DE MARTILLO': 1060, 'SENTADILLAS CON BARRA': 1061,
    'SENTADILLA CON BARRA': 1061, 'PRENSA DE PIERNAS': 1062, 'EXTENSIÓN DE PIERNA': 1063,
    'PESO MUERTO DE SUMO': 502, 'DOMINADAS': 1064, 'REMO CON MANCUERNAS': 1065,
    'JALÓN LATERAL AL PECHO POLEA': 1066, 'JALÓN TRÍCEPS CON POLEA': 1067,
    'PRENSA DE HOMBROS MAQUINA': 1068, 'PRESS DE HOMBROS CON MANCUERNAS': 1069,
    'ELEVACIONES LATERALES INCLINADAS CON MANCUERNAS': 1070,
    'Cardio': 1055, 'Estiramientos': 1056, 'Puente de Glúteos': 1087,
    'Cinta Caminadora (Calentamiento)': 1052, 'Cinta Elíptica (Calentamiento)': 1054,
    'Elíptica (Calentamiento)': 1054, 'Trote Ligero (Calentamiento)': 1056,
    'Bicicleta Estática': 1055, 'Facepulls': 1071, 'Facepull': 1071,
    'Cruces de Poleas Altas': 1076, 'Cruces de Poleas Bajas': 1077,
    'Cruces de Polea Bajas': 1077, 'Cruces de Polea Bajas': 1077,
    'Aperturas en Polea (Superserie)': 1078, 'Aperturas en Polea': 1078,
    'Remo en Polea Baja (Superserie)': 1074, 'Remo en Polea Baja': 1074,
    'Remo en Polea Baja (Agarre Neutro)': 1074, 'Remo en Polea Alta': 1073,
    'Elevaciones de Piernas Colgado': 933, 'Zancadas Caminando': 565,
    'Curl Femoral Tumbado': 1072, 'Curl Femoral Sentada': 1088, 'Curl Femoral Sentado': 1088,
    'Patada de Glúteo en Polea': 1089, 'Press de Banca Plano': 1057,
    'Dominadas o Jalón al Pecho': 1064, 'Press Inclinado con Mancuernas': 1079,
    'Remo con Barra': 1080, 'Press Chest Press Máquina': 1081,
    'Remo con Mancuerna a una mano': 1082, 'Plancha Abdominal': 319,
    'Sentadilla Libre': 1061, 'Prensa 45 Grados': 1062,
    'Extensiones de Cuádriceps': 1063, 'Zancadas con Mancuernas': 574,
    'Peso Muerto Rumano': 513, 'Hip Thrust': 1075,
    'Prensa de Piernas (Pies altos)': 1062, 'Elevación de Talones Sentados': 1083,
    'Elevación de Talones de pie': 1084, 'Elevación de Talones Sentado': 1083,
    'Press Militar con Barra': 826, 'Elevaciones Laterales': 885,
    'Extensiones de Tríceps Polea': 1067, 'Curl Concentrado': 1085,
    'Fondos en Paralelas': 643, 'Rueda Abdominal': 335,
    'Sentadilla Goblet': 987, 'Press Banca Inclinado': 1079,
    'Remo con Barra T': 527, 'Press Arnold Mancuernas': 958,
    'Curl Bíceps Polea': 966, 'Extensiones Tríceps Cuerda': 299,
    'Flexiones de Brazo': 539, 'Jalón al Pecho Agarre Estrecho': 1066,
    'Crunch Abdominal': 580, 'Press Militar Mancuernas': 1069,
    'Prensa de Piernas': 1062, 'Cinta Elíptica (Intervalos)': 1054,
    'Dominadas Asistidas o Libres': 1086, 'Aperturas con Mancuernas': 1078,
    'Curl Bíceps Alterno': 338,
  };
  
  let fixed = 0;
  const unmatched = q("SELECT e.id, e.name FROM exercises e WHERE e.global_exercise_id IS NULL", []);
  if (unmatched.length) {
    for (const [exId, exName] of unmatched[0].values) {
      const cn = exName.toUpperCase().trim();
      let catId = fixMap[cn];
      if (!catId) {
        for (const [key, val] of Object.entries(fixMap)) {
          if (cn.startsWith(key) || cn.includes(key)) { catId = val; break; }
        }
      }
      if (catId) {
        const gif = qOne("SELECT gif_url FROM global_exercises WHERE id = ?", [catId]);
        q("UPDATE exercises SET global_exercise_id = ?, gif_url = ? WHERE id = ?", [catId, gif ? gif[0] : null, exId]);
        fixed++;
      }
    }
  }
  if (fixed) console.log('Fixed', fixed, 'unmatched exercises');
  
  // 4. Fix typo 'Cinta Eléctica' -> 'Cinta Elíptica'
  q("UPDATE exercises SET name = REPLACE(name, 'Cinta Eléctica', 'Cinta Elíptica') WHERE name LIKE '%Cinta Eléctica%'", []);
  
  console.log('Migration complete');
}

module.exports = { migrate };
