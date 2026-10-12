const { pool } = require('./database');

const getAllTasks = async () => {
	const result = await pool.query('SELECT * FROM tasks ORDER BY id');
	return result.rows;
};

const getTaskById = async (id) => {
	const result = await pool.query('SELECT * FROM tasks WHERE id = $1', [id]);
	return result.rows[0];
};

const createTask = async (title, done = false) => {
	const result = await pool.query(
		'INSERT INTO tasks (title, done) VALUES ($1, $2) RETURNING *',
		[title, done],
	);

	return result.rows[0];
};

const updateTask = async (id, title, done) => {
	const result = await pool.query(
		'UPDATE tasks SET title = $1, done = $2 WHERE id = $3 RETURNING *',
		[title, done, id],
	);

	return result.rows[0];
};

const deleteTask = async (id) => {
	const result = await pool.query('DELETE FROM tasks WHERE id = $1', [id]);

	return result.rowCount > 0;
};

module.exports = {
	getAllTasks,
	getTaskById,
	createTask,
	updateTask,
	deleteTask,
};
