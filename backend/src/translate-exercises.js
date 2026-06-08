const { getDb, saveDb } = require('./database');

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '';

async function translateBatch(names) {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'openrouter/free',
      messages: [
        { role: 'system', content: 'Translate each exercise name to Spanish (Latin American). Return ONLY a JSON array of strings with the translations in the same order. No explanations, no markdown.' },
        { role: 'user', content: JSON.stringify(names) }
      ],
      temperature: 0.1,
    })
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`HTTP ${response.status}: ${text}`);
  }
  const data = await response.json();
  const content = data.choices[0].message.content;
  const cleaned = content.replace(/```json\s*/gi, '').replace(/```\s*/g, '').replace(/^[a-z]*\s*\[/i, '[').trim();
  return JSON.parse(cleaned);
}

async function main() {
  const db = await getDb();

  try { db.run("ALTER TABLE global_exercises ADD COLUMN name_es TEXT DEFAULT ''"); } catch (e) {}

  const result = db.exec('SELECT id, name FROM global_exercises WHERE name_es IS NULL OR name_es = "" ORDER BY id');
  if (!result[0]) { console.log('Todos ya traducidos'); return; }
  const rows = result[0].values;

  const BATCH = 30;
  let done = 0;
  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH);
    const ids = batch.map(r => r[0]);
    const names = batch.map(r => r[1]);
    let success = false;
    for (let attempt = 0; attempt < 3 && !success; attempt++) {
      try {
        const translations = await translateBatch(names);
        if (!Array.isArray(translations) || translations.length !== names.length) throw new Error('Formato inválido');
        for (let j = 0; j < ids.length; j++) {
          db.run('UPDATE global_exercises SET name_es = ? WHERE id = ?', [translations[j] || names[j], ids[j]]);
        }
        saveDb();
        done += ids.length;
        console.log(`Traducidos ${done}/${rows.length}`);
        success = true;
      } catch (err) {
        console.error(`Intento ${attempt+1} lote ${i}: ${err.message}`);
        if (attempt < 2) await new Promise(r => setTimeout(r, 3000));
      }
    }
    if (!success) {
      console.error(`Fallo lote ${i}, saltando`);
      for (let j = 0; j < ids.length; j++) {
        db.run('UPDATE global_exercises SET name_es = ? WHERE id = ?', [names[j], names[j]]);
      }
      saveDb();
      done += ids.length;
    }
    await new Promise(r => setTimeout(r, 800));
  }
  console.log('Completado');
}

main().catch(console.error);
