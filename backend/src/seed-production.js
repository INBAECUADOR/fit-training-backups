const { getDb, saveDb } = require('./database');
const bcrypt = require('bcryptjs');

const USERS = [
  { doc: '1709534091', name: 'Paul Marin', days: [
    { label: 'Pecho - Bíceps',   groups: ['chest','arms'] },
    { label: 'Pierna',           groups: ['upper legs','lower legs'] },
    { label: 'Espalda - Tríceps',groups: ['back','arms'] },
    { label: 'Hombro',           groups: ['shoulders'] },
    { label: 'Full Body',        groups: ['cardio','chest','back','upper legs'] },
  ]},
  { doc: '1714076880', name: 'Diego Espinosa', days: [
    { label: 'Pecho - Hombro',   groups: ['chest','shoulders'] },
    { label: 'Espalda - Bíceps', groups: ['back','arms'] },
    { label: 'Pierna',           groups: ['upper legs','lower legs'] },
    { label: 'Hombro - Tríceps', groups: ['shoulders','arms'] },
    { label: 'Full Body',        groups: ['cardio','chest','back','upper legs'] },
  ]},
  { doc: '1713171823', name: 'Jorge Guzman', days: [
    { label: 'Pecho',    groups: ['chest'] },
    { label: 'Espalda',  groups: ['back'] },
    { label: 'Pierna',   groups: ['upper legs','lower legs'] },
    { label: 'Hombro',   groups: ['shoulders'] },
    { label: 'Brazo',    groups: ['arms'] },
    { label: 'Full Body',groups: ['cardio','chest','back','upper legs'] },
  ]},
  { doc: '123456789', name: 'Celia Pozo', days: [
    { label: 'Full Body A', groups: ['chest','back','upper legs'] },
    { label: 'Full Body B', groups: ['shoulders','arms','upper legs'] },
    { label: 'Full Body C', groups: ['chest','back','arms'] },
    { label: 'Cardio',      groups: ['cardio'] },
  ]},
  { doc: '1708352560', name: 'Sofía Alejandra Mendoza', days: [
    { label: 'Full Body A', groups: ['chest','back','upper legs'] },
    { label: 'Full Body B', groups: ['shoulders','arms','upper legs'] },
    { label: 'Full Body C', groups: ['chest','back','arms'] },
    { label: 'Cardio + Core', groups: ['cardio'] },
  ]},
];

const MEAL_PLAN = {
  'Lunes':    { breakfast: 'Avena con fruta y huevos revueltos', morning_snack: 'Yogur griego con granola', lunch: 'Pollo a la plancha con arroz integral y ensalada', afternoon_snack: 'Batido de proteína con plátano', dinner: 'Pescado al vapor con verduras salteadas' },
  'Martes':   { breakfast: 'Tostadas integrales con aguacate y huevo', morning_snack: 'Manzana con mantequilla de maní', lunch: 'Carne magra con quinoa y espárragos', afternoon_snack: 'Queso cottage con frutos rojos', dinner: 'Pechuga de pavo con ensalada César' },
  'Miércoles':{ breakfast: 'Smoothie de proteína con espinacas y fruta', morning_snack: 'Mix de nueces y almendras', lunch: 'Salmón al horno con patata dulce y brócoli', afternoon_snack: 'Barra de proteína', dinner: 'Tortilla de claras con espinacas y champiñones' },
  'Jueves':   { breakfast: 'Panqueques de avena con miel y fruta', morning_snack: 'Batido verde con kale y manzana', lunch: 'Lomo de cerdo con arroz integral y vegetales', afternoon_snack: 'Yogur natural con semillas', dinner: 'Ensalada de atún con garbanzos y verduras' },
  'Viernes':  { breakfast: 'Huevos revueltos con espinacas y queso', morning_snack: 'Fruta fresca con almendras', lunch: 'Pollo al curry con arroz basmati', afternoon_snack: 'Batido de frutos rojos', dinner: 'Merluza a la plancha con puré de coliflor' },
  'Sábado':   { breakfast: 'Bowl de açaí con granola y fruta', morning_snack: 'Huevo duro con bastones de zanahoria', lunch: 'Bistec con papas al horno y ensalada', afternoon_snack: 'Smoothie bowl', dinner: 'Pizza integral casera con vegetales' },
  'Domingo':  { breakfast: 'Chilaquiles saludables con pollo', morning_snack: 'Puñado de frutos secos', lunch: 'Pavo al horno con camote y espinacas', afternoon_snack: 'Yogur griego con miel', dinner: 'Sopa de verduras con pollo desmenuzado' },
};

