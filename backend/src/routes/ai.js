const express = require('express');
const { getDb, saveDb } = require('../database');
const { authenticate } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/admin');

const router = express.Router();

const OPENROUTER_API = 'https://openrouter.ai/api/v1/chat/completions';

let cachedModels = [];
let lastFetch = 0;
const CACHE_TTL = 3600000;

async function getFreeModels() {
  const now = Date.now();
  if (cachedModels.length && now - lastFetch < CACHE_TTL) return cachedModels;
  try {
    const res = await globalThis.fetch('https://openrouter.ai/api/v1/models');
    if (!res.ok) return [];
    const data = await res.json();
    const models = (data.data || data.models || [])
      .filter(m => { const p = m.pricing || {}; return parseFloat(p.prompt) === 0 && parseFloat(p.completion) === 0; })
      .map(m => m.id);
    if (models.length) { cachedModels = models; lastFetch = now; }
    return models;
  } catch { return []; }
}

const { generateLocalPlan, generateRoutines, generateDiet, getExercisePool } = require('./ai-local');
const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];

router.post('/generate', authenticate, requireAdmin, async (req, res) => {
  try {
    const body = req.body;
    const { age, trainingDays, mealsPerDay } = body;
    if (!age || !trainingDays || !mealsPerDay) {
      return res.status(400).json({ error: 'Edad, días de entrenamiento y comidas al día son requeridos' });
    }

    // Try OpenRouter if API key is configured
    let apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      const db = await getDb();
      const r = db.exec('SELECT value FROM config WHERE key = ?', ['openrouter_api_key']);
      if (r.length && r[0].values.length) apiKey = r[0].values[0][0];
    }

    if (apiKey) {
      const daysCount = Math.min(parseInt(trainingDays) || 5, 7);
      const userDays = DAYS.slice(0, daysCount);

      const splitInstruction = body.observations && body.observations.toLowerCase().includes('tren superior') ? `
DISTRIBUCIÓN POR DÍA (basada en tu observación de 2 días tren superior + 3 piernas):
- Lunes: PIERNA (cuádriceps, glúteos, femoral, pantorrilla)
- Martes: TREN SUPERIOR (pecho, espalda, hombro, bíceps, tríceps)
- Miércoles: PIERNA (enfoque en glúteos y femorales)
- Jueves: TREN SUPERIOR (espalda, hombro, bíceps, tríceps)
- Viernes: PIERNA (enfoque en cuádriceps y pantorrilla) + CORE` : `
DISTRIBUCIÓN POR DÍA:
${userDays.map((d, i) => {
  const splits = ['PIERNA (cuádriceps, glúteos)', 'TREN SUPERIOR (pecho, espalda)', 'PIERNA (glúteos, femorales)', 'TREN SUPERIOR (hombro, bíceps, tríceps)', 'PIERNA + CORE', 'CUERPO COMPLETO', 'DESCANSO ACTIVO'];
  return `- ${d}: ${splits[i] || 'CUERPO COMPLETO'}`;
}).join('\n')}`;

      const prompt = `Eres un entrenador personal experto en fitness y nutrición. Genera una rutina EXACTAMENTE como se especifica abajo.

DATOS DEL CLIENTE:
- Edad: ${body.age} años
- Peso: ${body.weight || '?'} kg
- Altura: ${body.height || '?'} cm
- Género: ${body.gender || 'no especificado'}
- Objetivo: ${body.goal || 'tonificar'}
- Experiencia: ${body.experience || 'principiante'}
- Días de entrenamiento: ${trainingDays} (${userDays.join(', ')})
- Comidas por día: ${mealsPerDay}
- Alergias/intolerancias: ${body.allergies || 'ninguna'}
- Condiciones/lesiones: ${body.conditions || 'ninguna'}
- Equipo disponible: ${body.equipment || 'gimnasio completo'}
${body.observations ? `\nOBSERVACIONES DEL ENTRENADOR:\n${body.observations}\n` : ''}

${splitInstruction}

REGLAS ESTRICTAS:
1. EXACTAMENTE 8 ejercicios por día (ni más, ni menos)
2. Cada ejercicio debe tener: "name", "series" (3-4), "reps" (8-15), "rest" ("60s","90s","120s"), "observation" (técnica)
3. Usa nombres REALES de ejercicios de gimnasio en español: "Press Banca", "Sentadilla con Barra", "Peso Muerto", "Dominadas", "Curl con Barra", "Press Militar", "Aperturas con Mancuernas", "Remo con Barra", "Fondos en Paralelas", "Elevaciones Laterales", "Curl Femoral", "Prensa de Piernas", "Extensiones de Cuádriceps", etc.
4. NO inventes nombres de ejercicios
5. La dieta debe tener 5 comidas TODOS los días, NUNCA pongas "Omitido" o "Skip" en ninguna comida
6. Incluye siempre una comida de desayuno completa con proteína y carbohidratos
7. day_label debe ser el grupo muscular en MAYÚSCULAS (ej: "PIERNA - GLÚTEOS", "PECHO - ESPALDA", "ESPALDA - BÍCEPS")
8. Incluye 1 ejercicio de abdominales al final de cada día
9. Las observaciones deben ser técnicas (ej: "Mantener pecho arriba y escápulas retraídas", "No bloquear codos al final del movimiento")

RESPONDE SOLO CON UN JSON VÁLIDO, SIN MARKDOWN, SIN TEXTO ADICIONAL.

{
  "routines": {
    "Lunes": {
      "day_label": "PIERNA - CUÁDRICEPS",
      "exercises": [
        { "name": "Sentadilla con Barra", "series": 4, "reps": 10, "rest": "90s", "observation": "Mantener pecho arriba, rodillas en línea con los pies, bajar hasta paralela" }
      ]
    }
  },
  "diet": {
    "Lunes": {
      "breakfast": "Descripción con cantidades en gramos",
      "morning_snack": "Descripción con cantidades en gramos",
      "lunch": "Descripción con cantidades en gramos",
      "afternoon_snack": "Descripción con cantidades en gramos",
      "dinner": "Descripción con cantidades en gramos"
    }
  },
  "dailyCalories": 1800,
  "dailyProtein": 120,
  "notes": "Nota profesional breve"
}

Días a incluir en routines: ${userDays.join(', ')}
Días a incluir en diet: Lunes, Martes, Miércoles, Jueves, Viernes, Sábado, Domingo`;

      const FREE_MODELS = (await getFreeModels()).slice(0, 10);
      if (FREE_MODELS.length) {
        let lastError = '';
        for (const model of FREE_MODELS) {
          if (lastError) await new Promise(r => setTimeout(r, 3000));
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 30000);
          try {
            const response = await globalThis.fetch(OPENROUTER_API, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'http://localhost:3001',
                'X-Title': 'FitTrainingApp',
              },
              body: JSON.stringify({ model, messages: [{ role: 'user', content: prompt }], temperature: 0.5, max_tokens: 8192 }),
              signal: controller.signal,
            });
            clearTimeout(timeout);
            if (!response.ok) { lastError = `${response.status}: ${(await response.text()).substring(0, 200)}`; console.error(`Model ${model} failed:`, lastError); continue; }
            const data = await response.json();
            const msg = data?.choices?.[0]?.message || {};
            let text = msg.content || msg.reasoning || '{}';
            let match = text.match(/\{[\s\S]*\}/);
            if (!match) match = text.match(/\[[\s\S]*\]/);
            let clean = (match ? match[0] : text).replace(/```json\s*/gi, '').replace(/```\s*/g, '').replace(/[\u200B-\u200D\uFEFF]/g, '').replace(/,(\s*[}\]])/g, '$1').trim();
            let result;
            try { result = JSON.parse(clean); } catch { continue; }
            if (result.routines && result.diet) return res.json(result);
          } catch (err) { clearTimeout(timeout); lastError = err.message; console.error(`Model ${model} error:`, err.message); continue; }
        }
        console.error('OpenRouter all models failed. Falling back to local generator. Last error:', lastError);
      }
    }

    // Fallback: local generator (works without API key)
    const pool = await getExercisePool();
    const baseInfo = generateLocalPlan(body);
    const routines = generateRoutines(body.goal || 'tonificar', trainingDays, body.observations, pool);
    const diet = generateDiet(body.goal || 'tonificar', mealsPerDay, body.allergies);
    return res.json({ ...baseInfo, routines, diet, generated: 'local' });
  } catch (err) {
    res.status(500).json({ error: 'Error al generar plan', detail: err.message });
  }
});

