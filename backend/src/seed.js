const { getDb, saveDb } = require('./database');

async function seed() {
  const db = await getDb();

  const bcrypt = require('bcryptjs');

  const existingUser = db.exec(`SELECT id FROM users WHERE document_id = '1717798274'`);
  if (existingUser.length > 0 && existingUser[0].values.length > 0) {
    const hashed = bcrypt.hashSync('I5M]El', 10);
    db.run(`UPDATE users SET role = 'admin', email = 'jose.enriquez1990@hotmail.com', password = ? WHERE document_id = '1717798274'`, [hashed]);
    console.log('Admin info updated');
    return;
  }

  const hashedPassword = bcrypt.hashSync('I5M]El', 10);

  db.run(`INSERT INTO users (document_id, email, name, password, role) VALUES (?, ?, ?, ?, ?)`,
    ['1717798274', 'jose.enriquez1990@hotmail.com', 'Admin', hashedPassword, 'admin']);

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

const TEST_USERS = [
  { doc: '10000001', name: 'Carlos Mendoza' },
  { doc: '10000002', name: 'Ana García' },
  { doc: '10000003', name: 'Luis Fernández' },
  { doc: '10000004', name: 'María López' },
  { doc: '10000005', name: 'Pedro Sánchez' },
  { doc: '10000006', name: 'Laura Martínez' },
  { doc: '10000007', name: 'Diego Ramírez' },
  { doc: '10000008', name: 'Sofía Torres' },
  { doc: '10000009', name: 'Andrés Castillo' },
  { doc: '10000010', name: 'Valentina Gómez' },
];

const SAMPLE_MEALS = {
  breakfast: 'Avenida con frutas y proteína',
  morning_snack: 'Yogur griego con granola',
  lunch: 'Pechuga de pollo con arroz integral y verduras',
  afternoon_snack: 'Batido de proteína con banana',
  dinner: 'Pescado a la plancha con ensalada',
};

const DIET_DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

async function seedTestUsers() {
  const db = await getDb();
  const bcrypt = require('bcryptjs');
  const hashedPassword = bcrypt.hashSync('1234', 10);
  let created = 0;

  for (const u of TEST_USERS) {
    const existing = db.exec(`SELECT id FROM users WHERE document_id = ?`, [u.doc]);
    if (existing.length > 0 && existing[0].values.length > 0) continue;

    db.run(`INSERT INTO users (document_id, email, name, password, role) VALUES (?, ?, ?, ?, 'user')`, [u.doc, '', u.name, hashedPassword]);
    const res = db.exec(`SELECT id FROM users WHERE document_id = ?`, [u.doc]);
    const userId = res[0].values[0][0];

    const routines = [
      { day: 'Lunes', label: 'PECHO - BICEPS' },
      { day: 'Martes', label: 'Piernas' },
      { day: 'Miércoles', label: 'Espalda-Triceps' },
      { day: 'Jueves', label: 'Hombros' },
      { day: 'Viernes', label: 'Compuestos' },
    ];

    for (const r of routines) {
      db.run(`INSERT INTO routines (user_id, day_name, day_label) VALUES (?, ?, ?)`, [userId, r.day, r.label]);
    }

    const exercisesByDay = {
      'Lunes': [
        { name: 'PRESS DE BANCA CON BARRA', series: 12, reps: 4, obs: 'Subiendo el peso', gif: 'c708853b-5afd-4fce-9e39-a5f7c335206b' },
        { name: 'PRESS DE BANCA CON MANCUERNAS', series: 10, reps: 4, obs: 'Pesado', gif: 'bc9231d9-eaa8-4839-b068-a7c10f0c67e6' },
        { name: 'CRUCE DE POLEA', series: 12, reps: 4, obs: 'Pesado', gif: 'ad0fb43e-d1b4-42c7-93e1-302ac49117dd' },
        { name: 'CURL CON BARRA', series: 12, reps: 4, obs: 'Subiendo el peso', gif: '5055e4f5-8057-46d5-85ec-1cfc54319f09' },
        { name: 'CURL DE MARTILLO', series: 12, reps: 4, obs: 'Subiendo el peso', gif: '1fa381b2-27e6-4786-82de-088aaf70bd57' },
      ],
      'Martes': [
        { name: 'SENTADILLAS CON BARRA', series: 12, reps: 4, obs: 'Subiendo el peso', gif: 'e2c1d36a-dbef-4743-8144-28978b039ecc' },
        { name: 'PRENSA DE PIERNAS', series: 15, reps: 4, obs: 'Subiendo el peso', gif: '11e366d1-debd-474b-8097-8183fcac8edd' },
        { name: 'EXTENSIÓN DE PIERNA', series: 12, reps: 4, obs: 'Subiendo el peso', gif: '149cf620-14d7-4b4c-917f-61933812986d' },
        { name: 'PESO MUERTO DE SUMO', series: 12, reps: 4, obs: 'Subiendo el peso', gif: '52fa9d29-23fc-434a-9b8e-43702b320509' },
      ],
      'Miércoles': [
        { name: 'DOMINADAS', series: 10, reps: 6, obs: '', gif: '885e8fd8-0e13-471a-960c-694499c11fe5' },
        { name: 'REMO CON MANCUERNAS', series: 12, reps: 4, obs: '', gif: '7bb8c6b1-fe63-4593-9887-0d14b143289b' },
        { name: 'JALÓN LATERAL AL PECHO POLEA', series: 12, reps: 4, obs: '', gif: 'ed0bc8df-2436-4c41-a192-34d0e30d1271' },
        { name: 'JALÓN TRÍCEPS CON POLEA', series: 12, reps: 4, obs: '', gif: '7d2b25d8-b33a-4a83-a383-3f556482ac07' },
      ],
      'Jueves': [
        { name: 'PRENSA DE HOMBROS MAQUINA', series: 12, reps: 4, obs: 'Subiendo el peso', gif: '03e7855e-5e4a-4cbc-9a93-4ad4fd86b87a' },
        { name: 'PRESS DE HOMBROS CON MANCUERNAS', series: 10, reps: 4, obs: 'Subiendo el peso', gif: '743d7f81-0ab2-4145-b646-32b530f75272' },
        { name: 'ELEVACIONES LATERALES INCLINADAS CON MANCUERNAS', series: 10, reps: 4, obs: '', gif: '1741404f-63bd-4f3e-b1ae-ba90936586df' },
      ],
      'Viernes': [
        { name: 'DOMINADAS', series: 10, reps: 6, obs: '', gif: '885e8fd8-0e13-471a-960c-694499c11fe5' },
        { name: 'PRESS DE BANCA CON BARRA', series: 12, reps: 6, obs: '', gif: 'c708853b-5afd-4fce-9e39-a5f7c335206b' },
        { name: 'REMO CON MANCUERNAS', series: 12, reps: 4, obs: '', gif: '7bb8c6b1-fe63-4593-9887-0d14b143289b' },
        { name: 'CURL CON BARRA', series: 12, reps: 4, obs: '', gif: '5055e4f5-8057-46d5-85ec-1cfc54319f09' },
        { name: 'JALÓN TRÍCEPS CON POLEA', series: 12, reps: 4, obs: '', gif: '7d2b25d8-b33a-4a83-a383-3f556482ac07' },
      ],
    };

    const routinesRes = db.exec(`SELECT id, day_name FROM routines WHERE user_id = ?`, [userId]);
    const routineIds = {};
    for (const row of routinesRes[0].values) { routineIds[row[1]] = row[0]; }

    for (const [day, exercises] of Object.entries(exercisesByDay)) {
      const routineId = routineIds[day];
      for (const ex of exercises) {
        db.run(`INSERT INTO exercises (routine_id, name, series, reps, observation, gif_url) VALUES (?, ?, ?, ?, ?, ?)`,
          [routineId, ex.name, ex.series, ex.reps, ex.obs, ex.gif]);
      }
    }

    for (const day of DIET_DIAS) {
      for (const [mealKey, desc] of Object.entries(SAMPLE_MEALS)) {
        db.run(`INSERT INTO diets (user_id, day_name, meal_type, description) VALUES (?, ?, ?, ?)`,
          [userId, day, mealKey, u.name.includes('Ana') || u.name.includes('María') || u.name.includes('Sofía') || u.name.includes('Laura') || u.name.includes('Valentina')
            ? desc.replace('Pechuga de pollo', 'Tofu').replace('Pescado', 'Salmón')
            : desc]);
      }
    }

    created++;
  }

  if (created > 0) { saveDb(); console.log(`${created} usuarios de prueba creados con rutinas y dietas`); }
}

async function seedGlobalExercises() {
  const db = await getDb();

  const existing = db.exec(`SELECT COUNT(*) FROM global_exercises`);
  const count = existing.length > 0 ? existing[0].values[0][0] : 0;
  if (count > 0) { console.log(`Catálogo global ya tiene ${count} ejercicios`); return; }

  const exercisesByGroup = {
    'Pecho': ['Press de banca con barra','Press de banca con mancuernas','Press de banca inclinado con barra','Press de banca inclinado con mancuernas','Press de banca declinado con barra','Press de banca declinado con mancuernas','Aperturas con mancuernas en banco plano','Aperturas con mancuernas en banco inclinado','Aperturas en polea (cruce de poleas)','Pullover con mancuerna','Pullover en polea','Fondos en paralelas (pecho)','Flexiones de brazos','Flexiones diamante','Flexiones declinadas','Flexiones inclinadas','Máquina de pecho (press)','Máquina de aperturas (pec deck)','Press en máquina Smith','Press inclinado en máquina Smith','Push-up con banda elástica','Flexiones con palmada','Press con kettlebells','Contractor de pecho en polea'],
    'Espalda': ['Dominadas (pull-ups)','Dominadas con agarre amplio','Dominadas con agarre cerrado','Dominadas con peso','Manejas (chin-ups)','Remo con barra','Remo con mancuerna a una mano','Remo en máquina','Remo en polea baja (sentado)','Remo en polea con agarre V','Remo en T','Jalón al pecho en polea (lat pulldown)','Jalón al pecho con agarre amplio','Jalón al pecho con agarre cerrado','Jalón tras nuca','Peso muerto convencional','Peso muerto rumano','Peso muerto sumo','Peso muerto con piernas rígidas','Hiperextensiones (espalda baja)','Buenos días (good mornings)','Encogimientos de hombros con barra (shrugs)','Encogimientos de hombros con mancuernas','Face pull en polea','Pull-down con cuerda','Remo invertido (inverted row)','Pájaro (reverse fly) en máquina','Pájaro con mancuernas inclinado','Máquina de espalda baja'],
    'Piernas': ['Sentadilla con barra','Sentadilla frontal','Sentadilla goblet','Sentadilla búlgara','Sentadilla con copa','Prensa de piernas','Prensa inclinada','Máquina hack squat','Extensión de piernas en máquina','Curl femoral acostado','Curl femoral sentado','Curl femoral de pie','Peso muerto rumano','Peso muerto con piernas rígidas','Zancadas (lunges)','Zancadas laterales','Zancadas con barra','Zancadas con mancuernas','Zancadas inversas','Step-ups','Sentadilla en máquina Smith','Sentadilla con salto','Puente de glúteos','Puente de glúteos a una pierna','Empuje de cadera (hip thrust)','Abducción de cadera en máquina','Aducción de cadera en máquina','Elevación de talones de pie (pantorrillas)','Elevación de talones sentado','Elevación de talones en prensa','Peso muerto a una pierna'],
    'Hombros': ['Press militar con barra','Press militar con mancuernas','Press Arnold','Press en máquina de hombros','Press con mancuernas sentado','Elevaciones laterales con mancuernas','Elevaciones laterales inclinado','Elevaciones laterales en polea','Elevaciones frontales con mancuernas','Elevaciones frontales con barra','Elevaciones frontales en polea','Elevaciones de 6 vías','Pájaros (reverse fly) inclinado','Pájaros en máquina','Face pull en polea','Tirón al mentón con barra (upright row)','Tirón al mentón en polea','Press con kettlebells por encima de la cabeza','Círculos con mancuernas','Máquina de hombros laterales'],
    'Bíceps': ['Curl con barra (parado)','Curl con barra Z','Curl con mancuernas alternado','Curl martillo','Curl martillo con cuerda en polea','Curl predicador con barra Z','Curl predicador con mancuerna','Curl concentrado','Curl en banco inclinado','Curl en polea baja','Curl en polea alta','Curl con banda elástica','Curl spider','Curl inverso con barra','Curl de muñecas','Curl con agarre martillo sentado','Curl en máquina','Curl con barra EZ agarre inverso'],
    'Tríceps': ['Jalón de tríceps en polea (cuerda)','Jalón de tríceps en polea (barra recta)','Jalón de tríceps en polea (barra V)','Jalón de tríceps a una mano','Fondos en paralelas (tríceps)','Fondos en banco (bench dips)','Press francés con barra EZ (acostado)','Press francés con mancuerna (acostado)','Press francés sentado','Extensión de tríceps sobre cabeza con mancuerna','Extensión de tríceps sobre cabeza con cuerda','Patada de tríceps con mancuerna (kickback)','Patada de tríceps en polea','Press de banca con agarre cerrado','Flexiones diamante','Pushdown con banda elástica','Máquina de tríceps'],
    'Abdominales': ['Crunches','Crunches en máquina','Crunches con cable','Elevación de piernas colgado','Elevación de piernas acostado','Elevación de rodillas colgado','Plancha frontal','Plancha lateral','Plancha con peso','Rueda abdominal (ab wheel)','Russian twists','V-ups','Bicicleta (bicycle crunches)','Toques a los pies (toe touches)','Mountain climbers','Sit-ups','Sit-ups en banco inclinado','Encogimientos con cable de pie','Pallof press','Dead bug','Puente abdominal','L-sit','Pike con rueda abdominal','Crunches con pelota suiza'],
    'Glúteos': ['Empuje de cadera (hip thrust)','Empuje de cadera a una pierna','Puente de glúteos','Puente de glúteos con peso','Sentadilla profunda','Zancadas','Peso muerto rumano','Patada de glúteo en polea','Patada de glúteo en máquina','Abducción de cadera en máquina','Hiperextensiones invertidas','Step-ups con peso','Peso muerto a una pierna','Sentadilla búlgara'],
    'Trapecio': ['Encogimientos de hombros con barra (shrugs)','Encogimientos de hombros con mancuernas','Encogimientos de hombros en máquina','Tirón al mentón con barra (upright row)','Face pull','Peso muerto (isométrico de trapecio)','Remo con barra (agarre amplio)','Pájaro invertido en máquina'],
    'Antebrazos': ['Curl de muñecas con barra','Curl de muñecas con mancuerna','Extensión de muñecas con barra','Extensión de muñecas con mancuerna','Curl inverso con barra','Curl de muñecas tras espalda','Colgada muerta (dead hang)','Caminata del granjero (farmer walk)','Pinch grip hold','Rodillo de muñeca (wrist roller)'],
    'Cardio': ['Correr en cinta','Bicicleta estática','Elíptica','Remo ergómetro','Escaladora (stair climber)','Saltar la cuerda','Burpees','Saltos de tijera (jumping jacks)','High knees','Battle ropes','Sled push','Sled pull','Kettlebell swings','Box jumps','Carrera al aire libre','Natación','Ciclismo','Caminata rápida'],
    'Compuestos': ['Peso muerto convencional','Sentadilla con barra','Press de banca con barra','Press militar con barra','Dominadas','Cargada de potencia (power clean)','Cargada de potencia con mancuernas','Envíon (clean & jerk)','Arrancada (snatch)','Peso muerto con barra hexagonal (trap bar)','Remo con barra','Sentadilla frontal','Zancadas con barra','Thruster (sentadilla + press)','Burpee con salto','Turkish get-up','Peso muerto sumo con tirón al mentón','Kettlebell swing'],
  };

  let inserted = 0;
  for (const [group, list] of Object.entries(exercisesByGroup)) {
    for (const name of list) {
      db.run(`INSERT INTO global_exercises (name, muscle_group) VALUES (?, ?)`, [name, group]);
      inserted++;
    }
  }
  saveDb();
  console.log(`Catálogo global seedeado con ${inserted} ejercicios en ${Object.keys(exercisesByGroup).length} grupos`);
}

if (require.main === module) {
  seed().catch(console.error);
  seedGlobalExercises().catch(console.error);
  seedTestUsers().catch(console.error);
}

module.exports = { seed, seedGlobalExercises, seedTestUsers };
