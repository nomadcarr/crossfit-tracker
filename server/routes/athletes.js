const express = require('express');
const router = express.Router();
const db = require('../database');

router.get('/', (req, res) => {
  const athletes = db.prepare(`
    SELECT a.*,
      COUNT(DISTINCT wr.workout_id) as workout_count,
      COUNT(DISTINCT pr.id) as pr_count
    FROM athletes a
    LEFT JOIN workout_results wr ON a.id = wr.athlete_id
    LEFT JOIN personal_records pr ON a.id = pr.athlete_id
    GROUP BY a.id
    ORDER BY a.name
  `).all();
  res.json(athletes);
});

router.get('/:id', (req, res) => {
  const athlete = db.prepare('SELECT * FROM athletes WHERE id = ?').get(req.params.id);
  if (!athlete) return res.status(404).json({ error: 'Атлетът не е намерен' });

  const workoutHistory = db.prepare(`
    SELECT wr.*, w.name as workout_name, w.type, w.score_type, w.date, w.description
    FROM workout_results wr
    JOIN workouts w ON wr.workout_id = w.id
    WHERE wr.athlete_id = ?
    ORDER BY w.date DESC
  `).all(req.params.id);

  const prHistory = db.prepare(`
    SELECT pr.*, l.name as lift_name, l.category
    FROM personal_records pr
    JOIN lifts l ON pr.lift_id = l.id
    WHERE pr.athlete_id = ?
    ORDER BY pr.date DESC, pr.weight_kg DESC
  `).all(req.params.id);

  const currentPRs = db.prepare(`
    SELECT l.id as lift_id, l.name as lift_name, l.category,
      MAX(pr.weight_kg) as max_weight,
      (SELECT date FROM personal_records
        WHERE athlete_id = ? AND lift_id = l.id
        ORDER BY weight_kg DESC, date DESC LIMIT 1) as date
    FROM personal_records pr
    JOIN lifts l ON pr.lift_id = l.id
    WHERE pr.athlete_id = ?
    GROUP BY pr.lift_id
    ORDER BY l.category, l.name
  `).all(req.params.id, req.params.id);

  res.json({ ...athlete, workoutHistory, prHistory, currentPRs });
});

router.post('/', (req, res) => {
  const { name } = req.body;
  if (!name?.trim()) return res.status(400).json({ error: 'Името е задължително' });
  try {
    const result = db.prepare('INSERT INTO athletes (name) VALUES (?)').run(name.trim());
    const athlete = db.prepare('SELECT * FROM athletes WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(athlete);
  } catch (err) {
    if (err.message.includes('UNIQUE')) return res.status(409).json({ error: 'Атлет с това име вече съществува' });
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', (req, res) => {
  const { name } = req.body;
  if (!name?.trim()) return res.status(400).json({ error: 'Името е задължително' });
  try {
    db.prepare('UPDATE athletes SET name = ? WHERE id = ?').run(name.trim(), req.params.id);
    res.json(db.prepare('SELECT * FROM athletes WHERE id = ?').get(req.params.id));
  } catch (err) {
    if (err.message.includes('UNIQUE')) return res.status(409).json({ error: 'Атлет с това име вече съществува' });
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM athletes WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

router.post('/:id/records', (req, res) => {
  const { lift_id, weight_kg, date, notes } = req.body;
  if (!lift_id || !weight_kg || !date)
    return res.status(400).json({ error: 'lift_id, weight_kg и date са задължителни' });

  const result = db.prepare(`
    INSERT INTO personal_records (athlete_id, lift_id, weight_kg, date, notes)
    VALUES (?, ?, ?, ?, ?)
  `).run(req.params.id, lift_id, weight_kg, date, notes || null);

  const record = db.prepare(`
    SELECT pr.*, l.name as lift_name, l.category
    FROM personal_records pr JOIN lifts l ON pr.lift_id = l.id
    WHERE pr.id = ?
  `).get(result.lastInsertRowid);

  res.status(201).json(record);
});

router.delete('/:athleteId/records/:recordId', (req, res) => {
  db.prepare('DELETE FROM personal_records WHERE id = ? AND athlete_id = ?')
    .run(req.params.recordId, req.params.athleteId);
  res.json({ success: true });
});

module.exports = router;
