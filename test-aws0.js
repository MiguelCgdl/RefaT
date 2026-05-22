require('dotenv').config();
const { Client } = require('pg');

async function test() {
  const dbPassword = process.env.DB_PASSWORD;
  const dbUser = process.env.DB_USER || 'postgres';
  const dbHost = process.env.DB_HOST || 'localhost';
  const dbName = process.env.DB_NAME || 'postgres';
  
  if (!dbPassword) {
    console.error('ERROR: DB_PASSWORD environment variable must be set');
    console.error('For local development, create a .env file with this variable');
    process.exit(1);
  }
  
  const connStr = `postgresql://${dbUser}:${encodeURIComponent(dbPassword)}@${dbHost}:5432/${dbName}`;

  console.log(`Testing database connection...`);
  const client = new Client({
    connectionString: connStr,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
  });

  try {
    await client.connect();
    console.log(`SUCCESS! Connection established`);
    await client.end();
  } catch (err) {
    console.log(`FAILED: ${err.message}`);
    process.exit(1);
  }
}

test();
