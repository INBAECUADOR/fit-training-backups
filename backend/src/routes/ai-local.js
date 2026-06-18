const { getDb } = require('../database');

const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
const MEAL_TYPES = ['breakfast', 'morning_snack', 'lunch', 'afternoon_snack', 'dinner'];
const MEAL_LABELS = { breakfast: 'Desayuno', morning_snack: 'Snack Mañana', lunch: 'Almuerzo', afternoon_snack: 'Snack Tarde', dinner: 'Cena' };

const MUSCLE_MAP = {
  pectorals: 'push', chest: 'push',
  delts: 'push', shoulders: 'push',
  triceps: 'push',
  lats: 'pull', 'upper back': 'pull', back: 'pull',
  biceps: 'pull',
  forearms: 'pull',
  quads: 'legs', 'upper legs': 'legs',
  hamstrings: 'legs',
  glutes: 'legs',
  calves: 'legs', 'lower legs': 'legs',
  adductors: 'legs', abductors: 'legs',
  abs: 'core', waist: 'core', spine: 'core',
  traps: 'pull',
  'cardiovascular system': 'cardio', cardio: 'cardio',
  'serratus anterior': 'push',
  'levator scapulae': 'pull',
  arms: 'push',
};

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pick(arr, n) {
  const shuffled = shuffle(arr);
  return shuffled.slice(0, n);
}

const OBSERVATIONS = [
  'Mantener el núcleo contraído durante todo el movimiento',
  'Controlar la fase excéntrica, no usar impulso',
  'Respirar: inspirar en la bajada, espirar en el esfuerzo',
  'No bloquear las articulaciones al final del movimiento',
  'Mantener los hombros hacia atrás y el pecho arriba',
  'Ejecutar el movimiento completo, sin acortar el rango',
  'Mantener las muñecas neutras y firmes',
  'Apretar el músculo objetivo en la contracción máxima',
  'No arquear la espalda, mantener posición neutra',
  'Realizar el movimiento lentamente, 2-1-2 tempo',
];

function getObs(id) {
  const idx = (id || 0) % OBSERVATIONS.length;
  return OBSERVATIONS[idx];
}

async function getExercisePool() {
  const db = await getDb();
  const r = db.exec(`SELECT id, name, name_es, muscle_group, gif_url FROM global_exercises WHERE name != ''`);
  if (!r.length) return {};
  const pool = {};
  for (const row of r[0].values) {
    const mg = (row[3] || '').trim().toLowerCase();
    const cat = MUSCLE_MAP[mg] || 'other';
    if (!pool[cat]) pool[cat] = [];
    pool[cat].push({
      id: row[0],
      name: row[2] || row[1],
      name_en: row[1],
      muscle_group: mg,
      gif_url: row[4] || '',
    });
  }
  return pool;
}

