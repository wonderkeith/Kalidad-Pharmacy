const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { db, hash, setStaffCookie, tokenFromCookie } = require('../digital-care/services/live-chat');

module.exports = async function handler(req, res) {
  const p = db();
  if (!p) return res.status(503).json({ error: 'Pharmacist portal database is not configured.' });
  try {
    if (req.method === 'POST') {
      const identifier = String(req.body?.identifier || '').trim();
      const password = String(req.body?.password || '');
      if (!identifier || !password) return res.status(400).json({ error: 'Email/phone and password are required.' });
      const r = await p.query('SELECT id,email,phone,first_name,last_name,role,password_hash FROM users WHERE (email=$1 OR phone=$1) AND is_active=TRUE', [identifier]);
      if (!r.rowCount || !['staff','pharmacist','admin'].includes(r.rows[0].role)) return res.status(401).json({ error: 'Invalid staff credentials.' });
      if (!(await bcrypt.compare(password, r.rows[0].password_hash || ''))) return res.status(401).json({ error: 'Invalid staff credentials.' });
      const token = crypto.randomBytes(32).toString('base64url');
      await p.query('INSERT INTO sessions(token_hash,user_id,expires_at) VALUES($1,$2,now()+interval \'8 hours\')', [hash(token), r.rows[0].id]);
      setStaffCookie(res, token);
      const user = { id: r.rows[0].id, email: r.rows[0].email, phone: r.rows[0].phone, first_name: r.rows[0].first_name, last_name: r.rows[0].last_name, role: r.rows[0].role };
      return res.json({ user });
    }
    if (req.method === 'DELETE') {
      const token = tokenFromCookie(req, 'kc_staff');
      if (token) await p.query('DELETE FROM sessions WHERE token_hash=$1', [hash(token)]);
      res.setHeader('Set-Cookie', 'kc_staff=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax');
      return res.json({ ok: true });
    }
    res.setHeader('Allow', 'POST, DELETE');
    return res.status(405).json({ error: 'Method not allowed.' });
  } catch (error) {
    console.error('pharmacist login error:', error);
    return res.status(500).json({ error: 'Unable to sign in to the pharmacist portal.' });
  }
};
