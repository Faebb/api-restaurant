# Kaizen Fusion API - cURL Commands

## Health Check

```bash
curl http://localhost:3000/health
```

**Response expected:**
```json
{"status":"ok","timestamp":"..."}
```

---

## Menu

### Get all menu categories with items

```bash
curl http://localhost:3000/api/menu
```

### Get menu item by ID

```bash
curl http://localhost:3000/api/menu/items/1
```

---

## Reservations

### Assign a table

```bash
curl -X POST http://localhost:3000/api/reservations \
  -H "Content-Type: application/json" \
  -d '{"guests": 4}'
```

---

## Orders

### Create an order with cart + customer data

```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customer": {
      "name": "John Doe",
      "email": "john@example.com"
    },
    "items": [
      {"menuItemId": 1, "quantity": 2},
      {"menuItemId": 3, "quantity": 1}
    ]
  }'
```

### Get order by ID

```bash
curl http://localhost:3000/api/orders/1
```
