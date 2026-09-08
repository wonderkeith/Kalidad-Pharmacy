const crypto = require('crypto');
const { Pool } = require('pg');

let pool;
function db() {
  if (!process.env.DATABASE_URL) return null;
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      max: 5
    });
  }
  return pool;
}

function tokenFromCookie(req, name) {
  return String(req.headers.cookie || '').split(';').map((x) => x.trim()).find((x) => x.startsWith(name + '='))?.slice(name.length + 1) || '';
}
function hash(value) { return crypto.createHash('sha256').update(String(value)).digest('hex'); }
function setChatCookie(res, token) {
  res.setHeader('Set-Cookie', `kc_chat=${token}; Path=/; Max-Age=${60 * 60 * 24 * 30}; HttpOnly; SameSite=Lax${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`);
}
function setStaffCookie(res, token) {
  res.setHeader('Set-Cookie', `kc_staff=${token}; Path=/; Max-Age=${60 * 60 * 8}; HttpOnly; SameSite=Lax${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`);
}
async function visitorConversation(req, id) {
  const p = db();
  if (!p) return null;
  const token = tokenFromCookie(req, 'kc_chat');
  if (!token || !id) return null;
  const r = await p.query('SELECT id,status FROM conversations WHERE id=$1 AND user_id IS NULL AND visitor_token_hash=$2', [id, hash(token)]);
  return r.rowCount ? r.rows[0] : null;
}
async function staffUser(req) {
  const p = db();
  if (!p) return null;
  const token = tokenFromCookie(req, 'kc_staff') || String(req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  if (!token) return null;
  const r = await p.query('SELECT u.id,u.email,u.phone,u.first_name,u.last_name,u.role FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token_hash=$1 AND s.expires_at>now() AND u.is_active=TRUE', [hash(token)]);
  if (!r.rowCount || !['staff', 'pharmacist', 'admin'].includes(r.rows[0].role)) return null;
  return r.rows[0];
}
module.exports = { db, hash, tokenFromCookie, setChatCookie, setStaffCookie, visitorConversation, staffUser };
