const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const db = require('../database');
const { requireAuth } = require('../middleware/auth');

const hashPwd = (pwd, salt) => crypto.scryptSync(pwd, salt, 64).toString('hex');
const makeToken = () => crypto.randomBytes(32).toString('hex');
const expiry = () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

router.post('/register', (req, res) => {
  const { nickname, password, display_name } = req.body;
  if (!nickname?.trim() || !password || !display_name?.trim())
    return res.status(400).json({ error: 'Всички полета са задължителни' });
  if (password.length < 6)
    return res.status(400).json({ error: 'Паролата трябва да е поне 6 символа' });

  try {
    const salt = crypto.randomBytes(16).toString('hex');
    const password_hash = hashPwd(password, salt);
    const nick = nickname.trim().toLowerCase();

    const athleteResult = db.prepare('INSERT INTO athletes (name) VALUES (?)').run(display_name.trim());
    const athlete_id = athleteResult.lastInsertRowid;

    const userResult = db.prepare(
      'INSERT INTO users (nickname, password_hash, salt, display_name, athlete_id) VALUES (?, ?, ?, ?, ?)'
    ).run(nick, password_hash, salt, display_name.trim(), athlete_id);

    const token = makeToken();
    db.prepare('INSERT INTO sessions (user_id, token, expires_at) VALUES (?, ?, ?)').run(userResult.lastInsertRowid, token, expiry());

    res.status(201).json({
      token,
      user: { id: userResult.lastInsertRowid, nickname: nick, display_name: display_name.trim(), athlete_id }
    });
  } catch (err) {
    if (err.message.includes('UNIQUE')) return res.status(409).json({ error: 'Никнеймът вече е зает' });
    res.status(500).json({ error: err.message });
  }
});

router.post('/login', (req, res) => {
  const { nickname, password } = req.body;
  if (!nickname || !password) return res.status(400).json({ error: 'Въведи никнейм и парола' });

  const user = db.prepare('SELECT * FROM users WHERE nickname = ?').get(nickname.trim().toLowerCase());
  if (!user || hashPwd(password, user.salt) !== user.password_hash)
    return res.status(401).json({ error: 'Грешен никнейм или парола' });

  const token = makeToken();
  db.prepare('INSERT INTO sessions (user_id, token, expires_at) VALUES (?, ?, ?)').run(user.id, token, expiry());

  res.json({
    token,
    user: { id: user.id, nickname: user.nickname, display_name: user.display_name, athlete_id: user.athlete_id }
  });
});

router.post('/logout', requireAuth, (req, res) => {
  const token = req.headers.authorization?.slice(7);
  if (token) db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
  res.json({ success: true });
});

router.get('/me', requireAuth, (req, res) => res.json(req.user));

module.exports = router;
