# Kalidad Pharmacy AI Agent

Initial foundation for the website's AI pharmacy assistant.

## Current build
- Branded floating AI assistant UI loaded by `theme.js`.
- Quick actions for symptoms, shopping, pharmacist handoff, and services.
- Secure server-side `/api/chat` route using the OpenAI Responses API.
- Clinical safety guardrails, including extra caution for paediatric dosing and red-flag symptoms.
- Conversation history limited to the latest messages sent by the browser.

## Deployment requirement
The browser must never contain an OpenAI API key.

Set this server environment variable on the deployment platform:

`OPENAI_API_KEY=...`

The `/api/chat` route is intended for a Vercel deployment (or another platform that supports the same serverless route pattern). GitHub Pages alone cannot execute `api/chat.js`.

## Next build phases
1. Connect the agent to Kalidad's real product catalogue.
2. Add pharmacy/service knowledge and approved FAQs.
3. Add pharmacist handoff and structured patient-information collection.
4. Connect authenticated customers and orders.
5. Add admin/pharmacist dashboard for conversations and escalations.
6. Add evaluation tests for medicine safety, paediatric dosing, and escalation behavior.
