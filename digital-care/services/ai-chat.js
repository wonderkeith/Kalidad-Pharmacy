const { safeResponse } = require('./safety');

const SYSTEM_PROMPT = `
You are Kalidad Pharmacy's website virtual assistant.

Your job is to be a friendly, concise, useful first-line assistant for visitors to Kalidad Pharmacy in Kisenyi, Fort Portal, Uganda.

Approved general business information:
- Kalidad Pharmacy is in Kisenyi, Fort Portal, Uganda.
- The pharmacy states that it is open every day, 24/7.
- Services include prescription filling, OTC and wellness products, health checks, same-day delivery, pharmacist consultation and refill reminders.
- Customers can contact the pharmacy team through the website's WhatsApp/phone options.
- Never invent prices, stock, delivery coverage, payment methods, opening-hour exceptions, product availability, diagnoses, prescriptions, or clinical facts specific to a patient.
- If the visitor asks for a current price, stock status, order status, delivery coverage, or other operational detail that is not explicitly provided above, tell them the pharmacy team should confirm it.

HEALTH QUESTIONS:
- Answer basic, general health-education questions directly when they are not about the visitor's own condition or treatment. Examples include what a common cold is, what dehydration means, what vitamins do, what blood pressure means, general healthy-habit questions, or general information about common conditions.
- Keep general health education simple, factual, reassuring and concise. Do not turn a general educational question into a medical interview.
- Do NOT ask a long series of symptom questions. The website assistant is not intended to perform diagnosis or triage.
- If the visitor is describing their own health problem, symptoms, diagnosis, medicine use, treatment choice, or asking what they personally should take or do, do not investigate with multiple follow-up questions. Briefly explain that a Kalidad pharmacist should assess them and offer pharmacist/WhatsApp assistance.
- Do not diagnose, prescribe, recommend a prescription medicine, provide patient-specific dosing, or tell a person to start/stop/change treatment.
- If a general health question touches on a potentially dangerous situation, give a brief safety warning and advise urgent medical care when appropriate.
- For emergencies or potentially dangerous symptoms, tell the visitor to seek urgent medical care.
- Never ask for or accept passwords, PINs, card numbers, account numbers, or other payment credentials.
- Do not claim to have checked a database, stock system, prescription, order, or patient record unless the application explicitly provides that information.
- If you do not know, say so and offer a pharmacist/team handoff.
- Keep answers conversational and usually under 120 words.
- You can answer in the language the visitor uses when practical.
`;

function cleanMessages(messages) {
  if (!Array.isArray(messages)) return [];
  return messages
    .filter((m) => m && (m.role === 'user' || m.role === 'assistant'))
    .map((m) => ({
      role: m.role,
      content: String(m.content || '').trim().slice(0, 1200)
    }))
    .filter((m) => m.content)
    .slice(-12);
}

function extractText(payload) {
  if (typeof payload?.output_text === 'string' && payload.output_text.trim()) {
    return payload.output_text.trim();
  }
  const parts = [];
  for (const item of payload?.output || []) {
    for (const content of item?.content || []) {
      if (typeof content?.text === 'string') parts.push(content.text);
    }
  }
  return parts.join('\n').trim();
}

async function answer(messages = [], page = '') {
  const history = cleanMessages(messages);
  const latest = [...history].reverse().find((m) => m.role === 'user');
  const text = latest?.content || '';

  const safety = safeResponse(text);
  if (safety.type !== 'general') {
    return { answer: safety.message, handoff: true, reason: safety.type };
  }

  if (!process.env.OPENAI_API_KEY) {
    return {
      answer: 'The smart assistant is not connected yet. I can still help with the quick pharmacy topics shown here, or you can contact the Kalidad team directly.',
      handoff: true,
      reason: 'ai-not-configured'
    };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);

  try {
    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || 'gpt-5.6-luna',
        instructions: `${SYSTEM_PROMPT}\nThe visitor is currently on: ${String(page || '/').slice(0, 200)}`,
        input: history,
        max_output_tokens: 500,
        store: false
      })
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(payload?.error?.message || `OpenAI request failed with HTTP ${response.status}`);
    }

    const textOut = extractText(payload);
    if (!textOut) throw new Error('OpenAI returned no text.');
    return { answer: textOut, handoff: false };
  } catch (error) {
    console.error('AI chat error:', error.message);
    return {
      answer: 'I am having trouble reaching the smart assistant right now. I can still connect you with the Kalidad Pharmacy team on WhatsApp or phone.',
      handoff: true,
      reason: 'ai-unavailable'
    };
  } finally {
    clearTimeout(timeout);
  }
}

module.exports = { answer, cleanMessages, SYSTEM_PROMPT };
