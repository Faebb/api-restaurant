# Kaizen Fusion API — Multi-tenant SaaS

REST API for the Kaizen Fusion restaurant SaaS. **Node.js + Express +
TypeScript + Prisma ORM + MySQL**. Each restaurant lives in its own row-level
tenant; customers reach a restaurant via its URL slug, while owners manage
their data through a JWT-protected admin surface.

---

## Quickstart

Prerequisites: Node.js ≥ 18 and a MySQL 8 database you can write to.

```bash
cd api-restaurant
cp .env.example .env
# Edit .env: set DATABASE_URL, JWT_SECRET, ALLOWED_ORIGINS

npm install
npm run db:migrate      # applies the baseline SaaS migration
npm run db:seed         # creates one demo tenant + the full Kaizen menu
npm run dev             # starts on http://localhost:3000
```

Demo credentials (created by the seed):

- Tenant slug: `kaizen-fusion`
- Owner: `owner@kaizenfusion.com` / `Owner123!`

`curl http://localhost:3000/health` should return `{"status":"ok"...}`.

---

## Endpoint map

| Group  | Method | Path | Auth |
|--------|--------|------|------|
| Health | GET    | `/health` | — |
| Auth   | POST   | `/api/auth/register` | — |
| Auth   | POST   | `/api/auth/login` | — |
| Auth   | GET    | `/api/auth/me` | JWT |
| Public | GET    | `/api/public/:slug/menu` | — |
| Public | GET    | `/api/public/:slug/menu/items/:id` | — |
| Public | POST   | `/api/public/:slug/reservations` | — |
| Public | POST   | `/api/public/:slug/orders` | — |
| Public | GET    | `/api/public/:slug/orders/:id` | — |
| Admin  | GET    | `/api/admin/menu/categories` | JWT |
| Admin  | POST   | `/api/admin/menu/categories` | JWT |
| Admin  | PUT    | `/api/admin/menu/categories/:id` | JWT |
| Admin  | DELETE | `/api/admin/menu/categories/:id` | JWT |
| Admin  | GET    | `/api/admin/menu/items` | JWT |
| Admin  | POST   | `/api/admin/menu/items` | JWT |
| Admin  | PUT    | `/api/admin/menu/items/:id` | JWT |
| Admin  | DELETE | `/api/admin/menu/items/:id` | JWT |
| Admin  | GET    | `/api/admin/tables` | JWT |
| Admin  | POST   | `/api/admin/tables` | JWT |
| Admin  | PUT    | `/api/admin/tables/:id` | JWT |
| Admin  | DELETE | `/api/admin/tables/:id` | JWT |
| Admin  | GET    | `/api/admin/orders` | JWT |
| Admin  | GET    | `/api/admin/orders/:id` | JWT |
| Admin  | PATCH  | `/api/admin/orders/:id/status` | JWT |
| Admin  | GET    | `/api/admin/reservations` | JWT |

Full request / response examples in [CURLS.md](CURLS.md).

---

## Multi-tenancy model

- Shared database, shared schema, `tenantId` discriminator column on every
  domain table (`menu_categories`, `menu_items`, `restaurant_tables`,
  `reservations`, `orders`).
- The service layer enforces tenant isolation — every query filters by
  `tenantId`. There is no cross-tenant access path.
- Tenant resolution:
  - **Public flow** (`/api/public/:slug/*`) — the `:slug` URL param is
    looked up in `tenants.slug` by `resolveTenant` middleware; the resolved
    `tenantId` is stamped on `req.tenantId` for the handler.
  - **Admin flow** (`/api/admin/*`) — `requireAuth` verifies the JWT and
    stamps `req.user = { userId, tenantId, role }`.
- `RestaurantTable.tableNumber` is unique **per tenant** via the composite
  unique index `@@unique([tenantId, tableNumber])`.

---

## Data model (Prisma)

```
Tenant ──┬── User[]              (OWNER, STAFF)
         ├── MenuCategory[]      ─┐
         ├── MenuItem[]          ─┤
         ├── RestaurantTable[]    │  every row tagged tenantId
         ├── Reservation[]       ─┤
         └── Order[] ─ OrderItem[]┘
```

See [`prisma/schema.prisma`](prisma/schema.prisma) for the full source of
truth. Enum-like fields are stored as `VARCHAR` columns with the allowed
values documented in `//` comments next to the field.

---

## Auth

- `bcryptjs` for password hashing (cross-platform safe).
- JWT signed with `JWT_SECRET`, expires after `JWT_EXPIRES_IN` (default
  `7d`). Payload is `{ userId, tenantId, role }`.
- `register` runs inside a Prisma transaction so a Tenant is never created
  without its OWNER user. The slug is derived from the restaurant name; on
  collision a random suffix is appended.
- `requireAuth` middleware reads `Authorization: Bearer <token>` and
  responds **401** on missing or invalid tokens.

---

## Environment variables

| Variable | Purpose | Example |
|----------|---------|---------|
| `PORT` | HTTP port | `3000` |
| `NODE_ENV` | `development` / `production` | `development` |
| `DATABASE_URL` | MySQL connection string | `mysql://u:p@host:3306/kaizen_saas` |
| `ALLOWED_ORIGINS` | Comma-separated CORS origins | `http://localhost:5173` |
| `JWT_SECRET` | Signing secret (long random string) | `<48 random hex bytes>` |
| `JWT_EXPIRES_IN` | Token TTL | `7d` |

> `.env` is gitignored. Never commit credentials.

---

## Scripts

```bash
npm run dev              # tsx watch — hot reload
npm run build            # tsc → dist/
npm run start            # node dist/server.js
npm run db:generate      # prisma generate
npm run db:migrate       # prisma migrate dev (interactive — local only)
npm run db:migrate:prod  # prisma migrate deploy (non-interactive — CI/prod)
npm run db:seed          # tsx prisma/seed.ts
npm run db:studio        # GUI for the database
npm run db:reset         # nuke + migrate + seed (dev only)
```

---

## Connecting the frontend

The companion frontend (`kaizen-fusion`) expects the API base URL in its own
`.env`:

```env
VITE_API_KAIZEN=http://localhost:3000
```

The frontend axios client attaches `Authorization: Bearer <token>` from its
Zustand auth store and consumes the same `{ success, data }` / `{ success,
error }` envelope used here.

---

## Layout

```
api-restaurant/
├── prisma/
│   ├── schema.prisma                # source of truth
│   ├── migrations/
│   │   └── 20260522120000_initial_saas_schema/migration.sql
│   └── seed.ts                      # demo tenant + Kaizen menu + tables
├── src/
│   ├── config/
│   │   ├── database.ts              # Prisma singleton
│   │   └── jwt.ts                   # sign/verify helpers
│   ├── controllers/                 # request handlers
│   ├── middleware/
│   │   ├── auth.middleware.ts       # requireAuth (JWT)
│   │   ├── tenant.middleware.ts     # resolveTenant (slug)
│   │   ├── validate.middleware.ts   # Zod factory
│   │   └── error.middleware.ts
│   ├── routes/                      # Express routers
│   ├── schemas/                     # Zod schemas
│   ├── services/                    # business logic + Prisma queries
│   ├── types/
│   ├── app.ts                       # Express app wiring
│   └── server.ts                    # entry point
├── .env                             # gitignored
├── .env.example
└── tsconfig.json
```
