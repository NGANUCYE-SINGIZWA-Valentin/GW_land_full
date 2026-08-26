import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

// Express routes and utilities (CommonJS in server/)
const pool = require('./server/config/db');
const logger = require('./server/utils/logger');
const authRoutes = require('./server/routes/auth.routes');
const listingsRoutes = require('./server/routes/listings.routes');
const adminRoutes = require('./server/routes/admin.routes');
const locationsRoutes = require('./server/routes/locations.routes');
const messagesRoutes = require('./server/routes/messages.routes');
const miscRoutes = require('./server/routes/misc.routes');
const favoritesRoutes = require('./server/routes/favorites.routes');
const paymentsRoutes = require('./server/routes/payments.routes');

async function startServer() {
  const app = express();
  const PORT = 3000;

  // --- Security & Parsing Middleware ---
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      crossOriginEmbedderPolicy: false,
    })
  );
  app.use(cors());
  app.use(morgan('dev'));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // --- Static Uploads ---
  const uploadsDir = path.join(process.cwd(), 'uploads');
  app.use('/uploads', express.static(uploadsDir));

  // --- API Routes ---
  app.use('/api/auth', authRoutes);
  app.use('/api/listings', listingsRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/locations', locationsRoutes);
  app.use('/api/messages', messagesRoutes);
  app.use('/api/favorites', favoritesRoutes);
  app.use('/api/payments', paymentsRoutes);
  app.use('/api', miscRoutes);

  // Health checks
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'GW Land backend is running on port 3000' });
  });

  app.get('/api/health/db', async (req, res) => {
    try {
      const result = await pool.query('SELECT NOW() AS db_time');
      res.json({ status: 'ok', db_time: result.rows[0]?.db_time });
    } catch (err: any) {
      res.status(500).json({ status: 'error', message: err.message });
    }
  });

  // --- Frontend Middleware (Vite dev mode vs Production static) ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true, host: '0.0.0.0', port: 3000 },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // --- Error handler ---
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (err.name === 'MulterError' || err.message?.includes('Only image files') || err.message?.includes('Documents must be')) {
      return res.status(400).json({ error: err.message });
    }
    logger.error(`Unhandled error: ${err.message}`, { stack: err.stack, path: req.path });
    res.status(500).json({ error: 'Internal server error' });
  });

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 GW Land Platform running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
