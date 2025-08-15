'use strict';
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: Number(process.env.DB_CONN_LIMIT || 10),
  namedPlaceholders: true,
  timezone: 'Z'
});

// quick connectivity check (non-blocking)
pool
  .getConnection()
  .then((conn) =>
    conn
      .ping()
      .then(() => console.log('MySQL pool connected'))
      .catch((err) => console.warn('MySQL ping failed:', err?.message))
      .finally(() => conn.release())
  )
  .catch(() => {});

module.exports = pool;


