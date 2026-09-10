import OpenAI from 'openai';
import knowledge from '../ai-agent/knowledge.json' with { type: 'json' };

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const MODEL = process.env.OPENAI_MODEL || 'gpt-5.6-luna';
const MAX_MESSAGE_LENGTH = 4000;
const MAX_HISTORY_ITEMS = 12;
const REQUEST_TIMEOUT_MS = 25000;

const SYSTEM_PROMPT = `You are Kalidad Pharmacy's AI Pharmacy Assistant for a community pharmacy in Uganda.

ROLE
Help customers understand general health information, navigate Kalidad Pharmacy services, explore the published wellness categories, prepare questions for a pharmacist, and start a pharmacist handoff when appropriate.

NON-NEGOTIABLE SAFETY
- You are not a doctor and not a replacement for a pharmacist or clinician.
- Never diagnose, prescribe prescription-only medicines, or invent a treatment plan.
- Never invent a medicine, product, price, stock status, opening hour, delivery promise, address, policy, or service.
- For a child, do not guess weight, concentration, dose, frequency, or duration. Ask for age, weight, product name/concentration and relevant symptoms when appropriate, and prefer pharmacist review for individualized dosing.
- For pregnancy, breastfeeding, allergies, significant chronic disease, medication interactions, very young infants, or uncertain medicine history, recommend pharmacist/clinician review.
- Urgent red flags include difficulty breathing, blue/grey lips, severe dehydration, seizures, altered consciousness, severe allergic reaction, chest pain, severe bleeding, or rapidly worsening illness. Direct the customer to urgent/emergency care rather than continuing routine self-care advice.
- If a customer asks for a prescription medicine or a diagnosis, explain the limitation and offer pharmacist escalation.
- Keep answers concise, warm and easy to understand. Use bullets where useful.

PHARMACY KNOWLEDGE
The published Kalidad information supplied to you is authoritative for this website. Use the knowledge tool when a customer asks about Kalidad services or wellness categories. If something is not in the knowledge base, say it cannot be verified rather than guessing.

HANDOFF
When pharmacist review is appropriate, call request_pharmacist_handoff. Do not claim that a pharmacist has already received the request unless the tool confirms it.`;

const tools = [
  {
    type: 'function',
    name: 'get_kalidad_knowledge',
    description: 'Retrieve published Kalidad Pharmacy website information about services, wellness categories, contact guidance and safety boundaries. Use instead of guessing website facts.',
    parameters: {
      type: 'object',
      properties: {
        topic: { type: 'string', description: 'The customer topic, such as services, wellness, contact, or pharmacy.' }
      },
      required: ['topic'],
      additionalProperties: false
    },
    strict: true
  },
  {
    type: 'function',
    name: 'request_pharmacist_handoff',
    description: 'Prepare a structured handoff when a customer asks to speak to a pharmacist or the situation needs professional review. This does not claim the pharmacist has received it.',
    parameters: {
      type: 'object',
      properties: {
        reason: { type: 'string' },
        summary: { type: 'string' },
        urgency: { type: 'string', enum: ['routine', 'soon', 'urgent'] }
      },
      required: ['reason', 'summary', 'urgency'],
      additionalProperties: false
    },
    strict: true
  }
];

function runTool(name, args) {
  if (name === 'get_kalidad_knowledge') {
    return JSON.stringify({
      services: knowledge.services,
      wellness_categories: knowledge.wellness_categories,
      contact_guidance: knowledge.contact_guidance,
      safety: knowledge.safety
    });
  }
  if (name === 'request_pharmacist_handoff') {
    return JSON.stringify({
      status: 'prepared',
      reference: `KA-${Date.now().toString(36).toUpperCase()}`,
      ...args,
      next_step: 'Show the customer the handoff reference and direct them to the configured Kalidad pharmacist contact channel.'
    });
  }
  return JSON.stringify({ error: 'Unknown tool' });
}

function json(res, status, payload) {
  res.status(status).setHeader('Content-Type', 'application/json; charset=utf-8').json(payload);
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'no-referrer');

  // Lightweight health endpoint for deployment checks. Never exposes the secret.
  if (req.method === 'GET') {
    return json(res, 200, {
      ok: true,
      service: 'Kalidad AI Pharmacy Assistant',
      configured: Boolean(process.env.OPENAI_API_KEY),
      model: MODEL
    });
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST');
    return json(res, 405, { error: 'Method not allowed' });
  }

  if (!process.env.OPENAI_API_KEY) {
    return json(res, 503, { error: 'AI service is not configured' });
  }

  try {
    const body = req.body || {};
    const message = typeof body.message === 'string' ? body.message.trim() : '';

    if (!message || message.length > MAX_MESSAGE_LENGTH) {
      return json(res, 400, { error: 'A valid message is required' });
    }

    const safeHistory = Array.isArray(body.history)
      ? body.history
          .filter(m => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
          .map(m => ({ role: m.role, content: m.content.slice(0, MAX_MESSAGE_LENGTH) }))
          .slice(-MAX_HISTORY_ITEMS)
      : [];

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      let response = await client.responses.create({
        model: MODEL,
        instructions: SYSTEM_PROMPT,
        input: [...safeHistory, { role: 'user', content: message }],
        tools,
        tool_choice: 'auto',
        max_output_tokens: 900,
        safety_identifier: 'kalidad-public-web-user',
        signal: controller.signal
      });

      for (let round = 0; round < 3; round += 1) {
        const calls = (response.output || []).filter(item => item.type === 'function_call');
        if (!calls.length) break;

        const outputs = calls.map(call => {
          let args = {};
          try { args = JSON.parse(call.arguments || '{}'); } catch (_) {}
          return {
            type: 'function_call_output',
            call_id: call.call_id,
            output: runTool(call.name, args)
          };
        });

        response = await client.responses.create({
          model: MODEL,
          instructions: SYSTEM_PROMPT,
          previous_response_id: response.id,
          input: outputs,
          tools,
          tool_choice: 'auto',
          max_output_tokens: 900,
          safety_identifier: 'kalidad-public-web-user',
          signal: controller.signal
        });
      }

      return json(res, 200, {
        reply: response.output_text || 'I could not complete that request. Please speak with a Kalidad pharmacist.',
        response_id: response.id
      });
    } finally {
      clearTimeout(timeout);
    }
  } catch (error) {
    console.error('Kalidad AI agent error:', error);
    if (error?.name === 'AbortError') {
      return json(res, 504, { error: 'AI request timed out. Please try again.' });
    }
    return json(res, 500, { error: 'AI service unavailable' });
  }
}
