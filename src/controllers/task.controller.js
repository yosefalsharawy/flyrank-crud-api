const tasks = require('../db/task.repository');

exports.getAllTasks = (req, res) => {
	res.status(200).json(tasks);
};

exports.getTaskById = (req, res) => {
	const { id } = req.params;
	const task = tasks.find((elem) => elem.id.toString() === id);
	if (task === undefined) {
		return res.status(404).json({ error: `Task not found` });
	}
	res.status(200).json(task);
};

exports.addTask = (req, res) => {
	const maxId = tasks.reduce((max, task) => Math.max(max, task.id), 0);
	const id = maxId + 1;
	const { title } = req.body;
	if (title === undefined || typeof title !== 'string' || title.trim() === '') {
		return res
			.status(400)
			.json({ error: `Title is required and must be a non-empty string` });
	}
	const newTask = {
		id,
		title,
		done: false,
	};
	tasks.push(newTask);
	res.status(201).json(newTask);
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
	const task = tasks.find((elem) => elem.id.toString() === id);
	if (!task) {
		return res.status(404).json({ error: `task is not found` });
	}
	if (hasTitle) task.title = title.trim();
	if (hasDone) task.done = done;

	res.status(200).json(task);
};

exports.deleteTask = (req, res) => {
	const { id } = req.params;
	const taskIndex = tasks.findIndex((elem) => elem.id.toString() === id);
	if (taskIndex === -1) {
		return res.status(404).json({ error: `task is not found` });
	}
	tasks.splice(taskIndex, 1);
	res.sendStatus(204);
};
