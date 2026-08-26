// src/app.js
// This file builds the Express application: middleware + routes.
// src/server.js is what actually starts it listening on a port.

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const pool = require('./config/db');
const logger = require('./utils/logger');
const authRoutes = require('./routes/auth.routes');
const listingsRoutes = require('./routes/listings.routes');
const adminRoutes = require('./routes/admin.routes');
const locationsRoutes = require('./routes/locations.routes');
const messagesRoutes = require('./routes/messages.routes');
const miscRoutes = require('./routes/misc.routes');
const favoritesRoutes = require('./routes/favorites.routes');
const paymentsRoutes = require('./routes/payments.routes');

const app = express();

// --- Global middleware ---
app.use(helmet({
  // Without this, browsers block <img> tags on the frontend (a different
  // origin/port) from loading images served from /uploads below.
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
app.use(cors());            // allows the React frontend to call this API
app.use(morgan('dev'));               // colorized request log in the terminal
app.use(morgan('combined', { stream: logger.stream })); // same requests, persisted to logs/app-*.log
app.use(express.json());    // parses JSON request bodies
app.use(express.urlencoded({ extended: true }));

// --- Serve uploaded images/documents ---
// e.g. a file saved as uploads/listings/abc.jpg becomes reachable at
// http://localhost:5000/uploads/listings/abc.jpg
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// --- Feature routes ---
app.use('/api/auth', authRoutes);
app.use('/api/listings', listingsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/locations', locationsRoutes);
app.use('/api/messages', messagesRoutes);
app.use('/api/favorites', favoritesRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api', miscRoutes); // contact, report, photo, password, sitemap, admin/reports

// --- Health check routes (useful to confirm the server + DB are alive) ---

// GET /api/health -> is the server running at all?
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'GW Land backend is running' });
});

// GET /api/health/db -> is the server able to talk to PostgreSQL?
app.get('/api/health/db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW() AS db_time');
    res.json({ status: 'ok', db_time: result.rows[0].db_time });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// --- 404 fallback for any route we haven't defined yet ---
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// --- Error handler ---
// Catches multer upload errors (file too big, wrong type) and anything
// else that gets passed to next(err), and returns clean JSON instead of
// crashing or showing a raw stack trace.
app.use((err, req, res, next) => {
  if (err.name === 'MulterError' || err.message?.includes('Only image files') || err.message?.includes('Documents must be')) {
    return res.status(400).json({ error: err.message });
  }
  logger.error(`Unhandled error: ${err.message}`, { stack: err.stack, path: req.path });
  res.status(500).json({ error: 'Something went wrong' });
});

module.exports = app;
