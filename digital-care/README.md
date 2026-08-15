# Kalidad Digital Care

Application layer for customer ordering, pharmacist-assisted care and staff operations. The existing public website remains at the repository root and is not replaced by this application.

## Implemented

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
5. Run `npm test`.
6. Start with `npm start`.
7. Open `/` for the Digital Care storefront and `/staff.html` for staff operations.

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
