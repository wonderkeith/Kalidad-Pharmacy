// Vercel Preview trigger: keeps the AI chatbot test deployment current.
const { answer } = require('../digital-care/services/ai-chat');

const buckets = new Map();
const WINDOW_MS = 60_000;
const LIMIT = 20;

function rateLimit(req) {
  const forwarded = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim();
  const key = forwarded || req.socket?.remoteAddress || 'unknown';
  const now = Date.now();
  const current = buckets.get(key) || { count: 0, started: now };
  if (now - current.started > WINDOW_MS) {
    current.count = 0;
    current.started = now;
  }
  current.count += 1;
  buckets.set(key, current);
  return current.count <= LIMIT;
}

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST, OPTIONS');
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Vary', 'Origin');

  if (!rateLimit(req)) {
    return res.status(429).json({ error: 'Too many chat requests. Please try again shortly.' });
  }

  try {
    const messages = Array.isArray(req.body?.messages) ? req.body.messages : [];
    if (!messages.length) return res.status(400).json({ error: 'Message required.' });

    const result = await answer(messages, String(req.body?.page || ''));
    return res.status(200).json(result);
  } catch (error) {
    console.error('Vercel AI chat endpoint error:', error);
    return res.status(500).json({ error: 'The smart assistant is temporarily unavailable.' });
  }
};
