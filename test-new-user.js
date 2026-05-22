require('dotenv').config();
const { Client } = require('pg');

async function test() {
  const dbUser = process.env.DB_USER || 'postgres';
  const dbPassword = process.env.DB_PASSWORD;
  const dbHost = process.env.DB_HOST || 'localhost';
  const dbPort = process.env.DB_PORT || '5432';
  const dbName = process.env.DB_NAME || 'postgres';
  const dbSsl = process.env.DB_SSL === 'true';
  
  if (!dbPassword) {
    console.error('ERROR: DB_PASSWORD environment variable must be set');
    console.error('For local development, create a .env file with this variable');
    process.exit(1);
  }
  
  console.log(`Testing connection with user: ${dbUser}...`);
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  const client = new Client({
    user: dbUser,
    password: dbPassword,
    host: dbHost,
    port: parseInt(dbPort),
    database: dbName,
    ssl: dbSsl
  });

  try {
    await client.connect();
    console.log('SUCCESS! Connection established.');
    const res = await client.query('SELECT NOW()');
    console.log('Database time:', res.rows[0].now);
    await client.end();
  } catch (err) {
    console.error('FAILED connection:', err.message);
    process.exit(1);
  }
}

test();