// Training splits by days
const SPLITS = {
  '3': [
    { label: 'PUSH (Pecho, Hombros, Tríceps)', cats: ['push'], name: 'PUSH' },
    { label: 'PULL (Espalda, Bíceps)', cats: ['pull'], name: 'PULL' },
    { label: 'PIERNA + CORE', cats: ['legs', 'core'], name: 'PIERNA + CORE' },
  ],
  '4': [
    { label: 'PECHO - HOMBROS - TRÍCEPS', cats: ['push'], name: 'PECHO - HOMBROS - TRÍCEPS' },
    { label: 'ESPALDA - BÍCEPS', cats: ['pull'], name: 'ESPALDA - BÍCEPS' },
    { label: 'PIERNA - GLÚTEOS', cats: ['legs'], name: 'PIERNA - GLÚTEOS' },
    { label: 'CUERPO COMPLETO', cats: ['push', 'pull', 'legs', 'core'], name: 'CUERPO COMPLETO' },
  ],
  '5': [
    { label: 'PECHO - BÍCEPS', cats: ['push'], subcats: ['pectorals', 'biceps'], name: 'PECHO - BÍCEPS' },
    { label: 'ESPALDA - TRÍCEPS', cats: ['pull'], subcats: ['lats', 'triceps'], name: 'ESPALDA - TRÍCEPS' },
    { label: 'PIERNA - GLÚTEOS', cats: ['legs'], name: 'PIERNA - GLÚTEOS' },
    { label: 'HOMBROS - ABDOMEN', cats: ['push', 'core'], subcats: ['delts', 'abs'], name: 'HOMBROS - ABDOMEN' },
    { label: 'CUERPO COMPLETO', cats: ['push', 'pull', 'legs', 'core'], name: 'CUERPO COMPLETO' },
  ],
  '6': [
    { label: 'PECHO - HOMBROS', cats: ['push'], subcats: ['pectorals', 'delts'], name: 'PECHO - HOMBROS' },
    { label: 'ESPALDA - BÍCEPS', cats: ['pull'], name: 'ESPALDA - BÍCEPS' },
    { label: 'PIERNA - CUÁDRICEPS', cats: ['legs'], subcats: ['quads', 'upper legs'], name: 'PIERNA - CUÁDRICEPS' },
    { label: 'HOMBROS - TRÍCEPS', cats: ['push'], subcats: ['delts', 'triceps'], name: 'HOMBROS - TRÍCEPS' },
    { label: 'ESPALDA - TRAPS', cats: ['pull'], subcats: ['lats', 'traps'], name: 'ESPALDA - TRAPS' },
    { label: 'PIERNA - GLÚTEOS - CORE', cats: ['legs', 'core'], name: 'PIERNA - GLÚTEOS - CORE' },
  ],
  '7': [
    { label: 'PECHO', cats: ['push'], subcats: ['pectorals', 'chest'], name: 'PECHO' },
    { label: 'ESPALDA', cats: ['pull'], subcats: ['lats', 'back'], name: 'ESPALDA' },
    { label: 'PIERNA - GLÚTEOS', cats: ['legs'], name: 'PIERNA - GLÚTEOS' },
    { label: 'HOMBROS', cats: ['push'], subcats: ['delts', 'shoulders'], name: 'HOMBROS' },
    { label: 'BRAZOS (BÍCEPS - TRÍCEPS)', cats: ['push', 'pull'], subcats: ['biceps', 'triceps'], name: 'BRAZOS' },
    { label: 'PIERNA - CORE', cats: ['legs', 'core'], name: 'PIERNA - CORE' },
    { label: 'CUERPO COMPLETO - CARDIO', cats: ['push', 'pull', 'legs', 'core', 'cardio'], name: 'CUERPO COMPLETO' },
  ],
};

const GOAL_ADJUSTMENTS = {
  'tonificar': { reps: '12-15', series: 3, rest: '60s', caloricAdjust: 0, protein: 1.6 },
  'fuerza': { reps: '6-8', series: 4, rest: '120s', caloricAdjust: 200, protein: 1.8 },
  'volumen': { reps: '8-12', series: 4, rest: '90s', caloricAdjust: 400, protein: 2.0 },
  'definicion': { reps: '12-15', series: 3, rest: '45s', caloricAdjust: -300, protein: 2.2 },
  'resistencia': { reps: '15-20', series: 3, rest: '30s', caloricAdjust: 0, protein: 1.4 },
};

const DIET_TEMPLATES = {
  breakfast: {
    'tonificar': 'Avena (50g) + Yogur griego (150g) + Frutas variadas (100g) + Huevos revueltos (2 uds)',
    'fuerza': 'Huevos enteros (4 uds) + Avena (80g) + Pan integral (2 rebanadas) + Mantequilla de maní (20g)',
    'volumen': 'Huevos (5 uds) + Avena (100g) + Leche entera (250ml) + Plátano (1 ud) + Miel (15g)',
    'definicion': 'Claras de huevo (5 uds) + Avena (40g) + Té verde + Manzana (1 ud)',
    'resistencia': 'Avena (60g) + Yogur natural (200g) + Frutas del bosque (100g) + Semillas de chía (10g)',
  },
  morning_snack: {
    'tonificar': 'Batido de proteína (30g) + Fruta (1 ud) + Almendras (20g)',
    'fuerza': 'Atún en lata (1 lata) + Pan integral (2 rebanadas) + Nueces (30g)',
    'volumen': 'Batido masivo: proteína (40g) + avena (50g) + mantequilla maní (30g) + leche (300ml)',
    'definicion': 'Proteína en shake (25g) + Fruta baja en azúcar (1 ud)',
    'resistencia': 'Fruta deshidratada (40g) + Mezcla de frutos secos (30g) + Yogur griego (100g)',
  },
  lunch: {
    'tonificar': 'Pechuga de pollo (180g) + Arroz integral (150g) + Brócoli (200g) + Aceite de oliva (15ml)',
    'fuerza': 'Carne roja magra (250g) + Patata (300g) + Verduras verdes (200g) + Arroz (100g)',
    'volumen': 'Pechuga pollo (250g) + Arroz (200g) + Palta (1/2 ud) + Vegetales mixtos (200g) + Aceite oliva (20ml)',
    'definicion': 'Pechuga pollo (200g) + Verduras verdes (300g) + Arroz integral (100g) + Aceite oliva (10ml)',
    'resistencia': 'Pescado blanco (200g) + Quinoa (150g) + Espárragos (150g) + Batata (100g)',
  },
  afternoon_snack: {
    'tonificar': 'Requesón (150g) + Fruta (1 ud) + Canela',
    'fuerza': 'Pollo (150g) + Tortillas de maíz (3 uds) + Guacamole (50g)',
    'volumen': 'Sándwich: pan integral (2 rebanadas) + pavo (100g) + queso (50g) + palta (1/2 ud)',
    'definicion': 'Claras de huevo (4 uds) + Espinacas (100g) + Tomate',
    'resistencia': 'Batido de proteína vegetal (30g) + Galletas integrales (30g) + Mantequilla almendra (15g)',
  },
  dinner: {
    'tonificar': 'Salmón (180g) + Ensalada mixta (200g) + Quinoa (80g) + Aceite oliva (10ml)',
    'fuerza': 'Pescado azul (250g) + Arroz (150g) + Espárragos (200g) + Aceite oliva (15ml)',
    'volumen': 'Carne magra (250g) + Pasta integral (200g) + Salsa de tomate natural + Verduras salteadas',
    'definicion': 'Pescado blanco (200g) + Ensalada grande (300g) + Vinagreta ligera',
    'resistencia': 'Tofu (200g) + Verduras salteadas (200g) + Arroz integral (80g) + Jengibre y soja',
  },
};

