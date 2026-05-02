# Kaizen Fusion API

REST API para el restaurante Kaizen Fusion. Construida con **Node.js + Express + TypeScript + Prisma ORM + MySQL**.

---

## Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/health` | Health check |
| GET | `/api/menu` | Todas las categorías con ítems |
| GET | `/api/menu/items/:id` | Ítem de menú por ID |
| POST | `/api/reservations` | Asignar mesa `{ guests: number }` |
| POST | `/api/orders` | Crear orden con carrito + datos del cliente |
| GET | `/api/orders/:id` | Consultar orden por ID |

---

## Requisitos previos

- Node.js ≥ 18
- MySQL 8+ corriendo localmente (el mismo que usa MySQL Workbench)

---

## Paso 1 — Crear la base de datos en MySQL Workbench

Abre MySQL Workbench, conecta a tu servidor local y ejecuta:

```sql
CREATE DATABASE kaizen_fusion
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
```

---

## Paso 2 — Configurar variables de entorno

```bash
cd kaizen-fusion-api
cp .env.example .env
```

Edita `.env` y pon tus credenciales reales de MySQL:

```env
DATABASE_URL="mysql://root:TU_PASSWORD@127.0.0.1:3306/kaizen_fusion"
```

> Las credenciales **nunca** deben estar escritas en el código — solo en `.env`.
> Asegúrate de que `.env` esté en `.gitignore` (ya está incluido).

---

## Paso 3 — Instalar dependencias y preparar la BD

```bash
npm install

# Crea las tablas (ejecuta las migraciones de Prisma)
npm run db:migrate

# Carga el menú completo con datos iniciales
npm run db:seed
```

Después del seed, puedes verificar los datos directamente en MySQL Workbench
abriendo las tablas `menu_categories` y `menu_items` de la base `kaizen_fusion`.

---

## Paso 4 — Arrancar el servidor

```bash
npm run dev
```

La API estará en `http://localhost:3000`. Prueba el health check:

```bash
curl http://localhost:3000/health
# → {"status":"ok","timestamp":"..."}
```

---

## Scripts disponibles

```bash
npm run dev              # Servidor con hot-reload (desarrollo)
npm run build            # Compila TypeScript → dist/
npm run start            # Ejecuta el build compilado (producción)
npm run db:migrate       # Aplica migraciones (crea/modifica tablas)
npm run db:migrate:prod  # Aplica migraciones en producción (sin prompts)
npm run db:seed          # Inserta datos iniciales (menú + mesas)
npm run db:studio        # Abre Prisma Studio — GUI visual de la BD
npm run db:reset         # Borra todo y vuelve a hacer seed (dev only)
```

---

## Conectar el frontend

En el `.env` del frontend (`kaizen-fusion-main`), cambia:

```env
VITE_API_KAIZEN=http://localhost:3000
```

Luego reemplaza los mocks en los servicios del frontend:

```ts
// src/features/menu/services/menu-service.ts
import { httpClient } from '@/services'

export const getMenuService = async () => {
  const { data } = await httpClient.get('/api/menu')
  return data.data
}

// src/features/reservation/services/reservation-service.ts
export const assignTableService = async (body: ReservationRequestType) => {
  const { data } = await httpClient.post('/api/reservations', body)
  return data.data
}

// src/features/payment/hooks/use-checkout-form.ts — en onSubmit:
export const createOrderService = async (body: CreateOrderDTO) => {
  const { data } = await httpClient.post('/api/orders', body)
  return data.data
}
```

---

## Despliegue en producción (sin Docker)

### Railway (recomendado — tier gratuito disponible)

1. Sube la carpeta `kaizen-fusion-api` a un repositorio GitHub.
2. En [railway.app](https://railway.app) → New Project → Deploy from GitHub.
3. Agrega un plugin **MySQL** desde el dashboard de Railway.
4. Configura las variables de entorno:
   ```
   DATABASE_URL=mysql://...  ← Railway lo provee automáticamente
   ALLOWED_ORIGINS=https://tu-frontend.vercel.app
   NODE_ENV=production
   ```
5. Railway detecta el `package.json` y despliega automáticamente.

### Render

1. Sube a GitHub.
2. En [render.com](https://render.com) → New → Web Service.
3. Configura:
   - **Build Command:** `npm install && npx prisma generate && npm run build`
   - **Start Command:** `npx prisma migrate deploy && node dist/server.js`
4. Agrega variables de entorno en el dashboard.

---

## Estructura del proyecto

```
kaizen-fusion-api/
├── prisma/
│   ├── schema.prisma      # Schema MySQL con tipos explícitos
│   └── seed.ts            # Datos iniciales (menú + mesas)
├── src/
│   ├── config/
│   │   └── database.ts    # Prisma client (singleton)
│   ├── controllers/       # Manejo de requests HTTP
│   ├── middleware/        # Validación (Zod) + error handler
│   ├── routes/            # Routers de Express
│   ├── schemas/           # Schemas Zod por endpoint
│   ├── services/          # Lógica de negocio + acceso a BD
│   ├── types/             # Tipos TypeScript compartidos
│   ├── app.ts             # Configuración de Express
│   └── server.ts          # Entry point + graceful shutdown
├── .env                   # Variables locales (no subir a git)
├── .env.example           # Plantilla de variables
└── tsconfig.json
```
