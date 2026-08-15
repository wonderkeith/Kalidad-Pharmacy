// This is the only V1 source of public-chat answers. Keep operational details
// here only after they have been approved by Kalidad Pharmacy.
const FALLBACK = 'I cannot safely answer that from the approved pharmacy information. I will place this in the Kalidad team queue for a direct response.';

const FAQ = [
  { id: 'greeting', keywords: ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening'], answer: 'Hello. I can help with approved general pharmacy information and connect you with the Kalidad team when needed.' },
  { id: 'services', keywords: ['service', 'services'], answer: 'For information about a specific pharmacy service, please tell me what you need. If it is not covered in the approved information, I will send it to the team.' },
  { id: 'location', keywords: ['where', 'location', 'address', 'branch'], answer: 'Location details are awaiting pharmacy approval. I will send this question to the Kalidad team for the current information.', handoff: true },
  { id: 'hours', keywords: ['hours', 'open', 'opening', 'close', 'closing', 'time'], answer: 'Opening-hours information is awaiting pharmacy approval. I will send this question to the Kalidad team for the current information.', handoff: true },
  { id: 'delivery', keywords: ['delivery', 'deliver', 'courier'], answer: 'Delivery availability and service areas must be confirmed by the Kalidad team. I will send this question to them.', handoff: true },
  { id: 'order', keywords: ['order', 'buy', 'purchase', 'refill'], answer: 'The Kalidad team can confirm availability and any prescription requirements before an order is arranged. I will send this question to them.', handoff: true },
  { id: 'payment', keywords: ['pay', 'payment', 'cash', 'mobile money', 'momo', 'card'], answer: 'This chat does not take payments or collect card details, passwords, PINs, or other payment credentials. The Kalidad team can provide the approved payment instructions.', handoff: true },
  { id: 'team', keywords: ['pharmacist', 'team', 'staff', 'human', 'person'], answer: 'I will place this in the Kalidad team queue so a staff member or pharmacist can review it.', handoff: true }
];

function findAnswer(text = '') {
  const normalized = String(text).toLowerCase();
  return FAQ.find((entry) => entry.keywords.some((keyword) => normalized.includes(keyword))) || null;
}

module.exports = { FAQ, FALLBACK, findAnswer };
