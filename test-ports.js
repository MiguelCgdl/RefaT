require('dotenv').config();
const { Client } = require('pg');

async function test(port, pgbouncer = false) {
  const dbPassword = process.env.DB_PASSWORD;
  const dbUser = process.env.DB_USER || 'postgres';
  const dbHost = process.env.DB_HOST || 'localhost';
  const dbName = process.env.DB_NAME || 'postgres';
  
  if (!dbPassword) {
    console.error('ERROR: DB_PASSWORD environment variable must be set');
    console.error('For local development, create a .env file with this variable');
    process.exit(1);
  }
  
  const connStr = `postgresql://${dbUser}:${encodeURIComponent(dbPassword)}@${dbHost}:${port}/${dbName}${pgbouncer ? '?pgbouncer=true' : ''}`;

  console.log(`Testing Port ${port} ${pgbouncer ? '(Transaction)' : '(Session)'}...`);
  const client = new Client({
    connectionString: connStr,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
  });

  try {
    await client.connect();
    console.log(`SUCCESS on Port ${port}!`);
    await client.end();
    return true;
  } catch (err) {
    console.log(`FAILED on Port ${port}: ${err.message}`);
    return false;
  }
}

async function run() {
  // Try transaction mode first to see if it's not blocked
  await test(6543, true);
  // Try session mode
  await test(5432, false);
}

run();
