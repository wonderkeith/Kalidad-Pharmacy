const { db, visitorConversation } = require('../digital-care/services/live-chat');

module.exports = async function handler(req, res) {
  const p = db();
  if (!p) return res.status(503).json({ error: 'Live pharmacist chat is not configured yet.' });
  const id = String(req.query?.id || req.body?.conversationId || '');
  if (!id) return res.status(400).json({ error: 'Conversation required.' });
  const conversation = await visitorConversation(req, id);
  if (!conversation) return res.status(404).json({ error: 'Live chat session not found.' });

  try {
    if (req.method === 'GET') {
      const r = await p.query("SELECT id,sender_type,body,created_at FROM messages WHERE conversation_id=$1 AND sender_type IN ('customer','assistant','staff','system') ORDER BY created_at ASC LIMIT 200", [id]);
      return res.json({ status: conversation.status, messages: r.rows });
    }
    if (req.method === 'POST') {
      const body = String(req.body?.body || '').trim().slice(0, 1200);
      if (!body) return res.status(400).json({ error: 'Message required.' });
      const sensitive = /\b(password|passcode|pin|cvv|card number|account number)\b|\b(?:\d[ -]?){13,19}\b/i;
      if (sensitive.test(body)) return res.status(400).json({ error: 'For your safety, do not send passwords, PINs, card numbers, account numbers, or payment credentials.' });
      const r = await p.query("INSERT INTO messages(conversation_id,sender_type,body) VALUES($1,'customer',$2) RETURNING id,created_at", [id, body]);
      await p.query("UPDATE conversations SET status='waiting',last_customer_message_at=now(),updated_at=now() WHERE id=$1", [id]);
      return res.status(201).json({ message: r.rows[0] });
    }
    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'Method not allowed.' });
  } catch (error) {
    console.error('pharmacist chat error:', error);
    return res.status(500).json({ error: 'Unable to update the live chat.' });
  }
};
