const db = require('./database');
const { pool } = require('./database');

const getAllTasks = async () => {
	const result = await pool.query('SELECT * FROM tasks ORDER BY id');

	return result.rows;
};

const getTaskById = async (id) => {
	const result = await pool.query('SELECT * FROM tasks WHERE id = $1', [id]);

	return result.rows[0];
};

const createTask = (title, done) => {
	const statement = db.prepare('INSERT INTO tasks (title,done) VALUES (?,?)');

	const result = statement.run(title, 0);
	return {
		id: Number(result.lastInsertRowid),
		title,
		done: false,
	};
};

const updateTask = (id, title, done) => {
	const statement = db.prepare(
		'UPDATE tasks SET title = ?, done = ? WHERE id = ?',
	);
	const result = statement.run(title, done ? 1 : 0, id);
	if (result.changes === 0) {
		return undefined;
	}

	return {
		id: Number(id),
		title,
		done: Boolean(done),
	};
};

const deleteTask = (id) => {
	const statement = db.prepare('DELETE FROM tasks WHERE id = ?');

	const result = statement.run(id);

	return result.changes > 0;
};

module.exports = {
	getAllTasks,
	getTaskById,
	createTask,
	updateTask,
	deleteTask,
};
