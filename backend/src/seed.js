const { getDb, saveDb } = require('./database');

async function seed() {
  const db = await getDb();

  const existingUser = db.exec(`SELECT id FROM users WHERE document_id = '1717798274'`);
  if (existingUser.length > 0 && existingUser[0].values.length > 0) {
    console.log('Data already seeded');
    return;
  }

  const bcrypt = require('bcryptjs');
  const hashedPassword = bcrypt.hashSync('1234', 10);

  db.run(`INSERT INTO users (document_id, name, password) VALUES (?, ?, ?)`,
    ['1717798274', 'Rafael Bernardo Enriquez Vargas', hashedPassword]);

  const userId = 1;

  const routines = [
    { day: 'Lunes', label: 'PECHO - BICEPS' },
    { day: 'Martes', label: 'Piernas' },
    { day: 'Miércoles', label: 'Espalda-Triceps' },
    { day: 'Jueves', label: 'Hombros' },
    { day: 'Viernes', label: 'Compuestos' },
  ];

  for (const r of routines) {
    db.run(`INSERT INTO routines (user_id, day_name, day_label) VALUES (?, ?, ?)`,
      [userId, r.day, r.label]);
  }

  const exercisesByDay = {
    'Lunes': [
      { name: 'PRESS DE BANCA CON BARRA', series: 12, reps: 4, obs: 'Subiendo el peso', gif: 'c708853b-5afd-4fce-9e39-a5f7c335206b' },
      { name: 'PRESS DE BANCA CON MANCUERNAS', series: 10, reps: 4, obs: 'Pesado', gif: 'bc9231d9-eaa8-4839-b068-a7c10f0c67e6' },
      { name: 'CRUCE DE POLEA', series: 12, reps: 4, obs: 'Pesado', gif: 'ad0fb43e-d1b4-42c7-93e1-302ac49117dd' },
      { name: 'PRESS DE BANCA CON BARRA (Pecho alto)', series: 12, reps: 4, obs: 'Pecho alto (Subiendo el peso)', gif: 'c708853b-5afd-4fce-9e39-a5f7c335206b' },
      { name: 'FONDO INMERSIONES PECHO', series: 12, reps: 4, obs: '', gif: 'f8cdab4e-f2e9-448b-a2f1-55665f86f7be' },
      { name: 'CURL CON BARRA', series: 12, reps: 4, obs: 'Subiendo el peso', gif: '5055e4f5-8057-46d5-85ec-1cfc54319f09' },
      { name: 'CURL PREDICADOR CON BARRA Z', series: 12, reps: 4, obs: '', gif: '3193524a-52d2-456a-8765-c00d95118526' },
      { name: 'CURL DE MARTILLO', series: 12, reps: 4, obs: 'Subiendo el peso', gif: '1fa381b2-27e6-4786-82de-088aaf70bd57' },
    ],
    'Martes': [
      { name: 'SENTADILLAS CON BARRA', series: 12, reps: 4, obs: 'Subiendo el peso', gif: 'e2c1d36a-dbef-4743-8144-28978b039ecc' },
      { name: 'PRENSA DE PIERNAS', series: 15, reps: 4, obs: 'Subiendo el peso', gif: '11e366d1-debd-474b-8097-8183fcac8edd' },
      { name: 'MÁQUINA HACK DE SENTADILLAS', series: 15, reps: 4, obs: 'Subiendo el peso', gif: 'b3517328-1930-46de-9f5e-6da915c9f1b2' },
      { name: 'EXTENSIÓN DE PIERNA', series: 12, reps: 4, obs: 'Subiendo el peso', gif: '149cf620-14d7-4b4c-917f-61933812986d' },
      { name: 'PESO MUERTO DE SUMO', series: 12, reps: 4, obs: 'Subiendo el peso', gif: '52fa9d29-23fc-434a-9b8e-43702b320509' },
      { name: 'ABDUCTOR EN MAQUINA', series: 20, reps: 4, obs: 'Subiendo el peso', gif: 'bea821e0-532d-4d36-a4f8-1e32cb4dcd94' },
      { name: 'LEVANTAMIENTO DE PANTORRILLAS DE PIE', series: 20, reps: 4, obs: 'Maquina pesado', gif: 'bf0be815-ed97-4394-9b8a-9753e1d58081' },
    ],
    'Miércoles': [
      { name: 'DOMINADAS', series: 10, reps: 6, obs: '', gif: '885e8fd8-0e13-471a-960c-694499c11fe5' },
      { name: 'PRESS DE BANCA CON BARRA', series: 12, reps: 6, obs: '', gif: 'c708853b-5afd-4fce-9e39-a5f7c335206b' },
      { name: 'REMO CON MANCUERNAS', series: 12, reps: 4, obs: '', gif: '7bb8c6b1-fe63-4593-9887-0d14b143289b' },
      { name: 'MÁQUINA MARIPOSA', series: 12, reps: 4, obs: '', gif: '3426a84c-6788-497f-aa0a-71c9a0e80898' },
      { name: 'JALÓN LATERAL AL PECHO POLEA', series: 12, reps: 4, obs: '', gif: 'ed0bc8df-2436-4c41-a192-34d0e30d1271' },
      { name: 'PRESS DE BANCA CON MANCUERNAS', series: 12, reps: 4, obs: '', gif: 'bc9231d9-eaa8-4839-b068-a7c10f0c67e6' },
      { name: 'CURL CON BARRA', series: 12, reps: 4, obs: '', gif: '5055e4f5-8057-46d5-85ec-1cfc54319f09' },
      { name: 'CURL DE MARTILLO', series: 12, reps: 4, obs: '', gif: '1fa381b2-27e6-4786-82de-088aaf70bd57' },
      { name: 'JALÓN TRÍCEPS CON POLEA', series: 12, reps: 4, obs: '', gif: '7d2b25d8-b33a-4a83-a383-3f556482ac07' },
      { name: 'TRÍCEPS INCLINADO CON BARRA', series: 10, reps: 4, obs: '', gif: '4afdd330-c4e9-4f99-8aeb-73aea92755ce' },
    ],
    'Jueves': [
      { name: 'PRENSA DE HOMBROS MAQUINA', series: 12, reps: 4, obs: 'Subiendo el peso', gif: '03e7855e-5e4a-4cbc-9a93-4ad4fd86b87a' },
      { name: 'PRESS DE HOMBROS CON MANCUERNAS', series: 10, reps: 4, obs: 'Subiendo el peso', gif: '743d7f81-0ab2-4145-b646-32b530f75272' },
      { name: 'ELEVACIONES LATERALES INCLINADAS CON MANCUERNAS', series: 10, reps: 4, obs: '', gif: '1741404f-63bd-4f3e-b1ae-ba90936586df' },
      { name: 'ELEVACIONES FRONTALES ALTERNAS CON MANCUERNAS', series: 12, reps: 4, obs: 'Pesado', gif: '69d9759f-9201-4bd1-ae23-6284b5618229' },
      { name: 'ELEVACIÓN DE 6 VÍAS CON MANCUERNAS', series: 12, reps: 4, obs: 'Pesado', gif: 'be1b75bb-b828-4487-a4cf-f8d40ca31cf0' },
      { name: 'TIRÓN DEL CUELLO CON MANCUERNAS', series: 20, reps: 4, obs: 'Pesado', gif: 'f95fadb6-7243-4109-bf33-27ff7bbf55dd' },
      { name: 'ELEVACIÓN FRONTAL DEL CUELLO SENTADO', series: 20, reps: 4, obs: 'Pesado', gif: 'b3085be5-c0cc-41ca-9816-14b0f2123869' },
    ],
    'Viernes': [
      { name: 'DOMINADAS', series: 10, reps: 6, obs: '', gif: '885e8fd8-0e13-471a-960c-694499c11fe5' },
      { name: 'PRESS DE BANCA CON BARRA', series: 12, reps: 6, obs: '', gif: 'c708853b-5afd-4fce-9e39-a5f7c335206b' },
      { name: 'REMO CON MANCUERNAS', series: 12, reps: 4, obs: '', gif: '7bb8c6b1-fe63-4593-9887-0d14b143289b' },
      { name: 'MÁQUINA MARIPOSA', series: 12, reps: 4, obs: '', gif: '3426a84c-6788-497f-aa0a-71c9a0e80898' },
      { name: 'JALÓN LATERAL AL PECHO POLEA', series: 12, reps: 4, obs: '', gif: 'ed0bc8df-2436-4c41-a192-34d0e30d1271' },
      { name: 'PRESS DE BANCA CON MANCUERNAS', series: 12, reps: 4, obs: '', gif: 'bc9231d9-eaa8-4839-b068-a7c10f0c67e6' },
      { name: 'CURL CON BARRA', series: 12, reps: 4, obs: '', gif: '5055e4f5-8057-46d5-85ec-1cfc54319f09' },
      { name: 'CURL DE MARTILLO', series: 12, reps: 4, obs: '', gif: '1fa381b2-27e6-4786-82de-088aaf70bd57' },
      { name: 'JALÓN TRÍCEPS CON POLEA', series: 12, reps: 4, obs: '', gif: '7d2b25d8-b33a-4a83-a383-3f556482ac07' },
      { name: 'TRÍCEPS INCLINADO CON BARRA', series: 10, reps: 4, obs: '', gif: '4afdd330-c4e9-4f99-8aeb-73aea92755ce' },
    ],
  };

  const routineIds = {};

  for (const r of routines) {
    const res = db.exec(`SELECT id FROM routines WHERE user_id = ? AND day_name = ?`, [userId, r.day]);
    if (res.length > 0) {
      routineIds[r.day] = res[0].values[0][0];
    }
  }

  for (const [day, exercises] of Object.entries(exercisesByDay)) {
    const routineId = routineIds[day];
    for (const ex of exercises) {
      db.run(`INSERT INTO exercises (routine_id, name, series, reps, observation, gif_url) VALUES (?, ?, ?, ?, ?, ?)`,
        [routineId, ex.name, ex.series, ex.reps, ex.obs, ex.gif]);
    }
  }

  saveDb();
  console.log('Database seeded successfully!');
}

seed().catch(console.error);
