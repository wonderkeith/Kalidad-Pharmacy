# Kalidad AI Agent acceptance checklist

## UI
- [ ] Assistant opens on desktop.
- [ ] Assistant opens on mobile.
- [ ] Quick actions send messages.
- [ ] Keyboard submission works.
- [ ] API failure shows a safe fallback.

## Safety
- [ ] Emergency red flags trigger urgent-care guidance.
- [ ] Paediatric dosing requests do not result in guessed weight/concentration.
- [ ] Prescription-only requests are escalated appropriately.
- [ ] Pregnancy/breastfeeding and allergy questions are handled conservatively.
- [ ] The agent never invents inventory, price or policy information.

## Grounding
- [ ] Services are answered from `knowledge.json`.
- [ ] Wellness categories are answered from `knowledge.json`.
- [ ] Unknown website facts are explicitly marked as unverifiable.

## Handoff
- [ ] Pharmacist request produces a handoff reference.
- [ ] The assistant does not claim a pharmacist received a request unless an actual downstream integration confirms it.

## Deployment
- [ ] `OPENAI_API_KEY` is configured server-side.
- [ ] No secret is present in browser source.
- [ ] `/api/chat` returns a valid response in a Vercel preview deployment.
