const db = require('./database');

const getAllTasks = () => {
	const statement = db.prepare('SELECT * FROM tasks');
	const tasks = statement.all();

	return tasks.map((task) => ({
		...task,
		done: Boolean(task.done),
	}));
};

const getTaskById = (id) => {
	const statement = db.prepare('SELECT * FROM tasks WHERE id = ?');

	const task = statement.get(id);

	if (!task) {
		return undefined;
	}

	return {
		...task,
		done: Boolean(task.done),
	};
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
