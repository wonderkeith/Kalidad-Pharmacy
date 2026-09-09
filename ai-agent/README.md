# Kalidad Pharmacy AI Agent

Production-oriented AI pharmacy assistant foundation for the Kalidad Pharmacy website.

## Included in this branch
- Branded floating assistant UI loaded site-wide through `theme.js`.
- Responsive desktop/mobile chat panel matching the Kalidad forest-green, lime and cream brand.
- Quick actions for symptoms, wellness shopping, pharmacist escalation and services.
- Server-side `/api/chat` endpoint using the OpenAI Responses API.
- Function tools for grounded Kalidad website knowledge and structured pharmacist handoff.
- Published website knowledge in `ai-agent/knowledge.json`.
- Paediatric safety guardrails and urgent red-flag escalation rules.
- No OpenAI secret in browser code.
- `.env.example` documents the required server secret.

## Deployment
GitHub Pages can serve the static website but cannot execute `api/chat.js`. Deploy the repository/branch with a serverless runtime such as Vercel, then configure `OPENAI_API_KEY` as a server environment variable.

Vercel supports separate Preview and Production environment variables. Keep the secret server-side and never prefix it with `NEXT_PUBLIC_`.

## Safety boundary
The assistant provides general information and navigation support. It must not diagnose, prescribe prescription-only medicines, invent product availability/prices, or guess individualized paediatric doses. Cases involving infants, pregnancy/breastfeeding, allergies, interactions, serious chronic disease, uncertain dosing, or emergency symptoms should be escalated appropriately.

## Next integrations when the underlying systems are available
- Connect the real Firebase customer/account and order data.
- Connect a real product inventory/price source rather than inventing stock.
- Deliver pharmacist handoffs to the staff dashboard/WhatsApp workflow.
- Add authenticated customer order lookup.
- Add automated evaluation tests and monitoring for safety and reliability.
