# Kaizen Fusion API — cURL Reference

Multi-tenant SaaS API. All examples assume `http://localhost:3000` and the demo
tenant seeded by `npm run db:seed`:

- Slug: `kaizen-fusion`
- Owner login: `owner@kaizenfusion.com` / `Owner123!`

> The `:slug` in public URLs and the JWT (for admin URLs) are how the API
> resolves which restaurant a request belongs to.

---

## Health

```bash
curl http://localhost:3000/health
# → {"status":"ok","timestamp":"..."}
```

---

## Auth — `/api/auth`

### Register a new restaurant + OWNER user

Creates the `Tenant`, the OWNER `User` and returns a JWT in one shot.

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "restaurantName": "Sakura Bistro",
    "name": "Ana Owner",
    "email": "ana@sakura.com",
    "password": "Sakura123!"
  }'
```

**201** — `{ success: true, data: { token, user, tenant } }`

### Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"owner@kaizenfusion.com","password":"Owner123!"}'
```

**200** — same shape as register. `data.token` is the JWT to use as
`Authorization: Bearer <token>` on every `/api/admin/*` call.

**401** when credentials don't match. **409** when the email is already taken
during registration.

### Current user

```bash
TOKEN="paste-jwt-here"
curl -H "Authorization: Bearer $TOKEN" http://localhost:3000/api/auth/me
```

**200** — `{ success: true, data: { user, tenant } }`. **401** on missing or
expired token.

---

## Public ordering flow — `/api/public/:slug/*`

These endpoints are unauthenticated and scoped to the tenant by URL `:slug`.

### Get all menu categories + items

```bash
curl http://localhost:3000/api/public/kaizen-fusion/menu
```

### Get one menu item

```bash
curl http://localhost:3000/api/public/kaizen-fusion/menu/items/1
```

### Assign a table

```bash
curl -X POST http://localhost:3000/api/public/kaizen-fusion/reservations \
  -H "Content-Type: application/json" \
  -d '{"guests": 4}'
```

**201** — `{ data: { reservationId, tableId, tableNumber, tableType, waitTime } }`
**409** when no tables of the right size are available.

### Create an order

```bash
curl -X POST http://localhost:3000/api/public/kaizen-fusion/orders \
  -H "Content-Type: application/json" \
  -d '{
    "reservationId": "optional-reservation-uuid",
    "customerName": "John Doe",
    "documentType": "CC",
    "documentNumber": "1234567890",
    "email": "john@example.com",
    "paymentMethod": "card",
    "tipType": "fixed",
    "tipValue": 5000,
    "items": [
      { "menuItemId": "1", "quantity": 2 },
      { "menuItemId": "5", "quantity": 1 }
    ]
  }'
```

**201** — `{ data: { id, customerName, subtotal, tipValue, total, status, items, createdAt } }`
**422** when a `menuItemId` doesn't exist on this tenant.

### Get an order

```bash
curl http://localhost:3000/api/public/kaizen-fusion/orders/<order-id>
```

---

## Admin — `/api/admin/*` (JWT required)

Every call requires `Authorization: Bearer <token>`. The tenant is taken from
the token's `tenantId` — no slug in the URL.

```bash
export TOKEN="paste-jwt-here"
H="Authorization: Bearer $TOKEN"
```

### Menu categories

```bash
# list
curl -H "$H" http://localhost:3000/api/admin/menu/categories
# create
curl -X POST -H "$H" -H "Content-Type: application/json" \
  -d '{"name":"Postres","type":"POSTRES","sortOrder":8}' \
  http://localhost:3000/api/admin/menu/categories
# update
curl -X PUT -H "$H" -H "Content-Type: application/json" \
  -d '{"name":"Postres dulces"}' \
  http://localhost:3000/api/admin/menu/categories/<id>
# delete (also deletes items in the category)
curl -X DELETE -H "$H" http://localhost:3000/api/admin/menu/categories/<id>
```

### Menu items

```bash
# list
curl -H "$H" http://localhost:3000/api/admin/menu/items
# create
curl -X POST -H "$H" -H "Content-Type: application/json" \
  -d '{
    "categoryId":"cat-1","name":"Nuevo plato","description":"...",
    "price":18000,"image":"https://...","category":"ENTRADAS"
  }' \
  http://localhost:3000/api/admin/menu/items
# update
curl -X PUT -H "$H" -H "Content-Type: application/json" \
  -d '{"price":19000}' \
  http://localhost:3000/api/admin/menu/items/<id>
# delete
curl -X DELETE -H "$H" http://localhost:3000/api/admin/menu/items/<id>
```

### Tables

`tableNumber` is unique per tenant.

```bash
# list
curl -H "$H" http://localhost:3000/api/admin/tables
# create
curl -X POST -H "$H" -H "Content-Type: application/json" \
  -d '{"tableNumber":11,"tableType":"LOW","capacity":2}' \
  http://localhost:3000/api/admin/tables
# update (also used to toggle isOccupied)
curl -X PUT -H "$H" -H "Content-Type: application/json" \
  -d '{"isOccupied":true}' \
  http://localhost:3000/api/admin/tables/<id>
# delete
curl -X DELETE -H "$H" http://localhost:3000/api/admin/tables/<id>
```

### Orders (read + status transitions)

```bash
# list (most recent first)
curl -H "$H" http://localhost:3000/api/admin/orders
# get one
curl -H "$H" http://localhost:3000/api/admin/orders/<id>
# change status — PENDING | CONFIRMED | PREPARING | DELIVERED | CANCELLED
curl -X PATCH -H "$H" -H "Content-Type: application/json" \
  -d '{"status":"PREPARING"}' \
  http://localhost:3000/api/admin/orders/<id>/status
```

### Reservations (read only)

```bash
curl -H "$H" http://localhost:3000/api/admin/reservations
```

---

## Response envelope

Every endpoint returns one of:

```json
{ "success": true, "data": ... }
```

```json
{ "success": false, "error": "Mensaje en español", "details": [/* optional */] }
```

`details` is populated for Zod validation errors with `{ field, message }` per
field.

---

## Status codes used

- `200` GET / PUT / PATCH success
- `201` POST create success
- `204` DELETE success (no body)
- `400` Zod validation failed
- `401` Missing or invalid JWT
- `404` Resource not found / unknown slug
- `409` Conflict (no available tables, email already registered, duplicate
  table number)
- `422` Referenced menu item not found on this tenant
- `500` Unexpected server error
