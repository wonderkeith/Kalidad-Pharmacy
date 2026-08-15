# Kalidad Digital Care

Application layer for customer ordering, pharmacist-assisted care and staff operations. The existing public website remains at the repository root and is not replaced by this application.

## Implemented in this branch

- PostgreSQL domain schema for customers/staff, products, carts, prescriptions, orders, conversations, knowledge articles and audit logs.
- Secure password hashing and database-backed bearer sessions.
- Customer registration, sign-in, account and order-history UI.
- Product catalogue search and database-backed pricing/stock.
- Transactional ordering with row-level stock locking.
- Delivery/collection fulfilment model.
- Prescription upload with MIME/size validation and pharmacist review status workflow.
- Staff dashboard with protected role checks, prescription review and order status operations.
- Persistent customer conversation/message model and web chat UI.
- Provider-neutral payment, delivery and notification adapter boundaries.
- Controlled pharmacy knowledge assistant module with explicit clinical-risk handoff rules.
- Audit events for prescription uploads/reviews and order status changes.
- GitHub Actions syntax checks.

## Local setup

1. Install Node.js 20+ and PostgreSQL 15+.
2. Copy `.env.example` to `.env` and set a strong `SESSION_SECRET` and `DATABASE_URL`.
3. Run `npm install` inside `digital-care/`.
4. Create a database and apply `schema.sql`, then `migrations/001_sessions.sql`.
5. Start with `npm start`.
6. Open `/` for the Digital Care storefront, `/login.html` for customer authentication and `/staff.html` for staff operations.

## API surface

- `GET /api/health`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/logout`
- `GET /api/products?q=&category=`
- `POST /api/orders`
- `GET /api/orders`
- `GET /api/orders/:id`
- `POST /api/prescriptions`
- `GET /api/staff/summary`
- `GET /api/staff/prescriptions`
- `PATCH /api/staff/prescriptions/:id`
- `GET /api/staff/orders`
- `PATCH /api/staff/orders/:id`
- `GET /api/staff/conversations`
- `POST /api/conversations`
- `POST /api/conversations/:id/messages`
- `GET /api/conversations/:id/messages`

## Production completion still required

The remaining provider-dependent and operational work must be completed before production launch: real payment integration and webhook verification, delivery provider integration, outbound notifications, secure staff prescription-document viewing/download, password reset/email verification, stronger abuse/rate limiting controls, real-time staff messaging, full admin CRUD for products/inventory/knowledge/staff, production AI-provider integration constrained to approved knowledge, database backup/retention, monitoring, end-to-end tests, deployment configuration and final pharmacy acceptance testing.

No provider credentials belong in source control. Use deployment secrets/environment variables.
