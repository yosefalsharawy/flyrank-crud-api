const {
	getAllTasks,
	getTaskById,
	createTask,
	updateTask,
	deleteTask,
} = require('../db/task.repository');

exports.getAllTasks = (req, res) => {
	const tasks = getAllTasks();
	res.status(200).json(tasks);
};

exports.getTaskById = (req, res) => {
	const { id } = req.params;
	const task = getTaskById(id);
	if (!task) {
		return res.status(404).json({ error: `Task not found` });
	}
	res.status(200).json(task);
};

exports.addTask = (req, res) => {
	const { title } = req.body;
	if (title === undefined || typeof title !== 'string' || title.trim() === '') {
		return res
			.status(400)
			.json({ error: `Title is required and must be a non-empty string` });
	}
	const task = createTask(title.trim());
	res.status(201).json(task);
};

exports.updateTask = (req, res) => {
	const { id } = req.params;
	const { title, done } = req.body;

	const hasTitle = req.body.hasOwnProperty('title');
	const hasDone = req.body.hasOwnProperty('done');

	if (!hasTitle && !hasDone) {
		return res.status(400).json({ error: `title or done are required` });
	}
	if (hasTitle && (typeof title !== 'string' || title.trim() === '')) {
		return res.status(400).json({ error: `Invalid title` });
	}
	if (hasDone && typeof done !== 'boolean') {
		return res.status(400).json({ error: `done is invalid` });
	}
	const task = getTaskById(id);

	if (!task) {
		return res.status(404).json({ error: 'task is not found' });
	}

	const newTitle = hasTitle ? title.trim() : task.title;
	const newDone = hasDone ? done : task.done;

	const updatedTask = updateTask(id, newTitle, newDone);

	res.status(200).json(updatedTask);
};

exports.deleteTask = (req, res) => {
	const { id } = req.params;
	const task = deleteTask(id);
	if (!task) {
		return res.status(404).json({ error: `task is not found` });
	}
	res.sendStatus(204);
};
