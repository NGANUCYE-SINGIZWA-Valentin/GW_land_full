// src/server.js
// This is the file you actually run: `npm run dev` or `node src/server.js`
// It loads environment variables, then starts the Express app from app.js.

require('dotenv').config();
const app = require('./app');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 5000;

// Without these, a crash only ever shows up in whatever terminal happened to
// be open at the time — nothing survives for a post-mortem.
process.on('uncaughtException', (err) => {
  logger.error(`Uncaught exception: ${err.message}`, { stack: err.stack });
});
process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled promise rejection', { reason: reason instanceof Error ? reason.stack : reason });
});

app.listen(PORT, () => {
  logger.info(`GW Land backend running on http://localhost:${PORT}`);
  console.log(`✅ GW Land backend running on http://localhost:${PORT}`);
  console.log(`   Try: http://localhost:${PORT}/api/health`);
  console.log(`   Try: http://localhost:${PORT}/api/health/db`);
});
