// src/config/db.js
// This file creates ONE shared connection pool to PostgreSQL.
// Every other file in the project will import `pool` from here
// instead of opening its own connection.

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

pool.on('error', (err) => {
  // This fires if a connection in the pool dies unexpectedly.
  // We log it instead of crashing the whole server.
  console.error('Unexpected PostgreSQL error:', err.message);
});

module.exports = pool;
