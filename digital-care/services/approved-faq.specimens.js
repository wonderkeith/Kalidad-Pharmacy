/**
 * SPECIMENS ONLY — this file is deliberately NOT imported by the public chat.
 *
 * Copy an entry to approved-faq.js only after every bracketed item has been
 * replaced with a fact approved by Kalidad Pharmacy. Do not publish samples
 * with brackets, placeholders, or unverified operational claims.
 */
const SPECIMEN_FAQ = [
  {
    id: 'location',
    keywords: ['where', 'location', 'address', 'branch'],
    answer: 'Kalidad Pharmacy is located at [APPROVED ADDRESS OR LANDMARK].',
    handoff: false
  },
  {
    id: 'hours',
    keywords: ['hours', 'open', 'opening', 'close'],
    answer: 'Our approved opening hours are [APPROVED DAYS AND HOURS].',
    handoff: false
  },
  {
    id: 'delivery',
    keywords: ['delivery', 'deliver', 'courier'],
    answer: 'Delivery is available for [APPROVED SERVICE AREA], subject to confirmation by the team.',
    handoff: true
  },
  {
    id: 'ordering',
    keywords: ['order', 'buy', 'purchase'],
    answer: 'To arrange an order, please [APPROVED ORDERING INSTRUCTION]. The team will confirm availability and any prescription requirement.',
    handoff: true
  },
  {
    id: 'payment',
    keywords: ['pay', 'payment'],
    answer: 'The approved payment options are [APPROVED PAYMENT EXPLANATION]. This chat never accepts card numbers, PINs, passwords, or other payment credentials.',
    handoff: true
  },
  {
    id: 'contact',
    keywords: ['contact', 'call', 'whatsapp'],
    answer: 'You can contact the Kalidad team through [APPROVED CONTACT CHANNEL].',
    handoff: true
  }
];

module.exports = { SPECIMEN_FAQ };
