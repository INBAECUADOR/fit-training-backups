const express = require('express');
const { getDb, saveDb } = require('../database');
const { authenticate } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/admin');

const router = express.Router();
router.use(authenticate, requireAdmin);

const OPENROUTER_API = 'https://openrouter.ai/api/v1/chat/completions';

const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
const MEAL_TYPES = ['breakfast', 'morning_snack', 'lunch', 'afternoon_snack', 'dinner'];
const MEAL_LABELS = { breakfast: 'Desayuno', morning_snack: 'Snack Mañana', lunch: 'Almuerzo', afternoon_snack: 'Snack Tarde', dinner: 'Cena' };

router.post('/generate', async (req, res) => {
  try {
    const { age, weight, height, gender, goal, experience, trainingDays, mealsPerDay, allergies, conditions, equipment, observations } = req.body;

    if (!age || !trainingDays || !mealsPerDay) {
      return res.status(400).json({ error: 'Edad, días de entrenamiento y comidas al día son requeridos' });
    }

    let apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      const db = await getDb();
      const r = db.exec('SELECT value FROM config WHERE key = ?', ['openrouter_api_key']);
      if (r.length && r[0].values.length) apiKey = r[0].values[0][0];
    }
    if (!apiKey) {
      return res.status(503).json({ error: 'API no configurada' });
    }

    const daysCount = Math.min(parseInt(trainingDays) || 5, 7);
    const userDays = DAYS.slice(0, daysCount);

    const prompt = `Actuás como un entrenador de fisicoculturismo natural experto. Generá una rutina de entrenamiento INTENSA de AL MENOS 60-90 MINUTOS por sesión, y una dieta personalizada.

DATOS DEL CLIENTE:
- Edad: ${age} años
- Peso: ${weight || '?'} kg
- Altura: ${height || '?'} cm
- Género: ${gender || 'no especificado'}
- Objetivo: ${goal || 'tonificar'}
- Experiencia: ${experience || 'principiante'}
- Días de entrenamiento: ${trainingDays} (${userDays.join(', ')})
- Comidas por día: ${mealsPerDay}
- Alergias/intolerancias: ${allergies || 'ninguna'}
- Condiciones/lesiones: ${conditions || 'ninguna'}
- Equipo disponible: ${equipment || 'gimnasio completo'}
${observations ? `\nOBSERVACIONES ESPECÍFICAS DEL ENTRENADOR:\n${observations}\n` : ''}

PRINCIPIOS DE ENTRENAMIENTO (OBLIGATORIO):
1. CADA SESIÓN debe durar 60-90 MINUTOS
2. 8-12 EJERCICIOS por día (incluye cardio corto al inicio y abdominales al final)
3. Incluí TIEMPO DE DESCANSO específico entre series (ej: "60s", "90s", "120s")
4. Usá superseries y ejercicios combinados para eficiencia
5. Priorizá ejercicios compuestos (sentadilla, press banca, dominadas, peso muerto, press militar)
6. Variá estímulos: cambios de agarre, tempo, ángulos
7. Las observaciones deben ser profesionales y técnicas, no motivacionales
8. Incluí 1 ejercicio de abdominales/core al final de cada día

Devolvé SOLO un JSON sin markdown ni texto adicional.

ESTRUCTURA EXACTA:
{
  "routines": {
    "Lunes": {
      "day_label": "ej: PECHO - ESPALDA",
      "exercises": [
        { "name": "Press Banca", "series": 4, "reps": 10, "rest": "90s", "observation": "nota técnica sobre ejecución" }
      ]
    }
  },
  "diet": {
    "Lunes": {
      "breakfast": "Descripción con cantidades",
      "morning_snack": "Descripción con cantidades",
      "lunch": "Descripción con cantidades",
      "afternoon_snack": "Descripción con cantidades",
      "dinner": "Descripción con cantidades"
    }
  },
  "dailyCalories": 2200,
  "dailyProtein": 150,
  "notes": "Notas generales del plan"
}

REGLAS:
- Incluí SOLO los días: ${userDays.join(', ')}
- 8-12 ejercicios por día (incluye cardio corto y abs)
- CADA ejercicio debe tener "rest" con el tiempo de descanso (ej: "60s", "90s", "120s")
- Todas las observaciones deben ser técnicas sobre ejecución y forma
- Todos los 7 días para la dieta
- Comidas con cantidades específicas en gramos
- Calorías y proteínas realistas
- Nota final profesional`;



    const FREE_MODELS = [
      'google/gemma-4-31b-it:free',
      'qwen/qwen3-next-80b-a3b-instruct:free',
      'nvidia/nemotron-3-super-120b-a12b:free',
      'meta-llama/llama-3.3-70b-instruct:free',
      'google/gemma-4-26b-a4b-it:free',
      'openai/gpt-oss-20b:free',
      'nousresearch/hermes-3-llama-3.1-405b:free',
    ];

    let lastError = '';
    for (const model of FREE_MODELS) {
      // Short delay between retries to avoid rate limits
      if (lastError) await new Promise(r => setTimeout(r, 3000));
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30000);
      try {
        const response = await fetch(OPENROUTER_API, {
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

        if (!response.ok) {
          lastError = await response.text();
          console.error(`Model ${model} failed:`, response.status, lastError.substring(0, 200));
          continue;
        }

        const data = await response.json();
        const msg = data?.choices?.[0]?.message || {};
        let text = msg.content || msg.reasoning || '{}';
        let match = text.match(/\{[\s\S]*\}/);
        if (!match) match = text.match(/\[[\s\S]*\]/);
        let clean = (match ? match[0] : text)
          .replace(/```json\s*/gi, '').replace(/```\s*/g, '')
          .replace(/[\u200B-\u200D\uFEFF]/g, '')
          .replace(/,(\s*[}\]])/g, '$1').trim();

        let result;
        try { result = JSON.parse(clean); } catch { continue; }

        if (result.routines && result.diet) {
          return res.json(result);
        }
      } catch (err) {
        clearTimeout(timeout);
        lastError = err.message;
        console.error(`Model ${model} error:`, err.message);
        continue;
      }
    }

    return res.status(502).json({ error: 'Error al generar el plan', detail: lastError });
  } catch (err) {
    if (err.name === 'AbortError') {
      return res.status(504).json({ error: 'Tiempo de espera agotado' });
    }
    res.status(500).json({ error: 'Error al generar plan', detail: err.message });
  }
});

router.post('/approve', async (req, res) => {
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
