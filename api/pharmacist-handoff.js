const crypto = require('crypto');
const { db, hash, tokenFromCookie, setChatCookie } = require('../digital-care/services/live-chat');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed.' });
  const p = db();
  if (!p) return res.status(503).json({ error: 'Live pharmacist chat needs the Digital Care database connection.' });
  if (req.body?.privacyConsent !== true) return res.status(400).json({ error: 'Please confirm that you want to connect with a pharmacist.' });

  try {
    let token = tokenFromCookie(req, 'kc_chat');
    let conversation = token ? (await p.query('SELECT id,status FROM conversations WHERE user_id IS NULL AND visitor_token_hash=$1 ORDER BY updated_at DESC LIMIT 1', [hash(token)])).rows[0] : null;
    if (!conversation || conversation.status === 'resolved') {
      token = crypto.randomBytes(32).toString('base64url');
      const r = await p.query("INSERT INTO conversations(channel,status,visitor_token_hash,consented_at,handoff_reason) VALUES('web','waiting',$1,now(),$2) RETURNING id,status", [hash(token), String(req.body?.reason || 'pharmacist-request').slice(0, 80)]);
      conversation = r.rows[0];
      setChatCookie(res, token);
    } else {
      await p.query("UPDATE conversations SET status='waiting',handoff_reason=COALESCE($2,handoff_reason),updated_at=now() WHERE id=$1", [conversation.id, String(req.body?.reason || '').slice(0, 80) || null]);
    }

    const messages = Array.isArray(req.body?.messages) ? req.body.messages.slice(-12) : [];
    const count = await p.query('SELECT count(*) FROM messages WHERE conversation_id=$1', [conversation.id]);
    if (Number(count.rows[0].count) === 0) {
      for (const m of messages) {
        const role = m?.role === 'user' ? 'customer' : m?.role === 'assistant' ? 'assistant' : null;
        const body = String(m?.content || '').trim().slice(0, 1200);
        if (role && body) await p.query('INSERT INTO messages(conversation_id,sender_type,body) VALUES($1,$2,$3)', [conversation.id, role, body]);
      }
      await p.query("INSERT INTO messages(conversation_id,sender_type,body) VALUES($1,'system',$2)", [conversation.id, 'The AI assistant has handed this conversation to the Kalidad pharmacist team.']);
    }
    res.status(201).json({ conversationId: conversation.id, status: 'waiting' });
  } catch (error) {
    console.error('pharmacist handoff error:', error);
    res.status(500).json({ error: 'Unable to connect you to the pharmacist team right now.' });
  }
};
