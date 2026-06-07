const express = require('express');
const multer = require('multer');
const { authenticate } = require('../middleware/auth');
const foods = require('../foods-db');

const OPENROUTER_API = 'https://openrouter.ai/api/v1/chat/completions';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// Buscar alimentos en la base de datos local
router.get('/foods/search', authenticate, (req, res) => {
  const q = (req.query.q || '').toLowerCase().trim();
  if (!q) return res.json(foods.slice(0, 50));
  const results = foods.filter(f =>
    f.name.toLowerCase().includes(q) ||
    f.category.toLowerCase().includes(q)
  ).slice(0, 30);
  res.json(results);
});

// Obtener categorías con conteo
router.get('/foods/categories', authenticate, (req, res) => {
  const cats = {};
  foods.forEach(f => { cats[f.category] = (cats[f.category] || 0) + 1 });
  res.json(Object.entries(cats).map(([name, count]) => ({ name, count })));
});

// Calcular calorías manualmente (recibe array de alimentos con peso)
router.post('/manual', authenticate, (req, res) => {
  try {
    const { items } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Se requiere un array de alimentos' });
    }
    const result = items.map(item => {
      const match = foods.find(f => f.name.toLowerCase() === (item.name || '').toLowerCase());
      if (!match) return null;
      const grams = parseFloat(item.grams) || 100;
      const calories = Math.round((match.caloriesPer100g / 100) * grams);
      return {
        name: match.name,
        quantity: `${grams}g`,
        calories,
        defaultPortion: match.defaultPortion,
      };
    }).filter(Boolean);
    res.json({ foods: result, totalCalories: result.reduce((s, f) => s + f.calories, 0) });
  } catch (err) {
    res.status(500).json({ error: 'Error al calcular calorías', detail: err.message });
  }
});

router.post('/analyze', authenticate, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Imagen requerida' });

    const apiKey = process.env.OPENROUTER_API_KEY || process.env.GROQ_API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(503).json({
        error: 'API no configurada',
        message: 'Configurá OPENROUTER_API_KEY (gratis en openrouter.ai) o usá el modo "Manual"',
      });
    }

    const base64 = req.file.buffer.toString('base64');
    const mime = req.file.mimetype || 'image/jpeg';

    const prompt = `Sos un nutricionista experto en reconocer alimentos en fotos.
Analizá la imagen y devolvé SOLO un JSON válido (sin markdown, sin texto adicional) con esta estructura exacta:
{
  "foods": [
    { "name": "nombre del alimento en español", "quantity": "cantidad estimada ej: 1 taza, 200g, 1 unidad", "calories": 123 },
    { "name": "...", "quantity": "...", "calories": 456 }
  ],
  "totalCalories": 579,
  "mealType": "desayuno / almuerzo / cena / snack"
}
Si no podés identificar ningún alimento, devolvé { "foods": [], "totalCalories": 0, "mealType": "desconocido" }.`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);
    const response = await fetch(OPENROUTER_API, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3001',
        'X-Title': 'FitTrainingApp',
      },
      body: JSON.stringify({
        model: 'nvidia/nemotron-nano-12b-v2-vl:free',
        messages: [{
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            { type: 'image_url', image_url: { url: `data:${mime};base64,${base64}` } },
          ],
        }],
        temperature: 0.1,
        max_tokens: 1024,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!response.ok) {
      const err = await response.text();
      if (response.status === 429) {
        return res.status(429).json({
          error: 'Cuota agotada',
          message: 'Esperá un minuto y volvé a intentar, o usá el modo "Manual".',
        });
      }
      return res.status(502).json({ error: 'Error al analizar la imagen', detail: err });
    }

    const data = await response.json();
    const text = data?.choices?.[0]?.message?.content || '{}';
    const clean = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();

    let result;
    try {
      result = JSON.parse(clean);
    } catch {
      result = { foods: [], totalCalories: 0, mealType: 'desconocido', raw: clean };
    }

    res.json(result);
  } catch (err) {
    if (err.name === 'AbortError') {
      return res.status(504).json({ error: 'Tiempo de espera agotado', message: 'El servicio no respondió a tiempo. Usá el modo "Manual".' });
    }
    res.status(500).json({ error: 'Error al analizar imagen', detail: err.message });
  }
});

module.exports = router;
