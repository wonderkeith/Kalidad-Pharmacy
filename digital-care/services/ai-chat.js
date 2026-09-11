const SERVICE_CATALOG = {
  prescription: {
    labels: ['prescription filling', 'prescriptions', 'prescription'],
    answer: 'Our prescription filling service helps you get your prescribed medicines prepared by the pharmacy team. Bring or submit a valid prescription and our team can guide you through the next steps, subject to pharmacist review and medicine availability.'
  },
  'otc-wellness': {
    labels: ['otc & wellness products', 'otc and wellness products', 'otc', 'wellness products'],
    answer: 'We offer over-the-counter and wellness products across nutritional supplements and boosters, personal hygiene and oral care, skincare and body care, and baby care essentials. Our team can help you find the appropriate products available at Kalidad Pharmacy.'
  },
  'health-checks': {
    labels: ['free health checks', 'health checks', 'health check'],
    answer: 'Kalidad Pharmacy offers free health checks as part of its community pharmacy services. The pharmacy team can explain the checks currently available and guide you through the service.'
  },
  delivery: {
    labels: ['same-day delivery', 'same day delivery', 'delivery'],
    answer: 'We offer same-day delivery. Delivery coverage, timing and order details are confirmed by the Kalidad Pharmacy team for your request.'
  },
  consultation: {
    labels: ['pharmacist consultation', 'pharmacist consultations', 'pharmacist'],
    answer: 'You can speak with a Kalidad pharmacist for medication and health-related guidance. For personal symptoms, treatment choices or medicine questions, a live pharmacist is the right next step.'
  },
  refills: {
    labels: ['refill reminders', 'refill reminder', 'refills'],
    answer: 'Our refill reminder service helps you remember when it is time to arrange a medicine refill. The Kalidad Pharmacy team can explain how the reminder service works and help you get started.'
  }
};

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

function findService(text) {
  const value = String(text || '').toLowerCase();
  for (const [id, service] of Object.entries(SERVICE_CATALOG)) {
    if (service.labels.some((label) => value.includes(label))) return { id, ...service };
  }
  return null;
}

async function answer(messages = [], page = '') {
  const history = cleanMessages(messages);
  const latest = [...history].reverse().find((m) => m.role === 'user');
  const service = findService(latest?.content || '');

  // The public chatbot is intentionally service-guided. It must not answer
  // general questions, medical questions, or arbitrary prompts through AI.
  if (!service) {
    return {
      answer: 'Please choose one of the Kalidad Pharmacy services shown in the chat to get its details.',
      handoff: false,
      serviceOnly: true
    };
  }

  return {
    answer: `${service.answer}\n\nNeed more info? Chat live with a pharmacist.`,
    handoff: true,
    serviceOnly: true,
    serviceId: service.id
  };
}

module.exports = { answer, cleanMessages, findService, SERVICE_CATALOG };