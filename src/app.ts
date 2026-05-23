import express, { Router } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import menuRoutes from './routes/menu.routes';
import reservationRoutes from './routes/reservation.routes';
import orderRoutes from './routes/order.routes';
import authRoutes from './routes/auth.routes';
import adminRoutes from './routes/admin.routes';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';
import { resolveTenant } from './middleware/tenant.middleware';
import { requireAuth } from './middleware/auth.middleware';

const app = express();

// ─── Security headers ─────────────────────────────────────────────────────────
app.use(helmet());

// ─── CORS ─────────────────────────────────────────────────────────────────────
const allowedOrigins = (process.env.ALLOWED_ORIGINS ?? 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error(`CORS: origin not allowed — ${origin}`));
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  }),
);

// ─── Body parsing ─────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── HTTP logging ─────────────────────────────────────────────────────────────
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── Auth (tenant comes from the JWT) ────────────────────────────────────────
app.use('/api/auth', authRoutes);

// ─── Admin (JWT-protected, tenant from req.user) ─────────────────────────────
app.use('/api/admin', requireAuth, adminRoutes);

// ─── Public customer flow (tenant comes from the :slug URL param) ────────────
const publicRouter = Router({ mergeParams: true });
publicRouter.use('/menu', menuRoutes);
publicRouter.use('/reservations', reservationRoutes);
publicRouter.use('/orders', orderRoutes);
app.use('/api/public/:slug', resolveTenant, publicRouter);

// ─── Error handling ───────────────────────────────────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
