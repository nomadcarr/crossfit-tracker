const db = require('../database');

const optionalAuth = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return next();
  const token = header.slice(7);
  try {
    const session = db.prepare(`
      SELECT u.id, u.nickname, u.display_name, u.athlete_id
      FROM sessions s JOIN users u ON s.user_id = u.id
      WHERE s.token = ? AND s.expires_at > datetime('now')
    `).get(token);
    if (session) req.user = session;
  } catch {}
  next();
};

const requireAuth = (req, res, next) => {
  optionalAuth(req, res, () => {
    if (!req.user) return res.status(401).json({ error: 'Необходимо е влизане' });
    next();
  });
};

module.exports = { optionalAuth, requireAuth };
