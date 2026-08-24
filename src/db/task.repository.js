const { updateTask } = require('../controllers/task.controller');
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

module.exports = {
	getAllTasks,
	getTaskById,
	createTask,
};
