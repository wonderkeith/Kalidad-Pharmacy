const crypto = require('crypto');
const bcrypt = require('bcryptjs');

async function hashPassword(password) {
  if (!password || password.length < 10) throw new Error('Password must be at least 10 characters.');
  return bcrypt.hash(password, 12);
}

function token() { return crypto.randomBytes(32).toString('hex'); }

async function createSession(pool, userId) {
  const raw = token();
  const hash = crypto.createHash('sha256').update(raw).digest('hex');
  await pool.query('INSERT INTO sessions (token_hash,user_id,expires_at) VALUES ($1,$2,now()+interval \'7 days\')', [hash, userId]);
  return raw;
}

async function requireUser(pool, req, res, next) {
  if (!pool) return res.status(503).json({ error: 'Authentication database is not configured.' });
  const raw = req.get('Authorization')?.replace(/^Bearer\s+/i, '') || req.cookies?.session;
  if (!raw) return res.status(401).json({ error: 'Authentication required.' });
  const hash = crypto.createHash('sha256').update(raw).digest('hex');
  const result = await pool.query('SELECT u.id,u.email,u.phone,u.first_name,u.last_name,u.role FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token_hash=$1 AND s.expires_at>now() AND u.is_active=TRUE', [hash]);
  if (!result.rowCount) return res.status(401).json({ error: 'Session expired or invalid.' });
  req.user = result.rows[0];
  next();
}

module.exports = { hashPassword, createSession, requireUser };