const NOTE_TEMPLATES = {
  'tonificar': 'Mantener la intensidad moderada-alta con descansos cortos. Priorizar la técnica sobre el peso. La combinación de entrenamiento de fuerza con déficit calórico ligero optimiza la tonificación muscular.',
  'fuerza': 'Enfocarse en progresión de carga. Usar cargas del 75-90% de 1RM. Respetar los descansos completos entre series. El calentamiento previo es crucial para rendimiento máximo.',
  'volumen': 'Priorizar la sobrecarga progresiva. Consumir superávit calórico limpio. Las proteínas son fundamentales para la reparación muscular. Dormir 7-8 horas para óptima recuperación.',
  'definicion': 'Mantener el déficit calórico moderado. No reducir proteínas. El cardio adicional acelera resultados. La hidratación es clave durante la definición.',
  'resistencia': 'Bajar el peso y aumentar repeticiones. Los descansos cortos mejoran la resistencia muscular. Incluir trabajo cardiovascular complementario.',
};

function generateRoutines(goal, trainingDays, observations, pool) {
  const daysCount = Math.min(Math.max(parseInt(trainingDays) || 5, 1), 7);
  const userDays = DAYS.slice(0, daysCount);
  const key = String(daysCount);
  const split = SPLITS[key] || SPLITS['5'];

  const adj = GOAL_ADJUSTMENTS[goal] || GOAL_ADJUSTMENTS['tonificar'];
  const seriesRange = parseInt(adj.series);
  const repsStr = adj.reps.includes('-') ? adj.reps : `${adj.reps}-${adj.reps}`;
  const repsParts = repsStr.split('-').map(Number);
  const repsMin = repsParts[0] || 8;
  const repsMax = repsParts[1] || 12;

  // Override split if tren superior observation
  let daysPlan;
  if (observations && observations.toLowerCase().includes('tren superior')) {
    daysPlan = [
      { label: 'PIERNA (cuádriceps, glúteos, femoral, pantorrilla)', cats: ['legs'] },
      { label: 'TREN SUPERIOR (pecho, espalda, hombro, bíceps, tríceps)', cats: ['push', 'pull'] },
      { label: 'PIERNA (enfoque en glúteos y femorales)', cats: ['legs'] },
      { label: 'TREN SUPERIOR (espalda, hombro, bíceps, tríceps)', cats: ['push', 'pull'] },
      { label: 'PIERNA (enfoque en cuádriceps y pantorrilla) + CORE', cats: ['legs', 'core'] },
    ];
  } else {
    daysPlan = split;
  }

  const routines = {};
  for (let i = 0; i < userDays.length; i++) {
    const day = userDays[i];
    const plan = daysPlan[i % daysPlan.length];
    const dayLabel = plan.name || plan.label;

    // Collect available exercises for this day
    const available = [];
    for (const cat of plan.cats) {
      if (pool[cat]) available.push(...pool[cat]);
    }
    // Prefer exercises matching subcats if defined
    let preferred = [];
    if (plan.subcats) {
      for (const sub of plan.subcats) {
        const matching = available.filter(e => e.muscle_group === sub);
        preferred.push(...matching);
      }
    }

    // Pick 8 exercises: first from preferred, then from remaining
    const used = new Set();
    const selected = [];
    const allCandidates = [...preferred, ...available];
    const deduped = [];
    for (const e of allCandidates) {
      const key = `${e.name_en}-${e.muscle_group}`;
      if (!used.has(key)) { used.add(key); deduped.push(e); }
    }
    const picked = pick(deduped, 8);

    const exercises = picked.map((e, idx) => {
      const reps = Math.floor(Math.random() * (repsMax - repsMin + 1)) + repsMin;
      return {
        name: e.name || e.name_en,
        series: seriesRange,
        reps,
        rest: adj.rest,
        observation: getObs(e.id),
        gif_url: e.gif_url || '',
        global_exercise_id: e.id,
      };
    });

    routines[day] = { day_label: dayLabel, exercises };
  }
  return routines;
}

