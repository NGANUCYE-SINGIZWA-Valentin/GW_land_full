// src/utils/logger.js
//
// Persistent logging. Previously the app only logged to the console via
// morgan('dev') — useful while a terminal is open, but gone the moment the
// process restarts or the terminal scrolls. This writes app + access logs to
// daily-rotating files under logs/ (kept 14 days) so activity survives restarts
// and can actually be reviewed later.

const path = require('path');
const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');

const LOG_DIR = path.join(__dirname, '..', '..', 'logs');

const fileRotateTransport = new DailyRotateFile({
  dirname: LOG_DIR,
  filename: 'app-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  maxFiles: '14d',
});

const errorFileRotateTransport = new DailyRotateFile({
  dirname: LOG_DIR,
  filename: 'error-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  maxFiles: '30d',
  level: 'error',
});

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    fileRotateTransport,
    errorFileRotateTransport,
    new winston.transports.Console({
      format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
    }),
  ],
});

// A stream morgan can write HTTP access lines into, so they land in the same
// rotating files as everything else instead of only appearing in the terminal.
logger.stream = {
  write: (message) => logger.info(message.trim()),
};

module.exports = logger;
