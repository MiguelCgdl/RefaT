require('dotenv').config();
const { Client } = require('pg');

const dbUser = process.env.DB_USER || 'postgres';
const dbPassword = process.env.DB_PASSWORD;
const dbHost = process.env.DB_HOST || 'localhost';
const dbPort = parseInt(process.env.DB_PORT || '5432');
const dbName = process.env.DB_NAME || 'postgres';
const dbSsl = process.env.DB_SSL === 'true';

if (!dbPassword) {
  console.error('ERROR: DB_PASSWORD environment variable must be set');
  console.error('For local development, create a .env file with this variable');
  process.exit(1);
}

const client = new Client({
  user: dbUser,
  host: dbHost,
  database: dbName,
  password: dbPassword,
  port: dbPort,
  ssl: dbSsl ? { rejectUnauthorized: false } : false
});

async function test() {
  try {
    console.log('Testing database connection...');
    await client.connect();
    console.log('Connected successfully!');
    await client.end();
  } catch (err) {
    console.error('Connection error:', err.message);
    process.exit(1);
  }
}

test();
