const API = process.env.API_URL || 'https://app.enriquezmania.com/api';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || '1717798274';
const ADMIN_PASS = process.env.ADMIN_PASS || 'I5M]El';

async function api(path, opts = {}) {
  const url = API + path;
  const headers = { 'Content-Type': 'application/json', ...opts.headers };
  const { headers: _h, ...rest } = opts;
  const res = await fetch(url, { ...rest, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(`${res.status} ${path}: ${JSON.stringify(data)}`);
  return data;
}

async function login() {
  const data = await api('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASS }),
  });
  return data.token;
}

const USERS = [
  { document_id: '10000011', name: 'Paul Diaz', password: '123456', email: 'paul@example.com' },
  { document_id: '10000012', name: 'Diego Perez', password: '123456', email: 'diego@example.com' },
  { document_id: '10000013', name: 'Jorge Rodriguez', password: '123456', email: 'jorge@example.com' },
];

const EXERCISES = [
  { name: 'Press banca', series: 4, reps: 10 },
  { name: 'Remo con barra', series: 4, reps: 10 },
  { name: 'Press militar', series: 4, reps: 10 },
  { name: 'Sentadilla', series: 4, reps: 12 },
  { name: 'Peso muerto', series: 4, reps: 10 },
  { name: 'Curl bíceps', series: 3, reps: 12 },
  { name: 'Fondos en paralelas', series: 3, reps: 12 },
  { name: 'Jalón al pecho', series: 4, reps: 10 },
  { name: 'Elevación lateral', series: 3, reps: 15 },
  { name: 'Prensa de piernas', series: 4, reps: 12 },
  { name: 'Curl femoral', series: 3, reps: 12 },
  { name: 'Extensiones de pierna', series: 3, reps: 12 },
  { name: 'Cruce de poleas', series: 3, reps: 12 },
  { name: 'Pájaro', series: 3, reps: 12 },
  { name: 'Encogimientos', series: 4, reps: 8 },
  { name: 'Elevación de talones', series: 4, reps: 15 },
  { name: 'Remo en máquina', series: 4, reps: 10 },
  { name: 'Press inclinado', series: 4, reps: 10 },
  { name: 'Polea al rostro', series: 3, reps: 15 },
  { name: 'Peso muerto rumano', series: 4, reps: 10 },
  { name: 'Press con mancuernas', series: 4, reps: 10 },
];

const JORGE_EXERCISES = [
  { name: 'Press banca', series: 4, reps: 10 },
  { name: 'Remo con barra', series: 4, reps: 10 },
  { name: 'Press militar', series: 4, reps: 10 },
  { name: 'Sentadilla', series: 4, reps: 12 },
  { name: 'Peso muerto', series: 4, reps: 10 },
  { name: 'Curl bíceps', series: 3, reps: 12 },
  { name: 'Fondos en paralelas', series: 3, reps: 12 },
  { name: 'Jalón al pecho', series: 4, reps: 10 },
  { name: 'Elevación lateral', series: 3, reps: 15 },
  { name: 'Prensa de piernas', series: 4, reps: 12 },
  { name: 'Curl femoral', series: 3, reps: 12 },
  { name: 'Extensiones de pierna', series: 3, reps: 12 },
  { name: 'Cruce de poleas', series: 3, reps: 12 },
  { name: 'Pájaro', series: 3, reps: 12 },
  { name: 'Encogimientos', series: 4, reps: 8 },
  { name: 'Elevación de talones', series: 4, reps: 15 },
  { name: 'Remo en máquina', series: 4, reps: 10 },
  { name: 'Press inclinado', series: 4, reps: 10 },
  { name: 'Polea al rostro', series: 3, reps: 15 },
  { name: 'Peso muerto rumano', series: 4, reps: 10 },
  { name: 'Press con mancuernas', series: 4, reps: 10 },
];

const MEAL_TYPES = ['Desayuno', 'Almuerzo', 'Merienda', 'Cena', 'Post-entreno'];
const JORGE_MEAL_TYPES = ['Desayuno', 'Almuerzo', 'Merienda', 'Cena'];

const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

function makeMeals(mealTypes) {
  const meals = {};
  for (const day of DAYS) {
    meals[day] = {};
    for (const type of mealTypes) {
      meals[day][type] = `Comida ${type.toLowerCase()} de ${day}`;
    }
  }
  return meals;
}

async function restoreUser(user, token, isJorge) {
  const authHeaders = { Authorization: `Bearer ${token}` };

  // Create user
  const created = await api('/admin/users', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify(user),
  });
  const uid = created.id;
  console.log(`Created ${user.name} (id=${uid})`);

  // Get routines
  const routines = await api(`/admin/routines?user_id=${uid}`, { headers: authHeaders });
  console.log(`  ${routines.length} routines`);

  // Add exercises (3 per routine)
  const exercisePool = isJorge ? JORGE_EXERCISES : EXERCISES;
  for (let i = 0; i < routines.length; i++) {
    const r = routines[i];
    for (let j = 0; j < 3; j++) {
      const ex = exercisePool[(i * 3 + j) % exercisePool.length];
      await api('/admin/exercises', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ routine_id: r.id, ...ex }),
      });
    }
  }
  console.log(`  21 exercises added`);

  // Add meals
  const mealTypes = isJorge ? JORGE_MEAL_TYPES : MEAL_TYPES;
  const meals = makeMeals(mealTypes);
  await api(`/diet/?user_id=${uid}`, {
    method: 'PUT',
    headers: authHeaders,
    body: JSON.stringify(meals),
  });
  const mealCount = 7 * mealTypes.length;
  console.log(`  ${mealCount} meals added`);

  return uid;
}

async function main() {
  try {
    console.log('Logging in as admin...');
    const token = await login();
    console.log('Token obtained.');

    for (let i = 0; i < USERS.length; i++) {
      try {
        const uid = await restoreUser(USERS[i], token, i === 2);
        console.log(`SUCCESS: ${USERS[i].name} (id=${uid})`);
      } catch (err) {
        console.error(`FAILED: ${USERS[i].name}: ${err.message}`);
      }
    }

    // Verify
    const users = await api('/admin/users', { headers: { Authorization: `Bearer ${token}` } });
    console.log(`\nTotal users now: ${users.length}`);
    const restored = users.filter(u => ['10000011', '10000012', '10000013'].includes(u.document_id));
    for (const u of restored) {
      console.log(`  ${u.name} (${u.document_id}) - OK`);
    }
    console.log(`\nAll 3 users restored successfully!`);
  } catch (err) {
    console.error('FATAL:', err.message);
    process.exitCode = 1;
  }
}

main();