const DAY_NAMES = ['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'];

async function seedProductionUsers() {
  const db = await getDb();

  // Check if any production user exists
  const paul = db.exec(`SELECT id FROM users WHERE document_id = '1709534091'`);
  if (paul.length > 0 && paul[0].values.length > 0) {
    return; // already created
  }

  // Get global exercise catalog
  const catResult = db.exec(`SELECT id, name_es, name, muscle_group, gif_url FROM global_exercises`);
  const catalog = catResult.length > 0 ? catResult[0].values.map(r => ({
    id: r[0], name_es: r[1], name: r[2], muscle_group: r[3], gif_url: r[4],
  })) : [];

  // Group by muscle group
  const byGroup = {};
  for (const ex of catalog) {
    const g = ex.muscle_group;
    if (!byGroup[g]) byGroup[g] = [];
    byGroup[g].push(ex);
  }

  let totalCreated = 0;
  const hashedPassword = bcrypt.hashSync('1234', 10);

  for (const userDef of USERS) {
    const existing = db.exec(`SELECT id FROM users WHERE document_id = ?`, [userDef.doc]);
    if (existing.length > 0 && existing[0].values.length > 0) continue;

    // Create user with password = document_id
    const pw = bcrypt.hashSync(userDef.doc, 10);
    db.run(`INSERT INTO users (document_id, email, name, password, role, membership_start_date, membership_end_date) VALUES (?, ?, ?, ?, 'user', '2025-01-01', '2026-12-31')`,
      [userDef.doc, `user-${userDef.doc}@fit.com`, userDef.name, pw]);
    const uidRes = db.exec(`SELECT id FROM users WHERE document_id = ?`, [userDef.doc]);
    const uid = uidRes[0].values[0][0];

    // Create routines and exercises
    let dayCount = 0;
    for (let d = 0; d < userDef.days.length; d++) {
      const dd = userDef.days[d];
      const dayName = DAY_NAMES[d] || `Día ${d+1}`;
      db.run(`INSERT INTO routines (user_id, day_name, day_label) VALUES (?, ?, ?)`, [uid, dayName, dd.label]);
      const ridRes = db.exec(`SELECT id FROM routines WHERE user_id = ? AND day_name = ?`, [uid, dayName]);
      const rid = ridRes[0].values[0][0];

      let picked = [];
      for (const g of dd.groups) {
        const pool = byGroup[g] || [];
        for (const ex of pool) {
          if (picked.length >= 8) break;
          if (!picked.find(p => p.id === ex.id)) {
            picked.push(ex);
          }
        }
        if (picked.length >= 8) break;
      }

      for (const ex of picked) {
        db.run(`INSERT INTO exercises (routine_id, name, series, reps, rest, observation, gif_url, global_exercise_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [rid, ex.name_es || ex.name, 12, 4, '60', '', ex.gif_url || '', ex.id]);
      }
      dayCount++;
    }

    // Create diet
    for (const [dayName, meals] of Object.entries(MEAL_PLAN)) {
      for (const [mealType, desc] of Object.entries(meals)) {
        db.run(`INSERT INTO diets (user_id, day_name, meal_type, description) VALUES (?, ?, ?, ?)`,
          [uid, dayName, mealType, desc]);
      }
    }

    totalCreated++;
    console.log(`Created production user #${uid}: ${userDef.name} (${userDef.days.length} days, ${Object.keys(MEAL_PLAN).length}-day diet)`);
  }

  if (totalCreated > 0) {
    saveDb();
    console.log(`Created ${totalCreated} production users`);
  }
}

module.exports = { seedProductionUsers };
