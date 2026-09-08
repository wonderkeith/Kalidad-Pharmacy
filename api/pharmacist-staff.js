const { db, staffUser, hash, tokenFromCookie } = require('../digital-care/services/live-chat');

module.exports = async function handler(req, res) {
  const p = db();
  if (!p) return res.status(503).json({ error: 'Pharmacist portal database is not configured.' });
  const user = await staffUser(req);
  if (!user) return res.status(401).json({ error: 'Staff sign-in required.' });
  try {
    if (req.method === 'GET') {
      const id = String(req.query?.id || '');
      if (id) {
        const r = await p.query('SELECT id,sender_type,body,created_at FROM messages WHERE conversation_id=$1 ORDER BY created_at ASC LIMIT 300', [id]);
        return res.json({ messages: r.rows });
      }
      const r = await p.query("SELECT c.id,c.status,c.handoff_reason,c.updated_at,c.created_at,u.first_name,u.last_name,u.phone,u.email FROM conversations c LEFT JOIN users u ON u.id=c.user_id WHERE c.status IN ('waiting','assigned','open') ORDER BY CASE WHEN c.status='waiting' THEN 0 ELSE 1 END,c.updated_at DESC LIMIT 100");
      return res.json({ user, conversations: r.rows });
    }
    if (req.method === 'POST') {
      const id = String(req.body?.conversationId || '');
      const body = String(req.body?.body || '').trim().slice(0, 4000);
      if (!id || !body) return res.status(400).json({ error: 'Conversation and message are required.' });
      const r = await p.query('SELECT id FROM conversations WHERE id=$1', [id]);
      if (!r.rowCount) return res.status(404).json({ error: 'Conversation not found.' });
      const message = await p.query("INSERT INTO messages(conversation_id,sender_id,sender_type,body) VALUES($1,$2,'staff',$3) RETURNING id,created_at", [id, user.id, body]);
      await p.query("UPDATE conversations SET status='assigned',assigned_to=$1,updated_at=now() WHERE id=$2", [user.id, id]);
      return res.status(201).json({ message: message.rows[0] });
    }
    if (req.method === 'PATCH') {
      const id = String(req.body?.conversationId || '');
      const status = ['assigned','resolved'].includes(req.body?.status) ? req.body.status : null;
      if (!id || !status) return res.status(400).json({ error: 'Conversation and valid status are required.' });
      await p.query('UPDATE conversations SET status=$1,assigned_to=$2,updated_at=now() WHERE id=$3', [status, user.id, id]);
      return res.json({ ok: true });
    }
    res.setHeader('Allow', 'GET, POST, PATCH');
    return res.status(405).json({ error: 'Method not allowed.' });
  } catch (error) {
    console.error('pharmacist staff error:', error);
    return res.status(500).json({ error: 'Unable to update the pharmacist queue.' });
  }
};
