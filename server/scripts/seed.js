'use strict';
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

async function run() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    multipleStatements: true
  });

  const schema = fs.readFileSync(path.join(__dirname, '..', 'sql', '001_schema.sql'), 'utf8');
  const seed = fs.readFileSync(path.join(__dirname, '..', 'sql', '002_seed.sql'), 'utf8');

  console.log('Applying schema...');
  await conn.query(schema);
  console.log('Seeding data...');
  await conn.query(seed);
  await conn.end();
  console.log('Seed completed');
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});


