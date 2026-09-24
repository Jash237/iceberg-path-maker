const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../.env') });

async function seedDatabase() {
  const host = process.env.DB_HOST || '127.0.0.1';
  const port = parseInt(process.env.DB_PORT || '3306', 10);
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';
  const database = process.env.DB_NAME || 'microlend_db';

  console.log(`Connecting to MySQL database ${database} at ${host}:${port}...`);

  try {
    const connection = await mysql.createConnection({
      host,
      port,
      user,
      password,
      database,
      multipleStatements: true
    });

    const seedSqlPath = path.join(__dirname, '../src/db/seed.sql');
    const seedSql = fs.readFileSync(seedSqlPath, 'utf8');

    console.log('Seeding initial data from src/db/seed.sql...');
    await connection.query(seedSql);
    console.log('Database seeded successfully!');

    await connection.end();
  } catch (err) {
    console.error('Failed to seed MySQL database:', err.message);
    process.exit(0);
  }
}

seedDatabase();
