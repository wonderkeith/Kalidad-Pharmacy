# Kalidad Digital Care

Application layer for customer ordering, pharmacist-assisted care and staff operations. The existing public website remains at the repository root and is not replaced by this application.

## Implemented

### V1 Digital Care chat

- A no-login, consent-based public chat at `public/chat.html`, with a Digital Care link from the main public-site navigation.
- Server-controlled answers from `services/approved-faq.js`; unapproved operational claims remain handoffs until Kalidad explicitly approves them.
- Clinical, personal-medical, prescription and urgent questions are escalated by the safety classifier rather than answered.
- Anonymous conversation persistence is protected by a random HttpOnly cookie capability; staff can review and reply through `public/staff.html` without customer registration.
- Public chat rate limits, 800-character messages, and rejection of payment credentials, card numbers, PINs, passwords and account numbers.
- Privacy/consent notice before a ticket is created. The chat does not take online payment.

- PostgreSQL schema for customers/staff, sessions, products, carts, prescriptions, orders, conversations, knowledge articles and audit logs.
- Password hashing, bearer sessions, logout and password-reset token flow.
- Customer registration/sign-in and order-history API foundations.
- Database-backed product catalogue search, pricing and stock.
- Transactional authenticated ordering with row-level stock locking.
- Delivery/collection fulfilment model.
- Prescription upload with MIME/size validation, pharmacist review workflow and protected staff-only document access.
- Staff dashboard APIs with role checks, prescription review, order status operations and conversation assignment.
- Persistent customer conversation/message model.
- Admin catalogue and knowledge-base CRUD APIs.
- Provider-neutral payment, delivery, notification and AI adapter boundaries.
- Controlled pharmacy safety classifier with pharmacist escalation for clinical/high-risk questions.
- Audit events for privileged operational actions.
- GitHub Actions syntax and smoke tests.

## Local setup

1. Install Node.js 20+ and PostgreSQL 15+.
2. Copy `.env.example` to `.env` and set `DATABASE_URL`, `SESSION_SECRET`, upload settings and allowed origin.
3. Run `npm install` inside `digital-care/`.
4. Create a PostgreSQL database and apply `schema.sql`.
   For an existing database, then apply `migrations/002_anonymous_chat.sql` once.
5. Run `npm test`.
6. Start with `npm start`.
7. Open `/chat.html` for V1 public chat and `/staff.html` for staff operations.

## Required pharmacy configuration before launch

The V1 answer set deliberately contains no unverified address, opening hours, delivery coverage, ordering process, payment method, telephone/WhatsApp number, or provider credential. A pharmacy-approved staff member must update `services/approved-faq.js` with each approved fact and keyword set, then run the test suite and redeploy.

Deploy the root public website and Digital Care service so the root navigation target `digital-care/public/chat.html` is served by the same deployment (or replace that link with the configured Digital Care deployment URL). Configure `DATABASE_URL`, TLS, a managed PostgreSQL backup policy, staff accounts, and production environment variables. Vercel deployment must also have available build capacity; the current GitHub deployment status reports an account build-rate-limit failure.

## Important production boundary

The application code now provides the internal interfaces and workflows needed for provider integrations, but production launch still requires real provider credentials/configuration and acceptance testing for:

- Payment provider and verified webhooks.
- Delivery/fulfilment provider and tracking.
- SMS/email/push notification providers.
- Production AI provider connected only to approved pharmacy knowledge, with pharmacist escalation.
- Production email/password-reset delivery.
- Real-time staff messaging/assignment UX.
- Full admin/staff management UI.
- Database backups, monitoring, rate limiting and operational alerting.
- End-to-end testing with real pharmacy inventory and fulfilment rules.
- Deployment configuration and production security review.

No provider credentials belong in source control. Use deployment secrets/environment variables.
