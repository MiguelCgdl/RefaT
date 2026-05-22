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
  
  const encodedPassword = encodeURIComponent(dbPassword);
  const connectionString = `postgresql://${dbUser}:${encodedPassword}@${dbHost}:${dbPort}/${dbName}?sslmode=${dbSsl ? 'require' : 'disable'}`;
  
  console.log('Testing database connection...');
  
  const client = new Client({
    connectionString: connectionString,
    ssl: dbSsl ? { rejectUnauthorized: false } : false
  });

  try {
    await client.connect();
    console.log('Connected successfully');
    const res = await client.query('SELECT NOW()');
    console.log('Query result:', res.rows[0]);
    await client.end();
  } catch (err) {
    console.error('Connection error:', err.message);
    process.exit(1);
  }
}

test();
