# Kalidad Digital Care

This directory is the application layer for customer ordering, pharmacist-assisted care and staff operations. The existing public website remains at the repository root.

## Local setup

1. Install Node.js 20+ and PostgreSQL 15+.
2. Copy `.env.example` to `.env` and set `DATABASE_URL` and a strong `SESSION_SECRET`.
3. Run `npm install` inside `digital-care/`.
4. Create a database and apply `schema.sql`.
5. Start with `npm start`.
6. Open `/` for the customer storefront and `/staff.html` for the staff UI foundation.

## Current endpoints

- `GET /api/health` — service/database health.
- `GET /api/products?q=&category=` — active catalogue search.
- `POST /api/orders` — transactional order creation with stock checks.

## Required production integrations

The following must be implemented behind server-side adapters before production launch:

- Authentication, sessions, password reset and RBAC.
- Secure prescription storage and signed/private access URLs.
- Pharmacist prescription review workflow.
- Conversation persistence, assignment and real-time updates.
- Customer account, guest checkout and order history.
- Payment provider adapter and webhook verification.
- Delivery provider adapter and fulfilment tracking.
- SMS/email/push notification adapters.
- Controlled AI assistant backed by approved pharmacy knowledge, with pharmacist escalation.
- Admin catalogue, inventory, knowledge-base and staff management.
- Audit logging, rate limiting, CSRF/session protections and operational monitoring.

No provider credentials belong in source control. Use environment variables/secrets at deployment time.
