const express = require('express');
const router = express.Router();
const db = require('../database');
const { requireAuth } = require('../middleware/auth');

router.get('/', (req, res) => {
  const workouts = db.prepare(`
    SELECT w.*, COUNT(DISTINCT wr.athlete_id) as result_count
    FROM workouts w
    LEFT JOIN workout_results wr ON w.id = wr.workout_id
    GROUP BY w.id
    ORDER BY w.date DESC, w.created_at DESC
  `).all();
  res.json(workouts);
});

router.get('/:id', (req, res) => {
  const workout = db.prepare('SELECT * FROM workouts WHERE id = ?').get(req.params.id);
  if (!workout) return res.status(404).json({ error: 'Тренировката не е намерена' });

  const order = workout.score_type === 'time' ? 'ASC' : 'DESC';
  const results = db.prepare(`
    SELECT wr.*, a.name as athlete_name
    FROM workout_results wr
    JOIN athletes a ON wr.athlete_id = a.id
    WHERE wr.workout_id = ?
    ORDER BY wr.rx DESC, wr.score_value ${order}
  `).all(req.params.id);

  let rank = 1;
  const ranked = results.map((r, i) => {
    if (i > 0 && r.score_value !== results[i - 1].score_value) rank = i + 1;
    return { ...r, rank };
  });

  res.json({ ...workout, results: ranked });
});

router.post('/', (req, res) => {
  const { name, description, type, score_type, date } = req.body;
  if (!name?.trim() || !date) return res.status(400).json({ error: 'Името и датата са задължителни' });

  const result = db.prepare(`
    INSERT INTO workouts (name, description, type, score_type, date)
    VALUES (?, ?, ?, ?, ?)
  `).run(name.trim(), description || null, type || 'For Time', score_type || 'time', date);

  res.status(201).json(db.prepare('SELECT * FROM workouts WHERE id = ?').get(result.lastInsertRowid));
});

router.put('/:id', (req, res) => {
  const { name, description, type, score_type, date } = req.body;
  db.prepare(`
    UPDATE workouts SET name=?, description=?, type=?, score_type=?, date=? WHERE id=?
  `).run(name, description || null, type, score_type, date, req.params.id);
  res.json(db.prepare('SELECT * FROM workouts WHERE id = ?').get(req.params.id));
});

router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM workouts WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

router.post('/:id/results', requireAuth, (req, res) => {
  const { athlete_id, score, score_value, rx, notes } = req.body;
  if (!athlete_id || !score) return res.status(400).json({ error: 'athlete_id и score са задължителни' });
  if (String(athlete_id) !== String(req.user.athlete_id))
    return res.status(403).json({ error: 'Можеш да добавяш резултати само за себе си' });

  try {
    db.prepare(`
      INSERT INTO workout_results (athlete_id, workout_id, score, score_value, rx, notes)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(athlete_id, workout_id) DO UPDATE SET
        score=excluded.score, score_value=excluded.score_value,
        rx=excluded.rx, notes=excluded.notes
    `).run(athlete_id, req.params.id, score, score_value ?? null, rx ? 1 : 0, notes || null);

    const inserted = db.prepare(`
      SELECT wr.*, a.name as athlete_name
      FROM workout_results wr JOIN athletes a ON wr.athlete_id = a.id
      WHERE wr.workout_id = ? AND wr.athlete_id = ?
    `).get(req.params.id, athlete_id);

    res.status(201).json(inserted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:workoutId/results/:resultId', requireAuth, (req, res) => {
  const result = db.prepare('SELECT * FROM workout_results WHERE id = ? AND workout_id = ?')
    .get(req.params.resultId, req.params.workoutId);
  if (!result) return res.status(404).json({ error: 'Резултатът не е намерен' });
  if (String(result.athlete_id) !== String(req.user.athlete_id))
    return res.status(403).json({ error: 'Можеш да триеш само свои резултати' });

  db.prepare('DELETE FROM workout_results WHERE id = ?').run(req.params.resultId);
  res.json({ success: true });
});

module.exports = router;