router.post('/approve', authenticate, requireAdmin, async (req, res) => {
  try {
    const { userId, routines, diet, keepExisting } = req.body;
    if (!userId || !routines) {
      return res.status(400).json({ error: 'userId y routines son requeridos' });
    }

    const db = await getDb();

    if (!keepExisting) {
      const existing = db.exec(`SELECT id FROM routines WHERE user_id = ?`, [userId]);
      if (existing.length > 0) {
        for (const row of existing[0].values) {
          db.run(`DELETE FROM exercise_results WHERE exercise_id IN (SELECT id FROM exercises WHERE routine_id = ?)`, [row[0]]);
          db.run(`DELETE FROM exercises WHERE routine_id = ?`, [row[0]]);
        }
        db.run(`DELETE FROM routines WHERE user_id = ?`, [userId]);
      }
      db.run(`DELETE FROM diets WHERE user_id = ?`, [userId]);
    }

    for (const [dayName, dayData] of Object.entries(routines)) {
      db.run(`INSERT INTO routines (user_id, day_name, day_label) VALUES (?, ?, ?)`,
        [userId, dayName, dayData.day_label || `Día ${dayName}`]);
    }
    saveDb();

    const newRoutines = db.exec(`SELECT id, day_name FROM routines WHERE user_id = ? ORDER BY id`, [userId]);
    const routineMap = {};
    if (newRoutines.length > 0) {
      const routineIds = newRoutines[0].values.slice(-Object.keys(routines).length);
      Object.keys(routines).forEach((day, i) => {
        if (routineIds[i]) routineMap[day] = routineIds[i][0];
      });
    }

    for (const [dayName, dayData] of Object.entries(routines)) {
      const routineId = routineMap[dayName];
      if (!routineId) continue;
      for (const ex of (dayData.exercises || [])) {
        // Precise match against global_exercises
        let gifUrl = '';
        let globalId = null;
        // Strip parenthesized suffixes like "(Calentamiento)" before matching
        const name = ex.name.toLowerCase().replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim();
        const cleanName = name.replace(/\(.*?\)/g, '').replace(/\s+/g, ' ').trim();
        const words = cleanName.split(/\s+/).filter(w => w.length > 2 && !['las','los','con','sin','para','una','uno','del','por','que','por'].includes(w));
        let bestMatch = null;
        let bestScore = 0;

        const allExercises = db.exec(`SELECT id, gif_url, name, name_es FROM global_exercises`);
        if (allExercises.length > 0) {
          const catalog = allExercises[0].values;

          // 1. Exact match (highest priority)
          for (const row of catalog) {
            const gn = (row[2] || '').toLowerCase().trim();
            const gne = (row[3] || '').toLowerCase().trim();
            if (gn === cleanName || gne === cleanName) {
              bestMatch = row; bestScore = 100; break;
            }
          }

          // 2. Contains match (name contains catalog name or vice versa)
          if (!bestMatch) {
            for (const row of catalog) {
              const gn = (row[2] || '').toLowerCase();
              const gne = (row[3] || '').toLowerCase();
              const combined = gn + ' ' + gne;
              if (combined.includes(cleanName) || cleanName.includes(gn) || cleanName.includes(gne)) {
                if (60 > bestScore) { bestScore = 60; bestMatch = row; }
              }
            }
          }

          // 3. Word matching with percentage threshold
          if (!bestMatch && words.length > 0) {
            for (const row of catalog) {
              const gn = (row[2] || '').toLowerCase();
              const gne = (row[3] || '').toLowerCase();
              const combined = gn + ' ' + gne;
              const matched = words.filter(w => combined.includes(w)).length;
              const ratio = matched / words.length;
              if (ratio > bestScore) { bestScore = ratio; bestMatch = row; }
            }
            // Accept word matches above 40% (AI generates Spanish names, catalog has English + some Spanish)
            if (bestScore <= 0.4) bestMatch = null;
          }
        }

        if (bestMatch) {
          globalId = bestMatch[0];
          gifUrl = bestMatch[1] || '';
        }
        db.run(`INSERT INTO exercises (routine_id, name, series, reps, rest, observation, gif_url, global_exercise_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [routineId, ex.name, ex.series || 0, ex.reps || 0, ex.rest || '', ex.observation || '', gifUrl, globalId]);
      }
    }

    if (diet) {
      for (const [day, meals] of Object.entries(diet)) {
        for (const [mealType, description] of Object.entries(meals)) {
          if (description && description.trim()) {
            db.run(`INSERT INTO diets (user_id, day_name, meal_type, description) VALUES (?, ?, ?, ?)`,
              [userId, day, mealType, description]);
          }
        }
      }
    }

    saveDb();
    res.json({ message: 'Plan asignado correctamente' });
  } catch (err) {
    res.status(500).json({ error: 'Error al asignar plan', detail: err.message });
  }
});

module.exports = router;
