const express = require('express');
const router = express.Router();
const db = require('../database');

router.get('/', (req, res) => {
  res.json(db.prepare('SELECT * FROM lifts ORDER BY category, name').all());
});

router.post('/', (req, res) => {
  const { name, category } = req.body;
  if (!name?.trim()) return res.status(400).json({ error: 'Името е задължително' });
  try {
    const result = db.prepare('INSERT INTO lifts (name, category) VALUES (?, ?)').run(name.trim(), category || 'Other');
    res.status(201).json(db.prepare('SELECT * FROM lifts WHERE id = ?').get(result.lastInsertRowid));
  } catch (err) {
    if (err.message.includes('UNIQUE')) return res.status(409).json({ error: 'Упражнение с това име вече съществува' });
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id/leaderboard', (req, res) => {
  const lift = db.prepare('SELECT * FROM lifts WHERE id = ?').get(req.params.id);
  if (!lift) return res.status(404).json({ error: 'Упражнението не е намерено' });

  const records = db.prepare(`
    SELECT a.id as athlete_id, a.name as athlete_name, MAX(pr.weight_kg) as max_weight,
      (SELECT date FROM personal_records
        WHERE athlete_id = a.id AND lift_id = ? ORDER BY weight_kg DESC LIMIT 1) as date
    FROM personal_records pr
    JOIN athletes a ON pr.athlete_id = a.id
    WHERE pr.lift_id = ?
    GROUP BY pr.athlete_id
    ORDER BY max_weight DESC
  `).all(req.params.id, req.params.id);

  res.json({ lift, records: records.map((r, i) => ({ ...r, rank: i + 1 })) });
});

router.delete('/:id', (req, res) => {
  const count = db.prepare('SELECT COUNT(*) as c FROM personal_records WHERE lift_id = ?').get(req.params.id);
  if (count.c > 0) return res.status(409).json({ error: 'Не може да изтриете упражнение с въведени резултати' });
  db.prepare('DELETE FROM lifts WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

module.exports = router;
