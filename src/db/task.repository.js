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

module.exports = {
	getAllTasks,
	getTaskById,
};
