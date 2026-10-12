const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const initializeDatabase = async () => {
  // 1. Check database connection
  await pool.query('SELECT 1');

  console.log('Connected to PostgreSQL database');

  // 2. Create tasks table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS tasks (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      done BOOLEAN NOT NULL DEFAULT FALSE
    )
  `);

  // 3. Check existing tasks
  const result = await pool.query(
    'SELECT COUNT(*) AS count FROM tasks'
  );

  // 4. Seed only if table is empty
  if (Number(result.rows[0].count) === 0) {
    await pool.query(`
      INSERT INTO tasks (title, done)
      VALUES
        ('task 1 implementation', TRUE),
        ('task 2 implementation', FALSE),
        ('task 3 implementation', TRUE)
    `);

    console.log('Seeded 3 tasks.');
  }

  console.log('Database initialized successfully.');
};

module.exports = {
  pool,
  initializeDatabase,
};
