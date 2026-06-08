const { getDb, saveDb } = require('./src/database');

// Key: Grace's exercise name
// Value: { external GIF URL, OR leave empty to use Azure blob }
const EXTERNAL_GIFS = {
  'Sentadillas': 'https://static.exercisedb.dev/media/DhMl549.gif',
  'Zancadas': 'https://static.exercisedb.dev/media/13VW2VO.gif',
  'Estocadas': 'https://static.exercisedb.dev/media/13VW2VO.gif',
  'Dominadas': 'https://static.exercisedb.dev/media/0V2YQjW.gif',
  'Plancha': 'https://static.exercisedb.dev/media/CosupLu.gif',
  'Plancha frontal': 'https://static.exercisedb.dev/media/CosupLu.gif',
  'Plancha lateral': 'https://static.exercisedb.dev/media/5VXmnV5.gif',
  'Plancha con movimiento': 'https://static.exercisedb.dev/media/CosupLu.gif',
  'Elevaciones de piernas': 'https://static.exercisedb.dev/media/03lzqwk.gif',
  'Flexiones inclinadas': 'https://static.exercisedb.dev/media/f8cdab4e-f2e9-448b-a2f1-55665f86f7be.gif',
  'Remo con mancuernas': 'https://static.exercisedb.dev/media/7bb8c6b1-fe63-4593-9887-0d14b143289b.gif',
  'Remo con barra': 'https://static.exercisedb.dev/media/7bb8c6b1-fe63-4593-9887-0d14b143289b.gif',
  'Abdominales': 'https://static.exercisedb.dev/media/225x2Vd.gif',
  'Abdominales con rodilla': 'https://static.exercisedb.dev/media/225x2Vd.gif',
  'Curl de bíceps': 'https://static.exercisedb.dev/media/5055e4f5-8057-46d5-85ec-1cfc54319f09.gif',
  'Curl militar': 'https://static.exercisedb.dev/media/0dCyly0.gif',
  'Bicicleta': 'https://static.exercisedb.dev/media/tZkGYZ9.gif',
  'Crunchs': 'https://static.exercisedb.dev/media/225x2Vd.gif',
  'Mountain climbers': 'https://static.exercisedb.dev/media/RJgzwny.gif',
  'Sentadillas con salto': 'https://static.exercisedb.dev/media/1gFNTZV.gif',
};

async function fix() {
  const db = await getDb();

  console.log('=== Actualizando ejercicios de Grace con GIFs externos ===');
  const graceEx = db.exec(`SELECT e.id, e.name FROM exercises e JOIN routines r ON e.routine_id = r.id WHERE r.user_id = 13`);
  let ok = 0, miss = [];
  if (graceEx.length > 0) {
    for (const row of graceEx[0].values) {
      const exId = row[0];
      const exName = row[1];
      const gif = EXTERNAL_GIFS[exName];
      if (gif) {
        db.run(`UPDATE exercises SET gif_url = ? WHERE id = ?`, [gif, exId]);
        ok++;
        console.log(`  OK  ${exName}`);
      } else {
        miss.push(exName);
        console.log(`  MISS ${exName}`);
      }
    }
  }
  saveDb();
  console.log(`\n  -> ${ok} ejercicios actualizados`);
  if (miss.length > 0) console.log(`  -> ${miss.length} sin match: ${miss.join(', ')}`);

  console.log('\n=== HECHO ===');
  process.exit(0);
}

fix().catch(e => { console.error(e); process.exit(1); });
