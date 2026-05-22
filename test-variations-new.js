require('dotenv').config();
const { Client } = require('pg');

async function test() {
  const dbPassword = process.env.DB_PASSWORD;
  
  if (!dbPassword) {
    console.error('ERROR: DB_PASSWORD environment variable must be set');
    console.error('For local development, create a .env file with this variable');
    process.exit(1);
  }
  
  const users = [
    process.env.DB_USER || 'postgres',
    'postgres'
  ];
  const dbs = [
    process.env.DB_NAME || 'postgres',
    'postgres'
  ];

  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

  for (const user of users) {
    for (const db of dbs) {
      console.log(`Testing with USER: ${user} and DB: ${db}...`);
      const client = new Client({
        user: user,
        password: dbPassword,
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        database: db,
        ssl: process.env.DB_SSL === 'true'
      });

      try {
        await client.connect();
        console.log(`SUCCESS! User: ${user}, DB: ${db}`);
        await client.end();
        return;
      } catch (err) {
        console.log(`FAILED: ${err.message}`);
      }
    }
  }
  
  console.error('All connection attempts failed');
  process.exit(1);
}

test();
