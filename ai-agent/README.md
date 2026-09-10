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
- `.env.example` documents the required server secret and optional model override.
- `vercel.json` configures the chat endpoint and adds cache/security headers.
- `TEST-PLAN.md` defines the acceptance checks for UI, safety, grounding and deployment.

## Vercel deployment — exact setup

### 1. Import the GitHub repository
Connect the GitHub repository `wonderkeith/Kalidad-Pharmacy` to Vercel and use the `ai-pharmacy-agent` branch for Preview testing. Do not point the production domain at this branch until the preview acceptance tests pass.

This is a static HTML site with a Vercel serverless function at `api/chat.js`; no framework build command is required unless the existing Vercel project already defines one.

### 2. Configure the OpenAI secret
In the Vercel project settings, add:

- `OPENAI_API_KEY` → **Preview** and **Production** as appropriate.
- `OPENAI_MODEL` → optional; leave unset to use `gpt-5.6-luna`.

For the branch preview, Vercel can scope a Preview variable specifically to `ai-pharmacy-agent`. Never commit the real key to GitHub and never create a `NEXT_PUBLIC_OPENAI_API_KEY` variable.

After changing environment variables, redeploy the affected environment so the new values are available to the function.

### 3. Verify the API route before opening the chat
The hardened endpoint supports a safe GET health check:

`GET /api/chat`

Expected shape:

```json
{
  "ok": true,
  "service": "Kalidad AI Pharmacy Assistant",
  "configured": true,
  "model": "gpt-5.6-luna"
}
```

`configured` only reports whether the server has a key; the key itself is never returned.

Then test a POST through the deployed origin:

```json
POST /api/chat
Content-Type: application/json

{
  "message": "What services does Kalidad Pharmacy offer?",
  "history": []
}
```

The browser assistant already calls the same-origin path `/api/chat`, so no CORS configuration or hard-coded deployment URL is required.

### 4. Production promotion
Only promote the branch after:
- `GET /api/chat` returns HTTP 200 with `configured: true`.
- A normal POST returns a grounded assistant reply.
- Safety tests in `TEST-PLAN.md` pass.
- Browser testing confirms the floating assistant works on desktop and mobile.

Production should use the same `/api/chat` route and a Production-scoped `OPENAI_API_KEY`.

## Deployment hardening
- API responses use `Cache-Control: no-store` to prevent chat responses being cached.
- `X-Content-Type-Options: nosniff` is applied.
- API responses use `Referrer-Policy: no-referrer`.
- The site receives a restrictive Permissions Policy for camera, microphone and geolocation.
- HTTPS is reinforced with HSTS in Vercel response headers.
- The API validates method, message type and message length.
- Conversation history is restricted to safe user/assistant roles and the latest 12 entries.
- OpenAI calls have a 25-second abort timeout, below the configured 30-second Vercel function limit.
- The model can be overridden server-side through `OPENAI_MODEL`; the browser cannot choose the model.

## GitHub Pages limitation
GitHub Pages can serve the static website but cannot execute `api/chat.js`. The production deployment that powers the AI assistant therefore needs Vercel (or another serverless backend).

## Safety boundary
The assistant provides general information and navigation support. It must not diagnose, prescribe prescription-only medicines, invent product availability/prices, or guess individualized paediatric doses. Cases involving infants, pregnancy/breastfeeding, allergies, interactions, serious chronic disease, uncertain dosing, or emergency symptoms should be escalated appropriately.

## Final integration points
The codebase is ready for external credentials and live data that are not available to this build session:
- Set `OPENAI_API_KEY` on Vercel Preview and Production.
- Connect the real Firebase customer/account and order data when those credentials are available.
- Connect a real product inventory/price source rather than inventing stock.
- Deliver pharmacist handoffs to the staff dashboard/WhatsApp workflow.
- Add authenticated customer order lookup.
- Run `TEST-PLAN.md` against a deployed preview before merging to `main`.
