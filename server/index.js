const express = require('express');
const cors = require('cors');
const path = require('path');
const { optionalAuth } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '4mb' }));
app.use(optionalAuth);

app.use('/api/auth', require('./routes/auth'));
app.use('/api/athletes', require('./routes/athletes'));
app.use('/api/workouts', require('./routes/workouts'));
app.use('/api/lifts', require('./routes/lifts'));

app.get('/api/stats', (req, res) => {
  const db = require('./database');
  res.json({
    athletes: db.prepare('SELECT COUNT(*) as c FROM athletes').get().c,
    workouts: db.prepare('SELECT COUNT(*) as c FROM workouts').get().c,
    results: db.prepare('SELECT COUNT(*) as c FROM workout_results').get().c,
    prs: db.prepare('SELECT COUNT(*) as c FROM personal_records').get().c,
    recentWorkouts: db.prepare(`
      SELECT w.*, COUNT(wr.id) as result_count
      FROM workouts w LEFT JOIN workout_results wr ON w.id = wr.workout_id
      GROUP BY w.id ORDER BY w.date DESC LIMIT 5
    `).all(),
    recentPRs: db.prepare(`
      SELECT pr.*, a.name as athlete_name, l.name as lift_name
      FROM personal_records pr
      JOIN athletes a ON pr.athlete_id = a.id
      JOIN lifts l ON pr.lift_id = l.id
      ORDER BY pr.created_at DESC LIMIT 8
    `).all(),
  });
});

// Serve built client in production
const clientDist = path.join(__dirname, '..', 'client', 'dist');
app.use(express.static(clientDist));
app.get('*', (req, res) => {
  res.sendFile(path.join(clientDist, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`CrossFit Tracker running on http://localhost:${PORT}`);
});
