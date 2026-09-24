const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../.env') });

async function initDatabase() {
  const host = process.env.DB_HOST || '127.0.0.1';
  const port = parseInt(process.env.DB_PORT || '3306', 10);
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';
  const database = process.env.DB_NAME || 'microlend_db';

  console.log(`Connecting to MySQL server at ${host}:${port} as ${user}...`);

  try {
    // Initial connection to create database if not exists
    const connection = await mysql.createConnection({
      host,
      port,
      user,
      password,
      multipleStatements: true
    });

    console.log(`Creating database ${database} if it does not exist...`);
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    await connection.query(`USE \`${database}\`;`);

    const schemaSqlPath = path.join(__dirname, '../src/db/schema.sql');
    const schemaSql = fs.readFileSync(schemaSqlPath, 'utf8');

    console.log('Applying schema migrations from src/db/schema.sql...');
    await connection.query(schemaSql);
    console.log('Schema created successfully!');

    await connection.end();
  } catch (err) {
    console.error('Failed to initialize MySQL database:', err.message);
    console.log('\nNote: MicroLend will automatically fall back to its internal OLTP engine if MySQL is offline.');
    process.exit(0);
  }
}

initDatabase();
