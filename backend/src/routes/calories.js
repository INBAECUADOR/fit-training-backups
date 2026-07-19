const express = require('express');
const { authenticate } = require('../middleware/auth');
const { getDb } = require('../database');
const { createImageUpload } = require('../middleware/upload');
const foods = require('../foods-db');

const router = express.Router();
const upload = createImageUpload(10);

const PROMPT = `Eres un nutricionista experto en reconocer alimentos en fotos.
Analiza la imagen y devuelve SOLO un JSON válido (sin markdown, sin texto adicional) con esta estructura exacta:
{
  "foods": [
    { "name": "nombre del alimento en español", "quantity": "cantidad estimada ej: 1 taza, 200g, 1 unidad", "calories": 123 },
    { "name": "...", "quantity": "...", "calories": 456 }
  ],
  "totalCalories": 579,
  "mealType": "desayuno / almuerzo / cena / snack"
}
Si no puedes identificar ningun alimento, devuelve { "foods": [], "totalCalories": 0, "mealType": "desconocido" }.`;

function parseJsonResponse(text) {
  const clean = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
  try { return JSON.parse(clean); } catch { return null; }
}

function localFallback() {
  const hour = new Date().getHours();
  let mealType, suggestions;
  if (hour < 10) {
    mealType = 'desayuno';
    suggestions = [
      { name: 'Huevo revuelto', quantity: '2 unidades (100g)', calories: 149 },
      { name: 'Pan integral', quantity: '2 rebanadas (60g)', calories: 148 },
      { name: 'Leche entera', quantity: '1 vaso (240ml)', calories: 146 },
    ];
  } else if (hour < 11) {
    mealType = 'media_manana';
    suggestions = [
      { name: 'Banana', quantity: '1 unidad mediana (120g)', calories: 107 },
      { name: 'Yogur natural', quantity: '1 pote (200g)', calories: 122 },
    ];
  } else if (hour < 16) {
    mealType = 'almuerzo';
    suggestions = [
      { name: 'Arroz blanco cocido', quantity: '1 taza (200g)', calories: 260 },
      { name: 'Pollo a la plancha (pechuga)', quantity: '1 pieza (150g)', calories: 248 },
      { name: 'Ensalada mixta', quantity: '1 taza (150g)', calories: 45 },
    ];
  } else if (hour < 19) {
    mealType = 'merienda';
    suggestions = [
      { name: 'Manzana', quantity: '1 unidad mediana (180g)', calories: 94 },
      { name: 'Almendras', quantity: '1 puñado (30g)', calories: 174 },
    ];
  } else {
    mealType = 'cena';
    suggestions = [
      { name: 'Pescado blanco cocido', quantity: '1 filete (150g)', calories: 144 },
      { name: 'Brócoli cocido', quantity: '1 taza (150g)', calories: 53 },
      { name: 'Papa cocida', quantity: '1 unidad mediana (170g)', calories: 148 },
    ];
  }
  const totalCalories = suggestions.reduce((s, f) => s + f.calories, 0);
  return { foods: suggestions, totalCalories, mealType, source: 'local' };
}

async function tryOpenRouter(base64, mime) {
  let apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    const db = await getDb();
    const r = db.exec('SELECT value FROM config WHERE key = ?', ['openrouter_api_key']);
    if (r.length && r[0].values.length) apiKey = r[0].values[0][0];
  }
  if (!apiKey) return null;

  let visionModel = 'nvidia/nemotron-nano-12b-v2-vl:free';
  try {
    const res = await fetch('https://openrouter.ai/api/v1/models', { signal: AbortSignal.timeout(5000) });
    if (res.ok) {
      const data = await res.json();
      const models = data.data || data.models || [];
      const freeVision = models.filter(m => {
        const p = m.pricing || {};
        return parseFloat(p.prompt) === 0 && parseFloat(p.completion) === 0 && (m.id.includes('vision') || m.id.includes('vl'));
      });
      if (freeVision.length) visionModel = freeVision[0].id;
    }
  } catch {}

  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: visionModel,
      messages: [{ role: 'user', content: [{ type: 'text', text: PROMPT }, { type: 'image_url', image_url: { url: `data:${mime};base64,${base64}` } }] }],
      temperature: 0.1, max_tokens: 1024,
    }),
    signal: AbortSignal.timeout(30000),
  });
  if (!res.ok) return null;
  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content || '{}';
  const result = parseJsonResponse(text);
  if (result && Array.isArray(result.foods)) return { ...result, source: 'openrouter' };
  return null;
}

