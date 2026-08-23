const path = require('path');
const Database = require('better-sqlite3');

const dbPath = path.join(__dirname, 'tasks.db');
const db = new Database(dbPath);

console.log('Connected to SQLite database:', dbPath);

db.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY,
        title TEXT NOT NULL,
        done INTEGER NOT NULL DEFAULT 0
    )
`);

const row = db.prepare('SELECT COUNT(*) AS count FROM tasks').get();

if (row.count === 0) {
	const insert = db.prepare(`
        INSERT INTO tasks (title, done)
        VALUES (?, ?)
    `);

	const seedTasks = [
		['task 1 implementation', 1],
		['task 2 implementation', 0],
		['task 3 implementation', 1],
	];

	for (const [title, done] of seedTasks) {
		insert.run(title, done);
	}

	console.log('Seeded 3 tasks.');
}

module.exports = db;