function generateDiet(goal, mealsPerDay, allergies) {
  const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  const g = goal || 'tonificar';
  const diet = {};
  const mealCount = Math.min(parseInt(mealsPerDay) || 5, 5);

  for (const day of days) {
    const meals = {};
    const activeMeals = MEAL_TYPES.slice(0, mealCount);
    for (const mt of activeMeals) {
      let desc = (DIET_TEMPLATES[mt] && DIET_TEMPLATES[mt][g]) || '';
      if (allergies && allergies !== 'ninguna') {
        const allergyLower = allergies.toLowerCase();
        if (allergyLower.includes('lácteos') || allergyLower.includes('lactosa')) {
          desc = desc.replace(/yogur|leche|queso|re(?:s)?que(?:s)?ón|mantequilla/gi, match => {
            const subs = { yogur: 'Yogur sin lactosa', leche: 'Leche sin lactosa', queso: 'Queso sin lactosa', requesón: 'Tofu', mantequilla: 'Mantequilla de maní' };
            return subs[match.toLowerCase()] || match;
          });
        }
        if (allergyLower.includes('gluten') || allergyLower.includes('celíaco') || allergyLower.includes('celiaco')) {
          desc = desc.replace(/pan integral|avena|galletas integrales|pasta integral/gi, m => {
            const subs = { 'pan integral': 'Pan sin gluten', avena: 'Avena sin gluten', 'galletas integrales': 'Galletas de arroz', 'pasta integral': 'Pasta de arroz' };
            return subs[m.toLowerCase()] || m;
          });
        }
        if (allergyLower.includes('huevo') || allergyLower.includes('huevos')) {
          desc = desc.replace(/huevo\w*/gi, 'Claras de huevo pasteurizadas');
        }
      }
      meals[mt] = desc || 'Comida balanceada según plan';
    }
    diet[day] = meals;
  }
  return diet;
}

function generatePlan(data) {
  const { age, weight, height, gender, goal, experience, trainingDays, mealsPerDay, allergies, conditions, equipment, observations } = data;

  const daysCount = Math.min(Math.max(parseInt(trainingDays) || 5, 1), 7);
  const adj = GOAL_ADJUSTMENTS[goal] || GOAL_ADJUSTMENTS['tonificar'];
  const g = goal || 'tonificar';
  const bmr = gender === 'femenino' || gender === 'female'
    ? 447.6 + 9.25 * (parseFloat(weight) || 60) + 3.1 * (parseFloat(height) || 165) - 4.33 * (parseInt(age) || 25)
    : 88.36 + 13.4 * (parseFloat(weight) || 70) + 4.8 * (parseFloat(height) || 175) - 5.68 * (parseInt(age) || 25);
  const tdee = Math.round(bmr * 1.55);
  const dailyCalories = Math.max(1200, Math.round(tdee + (adj.caloricAdjust || 0)));
  const dailyProtein = Math.round((parseFloat(weight) || 70) * (adj.protein || 1.6));

  return {
    dailyCalories,
    dailyProtein,
    notes: NOTE_TEMPLATES[g] || 'Plan generado automáticamente. Ajustar según progreso.',
  };
}

module.exports = { generateLocalPlan: generatePlan, generateRoutines, generateDiet, getExercisePool };
