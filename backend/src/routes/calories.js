const express = require('express');
const multer = require('multer');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

router.post('/analyze', authenticate, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Imagen requerida' });

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res.status(503).json({
        error: 'API de OpenAI no configurada',
        message: 'Configurá OPENAI_API_KEY en el entorno para usar esta función',
      });
    }

    const base64 = req.file.buffer.toString('base64');
    const mime = req.file.mimetype || 'image/jpeg';

    const body = {
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `Sos un nutricionista experto en reconocer alimentos en fotos.
Analizá la imagen y devolvé SOLO un JSON válido (sin markdown, sin texto adicional) con esta estructura exacta:
{
  "foods": [
    { "name": "nombre del alimento en español", "quantity": "cantidad estimada ej: 1 taza, 200g, 1 unidad", "calories": 123 },
    { "name": "...", "quantity": "...", "calories": 456 }
  ],
  "totalCalories": 579,
  "mealType": "desayuno / almuerzo / cena / snack"
}
Si no podés identificar ningún alimento, devolvé { "foods": [], "totalCalories": 0, "mealType": "desconocido" }.`
        },
        {
          role: 'user',
          content: [
            { type: 'text', text: '¿Qué alimentos hay en esta imagen? Estimá las calorías.' },
            { type: 'image_url', image_url: { url: `data:${mime};base64,${base64}`, detail: 'low' } }
          ]
        }
      ],
      max_tokens: 500,
      temperature: 0.3,
    };

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const err = await response.text();
      return res.status(502).json({ error: 'Error al consultar OpenAI', detail: err });
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || '{}';
    const clean = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();

    let result;
    try {
      result = JSON.parse(clean);
    } catch {
      result = { foods: [], totalCalories: 0, mealType: 'desconocido', raw: clean };
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Error al analizar imagen', detail: err.message });
  }
});

module.exports = router;
