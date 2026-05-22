require('dotenv').config();
const { Client } = require('pg');

async function test(password) {
  const client = new Client({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'postgres',
    password: password,
    port: parseInt(process.env.DB_PORT || '5432'),
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
  });
  try {
    await client.connect();
    console.log(`Connection successful`);
    await client.end();
    return true;
  } catch (err) {
    console.log(`Connection failed: ${err.message}`);
    return false;
  }
}

async function run() {
  const dbPassword = process.env.DB_PASSWORD;
  
  if (!dbPassword) {
    console.error('ERROR: DB_PASSWORD environment variable must be set');
    console.error('For local development, create a .env file with this variable');
    process.exit(1);
  }
  
  console.log('Testing database connection...');
  const success = await test(dbPassword);
  
  if (success) {
    console.log('Database connection test completed successfully');
    process.exit(0);
  } else {
    console.error('Database connection test failed');
    process.exit(1);
  }
}

run();
