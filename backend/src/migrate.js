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
    1052: 'https://static.exercisedb.dev/media/rjiM4L3.gif',
    1053: 'https://static.exercisedb.dev/media/rjiM4L3.gif',
    1054: 'https://static.exercisedb.dev/media/rjtuP6X.gif',
    1055: 'https://static.exercisedb.dev/media/a8VDgLw.gif',
    1056: 'https://static.exercisedb.dev/media/CcWEoWV.gif',
    1057: 'https://static.exercisedb.dev/media/EIeI8Vf.gif',
    1058: 'https://static.exercisedb.dev/media/SpYC0Kp.gif',
    1059: 'https://static.exercisedb.dev/media/0CXGHya.gif',
    1060: 'https://static.exercisedb.dev/media/2NpxjC1.gif',
    1061: 'https://static.exercisedb.dev/media/DhMl549.gif',
    1062: 'https://static.exercisedb.dev/media/10Z2DXU.gif',
    1063: 'https://static.exercisedb.dev/media/Ul5OFSV.gif',
    1064: 'https://static.exercisedb.dev/media/CmEr4pM.gif',
    1065: 'https://static.exercisedb.dev/media/6cKQC5E.gif',
    1066: 'https://static.exercisedb.dev/media/LEprlgG.gif',
    1067: 'https://static.exercisedb.dev/media/9tvVVM9.gif',
    1068: 'https://static.exercisedb.dev/media/67n3r98.gif',
    1069: 'https://static.exercisedb.dev/media/f1jf47L.gif',
    1070: 'https://static.exercisedb.dev/media/aTNKZiC.gif',
    1071: 'https://static.exercisedb.dev/media/1xHyxys.gif',
    1072: 'https://static.exercisedb.dev/media/17lJ1kr.gif',
    1073: 'https://static.exercisedb.dev/media/4f8RXP8.gif',
    1074: 'https://static.exercisedb.dev/media/A3P4O0R.gif',
    1075: 'https://static.exercisedb.dev/media/hBGWILP.gif',
    1076: 'https://static.exercisedb.dev/media/NN8nSNT.gif',
    1077: 'https://static.exercisedb.dev/media/0CXGHya.gif',
    1078: 'https://static.exercisedb.dev/media/FVmZVhk.gif',
    1079: 'https://static.exercisedb.dev/media/8eqjhOl.gif',
    1080: 'https://static.exercisedb.dev/media/eZyBC3j.gif',
    1081: 'https://static.exercisedb.dev/media/jHAnWmT.gif',
    1082: 'https://static.exercisedb.dev/media/C0MA9bC.gif',
    1083: 'https://static.exercisedb.dev/media/0S75mYG.gif',
    1084: 'https://static.exercisedb.dev/media/0jp9Rlz.gif',
    1085: 'https://static.exercisedb.dev/media/1V1gj1u.gif',
    1086: 'https://static.exercisedb.dev/media/5ipN0iE.gif',
    1087: 'https://static.exercisedb.dev/media/qKBpF7I.gif',
    1088: 'https://static.exercisedb.dev/media/17lJ1kr.gif',
     1089: 'https://static.exercisedb.dev/media/HEJ6DIX.gif',
     1090: 'https://static.exercisedb.dev/media/KtRomty.gif',
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
    [1090, 'ab wheel', 'Rueda Abdominal', 'waist', 'Rueda abdominal para core'],
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
  // (force update regardless of current value, in case previous migration left empty strings)
  const gifUpdate = [
    [1052, 'rjiM4L3'], [1053, 'rjiM4L3'], [1054, 'rjtuP6X'], [1055, 'a8VDgLw'], [1056, 'CcWEoWV'],
    [1057, 'EIeI8Vf'], [1058, 'SpYC0Kp'], [1059, '0CXGHya'],
    [1060, '2NpxjC1'], [1061, 'DhMl549'], [1062, '10Z2DXU'],
    [1063, 'Ul5OFSV'], [1064, 'CmEr4pM'], [1065, '6cKQC5E'],
    [1066, 'LEprlgG'], [1067, '9tvVVM9'], [1068, '67n3r98'],
    [1069, 'f1jf47L'], [1070, 'aTNKZiC'], [1071, '1xHyxys'],
    [1072, '17lJ1kr'], [1073, '4f8RXP8'], [1074, 'A3P4O0R'],
    [1075, 'hBGWILP'], [1076, 'NN8nSNT'], [1077, '0CXGHya'],
    [1078, 'FVmZVhk'], [1079, '8eqjhOl'], [1080, 'eZyBC3j'],
    [1081, 'jHAnWmT'], [1082, 'C0MA9bC'], [1083, '0S75mYG'],
    [1084, '0jp9Rlz'], [1085, '1V1gj1u'], [1086, '5ipN0iE'],
    [1087, 'qKBpF7I'], [1088, '17lJ1kr'], [1089, 'HEJ6DIX'],
    [1090, 'KtRomty'],
  ];
  for (const [id, exId] of gifUpdate) {
    q("UPDATE global_exercises SET gif_url = ? WHERE id = ?", [`https://static.exercisedb.dev/media/${exId}.gif`, id]);
  }
  console.log('Updated', gifUpdate.length, 'global_exercise GIF URLs');
  
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
    'Fondos en Paralelas': 643, 'RUEDA ABDOMINAL': 1090,
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
          const uk = key.toUpperCase();
          if (cn.startsWith(uk) || cn.includes(uk)) { catId = val; break; }
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
  
  // 5. Fix known wrong exercise mappings
  const wrongFixMap = {
    'ABDUCTORES EN MÁQUINA': 769, 'ABDUCTORES EN POLEA': 764,
    'ADUCTORES EN MÁQUINA': 778, 'ADUCTORES EN POLEA': 778,
    'BICICLETA ESTÁTICA (CALENTAMIENTO)': 1055,
    'STEP-UP CON MANCUERNAS': null,
    'ZANCADAS LATERALES': 572,
    'PESO MUERTO RUMANO CON BARRA': 513,
    'PESO MUERTO RUMANO CON MANCUERNAS': 507,
    'CRUNCH EN POLEA ALTA': 313,
    'ELEVACIONES LATERALES POLEA': 885,
    'PRESS FRANCÉS MANCUERNAS': 334,
    'MÁQUINA DE REMO (CALENTAMIENTO)': 385,
    'REMO EN MÁQUINA': 385,
    'PRENSA DE PIERNAS 45°': 393,
    'REMO CON BARRA (AGARRE SUPINO)': 1080,
    'SENTADILLA LIBRE CON BARRA': 1061,
    'PLANCHA ABDOMINAL': 614,
    'RUEDA ABDOMINAL': 1090,
    'SENTADILLA BÚLGARA': null,
    'SENTADILLA BICICLETA': null,
    'DOMINADAS (PRUEBA)': null,
  };
  
  let fixedWrong = 0;
  const allExercises = q("SELECT e.id, e.name FROM exercises e WHERE e.global_exercise_id IS NOT NULL", []);
  if (allExercises.length) {
    for (const [exId, exName] of allExercises[0].values) {
      const cn = exName.toUpperCase().trim();
      let newGeId = wrongFixMap[cn];
      if (newGeId === undefined) {
        for (const [key, val] of Object.entries(wrongFixMap)) {
          if (cn.startsWith(key) || cn.includes(key)) { newGeId = val; break; }
        }
      }
      if (newGeId !== undefined) {
        const current = qOne("SELECT global_exercise_id FROM exercises WHERE id = ?", [exId]);
        if (current && current[0]) {
          if (newGeId !== null && current[0] !== newGeId) {
            const gif = qOne("SELECT gif_url FROM global_exercises WHERE id = ?", [newGeId]);
            q("UPDATE exercises SET global_exercise_id = ?, gif_url = ? WHERE id = ?",
              [newGeId, gif ? gif[0] : null, exId]);
            fixedWrong++;
          } else if (newGeId === null) {
            q("UPDATE exercises SET global_exercise_id = NULL, gif_url = NULL WHERE id = ?", [exId]);
            fixedWrong++;
          }
        }
      }
    }
  }
  if (fixedWrong) console.log('Fixed', fixedWrong, 'wrong exercise mappings');
  
  // 6. Copy gif_url from global_exercises for any remaining exercises with missing GIFs
  q(`
    UPDATE exercises SET gif_url = (
      SELECT ge.gif_url FROM global_exercises ge
      WHERE ge.id = exercises.global_exercise_id
      AND ge.gif_url IS NOT NULL AND ge.gif_url != ''
    )
    WHERE global_exercise_id IS NOT NULL
    AND (exercises.gif_url IS NULL OR exercises.gif_url = '')
  `, []);
  const gifFixed = qOne("SELECT changes()");
  if (gifFixed && gifFixed[0] > 0) console.log('Copied', gifFixed[0], 'GIF URLs from catalog');
  
  // 7. Normalize empty gif_url strings to NULL for COALESCE compatibility
  q("UPDATE exercises SET gif_url = NULL WHERE gif_url = ''", []);
  q("UPDATE global_exercises SET gif_url = NULL WHERE gif_url = ''", []);
  
  // 8. Seed motivational quotes if empty
  const quoteCount = qOne("SELECT COUNT(*) FROM motivational_quotes");
  if (!quoteCount || quoteCount[0] === 0) {
    const quotes = [
      ["El éxito no es definitivo, el fracaso no es fatal: lo que cuenta es el valor para continuar.", "Winston Churchill"],
      ["No cuentes los días, haz que los días cuenten.", "Muhammad Ali"],
      ["El dolor que sientes hoy será la fuerza que tendrás mañana.", null],
      ["Los límites solo existen en tu mente. Supéralos.", null],
      ["El único mal entrenamiento es el que no hiciste.", null],
      ["Si sueñas con un cuerpo de playa, no esperes al verano para empezar.", null],
      ["No se trata de tener tiempo, se trata de hacer tiempo.", null],
      ["Las excusas no queman calorías.", null],
      ["Cada repetición te acerca a tu mejor versión.", null],
      ["La disciplina es el puente entre tus metas y tus logros.", "Jim Rohn"],
      ["El sacrificio de hoy es el éxito de mañana.", null],
      ["Tu único límite es tú mismo. Rompélo.", null],
      ["No te rindas. El principio siempre es lo más difícil.", null],
      ["El mejor proyecto en el que puedes trabajar eres tú mismo.", null],
      ["Sudor, esfuerzo y dedicación: la fórmula del éxito.", null],
      ["No esperes a estar listo, empieza y vuélvete listo en el camino.", null],
      ["El cuerpo logra lo que la mente cree.", null],
      ["Los campeones no se hacen en el gimnasio, se hacen de lo que llevan dentro.", null],
      ["Diez minutos de esfuerzo extra marcan la diferencia.", null],
      ["Hoy puede ser el día en que empieces a cambiar tu vida.", null],
      ["El orgullo de llegar lejos siempre supera el dolor del esfuerzo.", null],
      ["No dejes para mañana el cuerpo que puedes construir hoy.", null],
      ["La motivación te activa, la disciplina te mantiene.", null],
      ["El gimnasio no juzga, transforma.", null],
      ["Caer está permitido, levantarse es obligatorio.", null],
      ["Tu cuerpo escucha todo lo que tu mente dice. Háblale con fuerza.", null],
      ["Más peso, más reps, más constancia: mejores resultados.", null],
      ["El cambio no ocurre de la noche a la mañana, pero ocurre.", null],
      ["Invertir en tu salud es la mejor inversión de tu vida.", null],
      ["No necesitas ser extremo, necesitas ser constante.", null],
      ["El secreto está en aparecer, incluso cuando no tienes ganas.", null],
      ["Tu mayor rival está en el espejo. Superáte cada día.", null],
      ["La grasa no sabe lo fuerte que eres hasta que empiezas.", null],
      ["No busques resultados inmediatos, busca hábitos duraderos.", null],
      ["Una hora en el gimnasio son solo 4% de tu día. Vale la pena.", null],
      ["El dolor del ejercicio se olvida, la gloria del resultado permanece.", null],
      ["La única persona con la que debes competir es la que fuiste ayer.", null],
      ["Respira hondo, aprieta los dientes y dale todo.", null],
      ["Si puedes imaginarlo, puedes lograrlo. Si puedes soñarlo, puedes serlo.", "William Arthur Ward"],
      ["El éxito es la suma de pequeños esfuerzos repetidos día tras día.", "Robert Collier"],
    ];
    for (const [text, author] of quotes) {
      q("INSERT INTO motivational_quotes (text, author) VALUES (?, ?)", [text, author || null]);
    }
    console.log('Seeded', quotes.length, 'motivational quotes');
  }
  
  console.log('Migration complete');
}

module.exports = { migrate };
