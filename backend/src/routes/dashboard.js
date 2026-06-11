const express = require('express');
const { getDb } = require('../database');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticate, async (req, res) => {
  try {
    const db = await getDb();
    const userId = req.userId;

    const daysMap = { Monday: 'Lunes', Tuesday: 'Martes', Wednesday: 'Miércoles', Thursday: 'Jueves', Friday: 'Viernes', Saturday: 'Sábado', Sunday: 'Domingo' };
    const todayName = daysMap[new Date().toLocaleDateString('en-US', { weekday: 'long' })];
    const isWeekend = todayName === 'Sábado' || todayName === 'Domingo';

    const userResult = db.exec(`SELECT name FROM users WHERE id = ?`, [userId]);
    const userName = userResult.length > 0 ? userResult[0].values[0][0] : '';

    let routineToday = null;
    let exerciseCount = 0;
    if (!isWeekend) {
      const rResult = db.exec(`SELECT id, day_name, day_label FROM routines WHERE user_id = ? AND day_name = ? LIMIT 1`, [userId, todayName]);
      if (rResult.length > 0 && rResult[0].values.length > 0) {
        const row = rResult[0].values[0];
        routineToday = { id: row[0], day_name: row[1], day_label: row[2] };
        const eResult = db.exec(`SELECT COUNT(*) as c FROM exercises WHERE routine_id = ?`, [routineToday.id]);
        exerciseCount = eResult.length > 0 ? eResult[0].values[0][0] : 0;
      }
    }

    const wResult = db.exec(`SELECT weight, created_at FROM measurements WHERE user_id = ? AND weight > 0 ORDER BY created_at DESC LIMIT 1`, [userId]);
    const latestWeight = wResult.length > 0 && wResult[0].values.length > 0
      ? { weight: wResult[0].values[0][0], date: wResult[0].values[0][1] } : null;

    const daysResult = db.exec(`SELECT COUNT(DISTINCT DATE(created_at)) as total FROM exercise_results WHERE user_id = ?`, [userId]);
    const totalWorkoutDays = daysResult.length > 0 ? daysResult[0].values[0][0] : 0;

    const totalResult = db.exec(`SELECT COUNT(*) as total FROM exercise_results WHERE user_id = ?`, [userId]);
    const totalResults = totalResult.length > 0 ? totalResult[0].values[0][0] : 0;

    const prResult = db.exec(`SELECT COUNT(DISTINCT exercise_id) as total FROM exercise_results WHERE user_id = ?`, [userId]);
    const totalPRs = prResult.length > 0 ? prResult[0].values[0][0] : 0;

    const datesResult = db.exec(`SELECT DISTINCT DATE(created_at) as d FROM exercise_results WHERE user_id = ? ORDER BY d DESC`, [userId]);
    let streak = 0;
    if (datesResult.length > 0) {
      const dates = datesResult[0].values.map(row => row[0]);
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      const startDate = dates[0] === today || dates[0] === yesterday ? dates[0] : null;
      if (startDate) {
        let checkDate = startDate;
        for (const d of dates) {
          if (d === checkDate) { streak++; const prev = new Date(checkDate); prev.setDate(prev.getDate() - 1); checkDate = prev.toISOString().split('T')[0]; }
          else break;
        }
      }
    }

    const recentResult = db.exec(`
      SELECT e.name, er.weight, er.repetitions, er.created_at
      FROM exercise_results er JOIN exercises e ON er.exercise_id = e.id
      WHERE er.user_id = ? ORDER BY er.created_at DESC LIMIT 5
    `, [userId]);
    const recentResults = recentResult.length > 0
      ? recentResult[0].values.map(row => ({ name: row[0], weight: row[1], reps: row[2], date: row[3] })) : [];

    // Daily motivational quote
    const quotesResult = db.exec('SELECT text, author FROM motivational_quotes ORDER BY id');
    let motivation = null;
    if (quotesResult.length > 0) {
      const quotes = quotesResult[0].values;
      const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
      const idx = dayOfYear % quotes.length;
      motivation = { text: quotes[idx][0], author: quotes[idx][1] || '' };
    }

    // Calendar — last 30 days workout activity
    const calResult = db.exec(`
      SELECT DISTINCT DATE(created_at) as d FROM exercise_results
      WHERE user_id = ? AND created_at >= DATE('now', '-30 days')
      ORDER BY d
    `, [userId]);
    const workoutDays = calResult.length > 0 ? calResult[0].values.map(r => r[0]) : [];

    // Muscle recovery — last 3 routine days
    const recResult = db.exec(`
      SELECT e.name, r.day_name, ge.muscle_group
      FROM exercise_results er
      JOIN exercises e ON er.exercise_id = e.id
      JOIN routines r ON e.routine_id = r.id
      LEFT JOIN global_exercises ge ON e.global_exercise_id = ge.id
      WHERE er.user_id = ? AND er.created_at >= DATE('now', '-7 days')
      ORDER BY er.created_at DESC
    `, [userId]);
    const workedMuscles = [];
    const seenDays = new Set();
    if (recResult.length > 0) {
      for (const row of recResult[0].values) {
        if (row[2] && !seenDays.has(row[1])) {
          workedMuscles.push({ day: row[1], muscle: row[2] });
          seenDays.add(row[1]);
        }
      }
    }

    res.json({ userName, todayName, isWeekend, routineToday, exerciseCount, latestWeight, streak, totalWorkoutDays, totalPRs, totalResults, recentResults, motivation, workoutDays, workedMuscles });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener datos del dashboard' });
  }
});

module.exports = router;