async function tryGemini(base64, mime) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [{ text: PROMPT }, { inlineData: { mimeType: mime, data: base64 } }]
      }],
      generationConfig: { temperature: 0.1, maxOutputTokens: 1024 },
    }),
    signal: AbortSignal.timeout(30000),
  });
  if (!res.ok) return null;
  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
  const result = parseJsonResponse(text);
  if (result && Array.isArray(result.foods)) return { ...result, source: 'gemini' };
  return null;
}

async function tryGroq(base64, mime) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return null;

  const models = ['llama-3.2-11b-vision-preview', 'llava-v1.5-7b-4096-preview'];
  for (const model of models) {
    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          messages: [{ role: 'user', content: [{ type: 'text', text: PROMPT }, { type: 'image_url', image_url: { url: `data:${mime};base64,${base64}` } }] }],
          temperature: 0.1, max_tokens: 1024,
        }),
        signal: AbortSignal.timeout(30000),
      });
      if (!res.ok) continue;
      const data = await res.json();
      const text = data?.choices?.[0]?.message?.content || '{}';
      const result = parseJsonResponse(text);
      if (result && Array.isArray(result.foods)) return { ...result, source: 'groq' };
    } catch {}
  }
  return null;
}

async function tryHuggingFace(base64, mime) {
  const model = 'Salesforce/blip-image-captioning-base';
  const apiKey = process.env.HUGGINGFACE_API_KEY;
  const headers = { 'Content-Type': 'application/octet-stream' };
  if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`;

  try {
    const buffer = Buffer.from(base64, 'base64');
    const res = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
      method: 'POST', headers, body: buffer,
      signal: AbortSignal.timeout(30000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const caption = Array.isArray(data) ? data[0]?.generated_text || '' : data.generated_text || '';
    if (!caption) return null;

    // Map caption to foods from database
    const words = caption.toLowerCase().split(/\s+/);
    const matched = foods.filter(f => words.some(w => f.name.toLowerCase().includes(w))).slice(0, 3);
    if (matched.length === 0) return null;

    const result = matched.map(f => ({
      name: f.name, quantity: f.defaultPortion,
      calories: Math.round((f.caloriesPer100g / 100) * 100),
    }));
    return { foods: result, totalCalories: result.reduce((s, f) => s + f.calories, 0), mealType: 'desconocido', source: 'huggingface' };
  } catch { return null; }
}

async function tryCloudflareAI(base64, mime) {
  const apiKey = process.env.CLOUDFLARE_API_KEY;
  const account = process.env.CLOUDFLARE_ACCOUNT_ID;
  if (!apiKey || !account) return null;

  try {
    const buffer = Buffer.from(base64, 'base64');
    const res = await fetch(`https://api.cloudflare.com/client/v4/accounts/${account}/ai/run/@cf/meta/llama-3.2-11b-vision-instruct`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: PROMPT }],
        image: buffer.toString('base64'),
        max_tokens: 1024,
      }),
      signal: AbortSignal.timeout(30000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const text = data?.result?.response || '{}';
    const result = parseJsonResponse(text);
    if (result && Array.isArray(result.foods)) return { ...result, source: 'cloudflare' };
  } catch {}
  return null;
}

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

router.get('/foods/categories', authenticate, (req, res) => {
  const cats = {};
  foods.forEach(f => { cats[f.category] = (cats[f.category] || 0) + 1 });
  res.json(Object.entries(cats).map(([name, count]) => ({ name, count })));
});

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
      return { name: match.name, quantity: `${grams}g`, calories, defaultPortion: match.defaultPortion };
    }).filter(Boolean);
    res.json({ foods: result, totalCalories: result.reduce((s, f) => s + f.calories, 0) });
  } catch (err) {
    res.status(500).json({ error: 'Error al calcular calorias', detail: err.message });
  }
});

router.post('/analyze', authenticate, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Imagen requerida' });

    const base64 = req.file.buffer.toString('base64');
    const mime = req.file.mimetype || 'image/jpeg';

    // Provider chain with automatic fallback
    const providers = [tryOpenRouter, tryGemini, tryGroq, tryHuggingFace, tryCloudflareAI];
    for (const provider of providers) {
      try {
        const result = await provider(base64, mime);
        if (result) return res.json(result);
      } catch {}
    }

    // Ultimate fallback: local estimation based on meal time
    const fallback = localFallback();
    res.json(fallback);
  } catch (err) {
    res.status(500).json({ error: 'Error al analizar imagen', detail: err.message });
  }
});

module.exports = router;
