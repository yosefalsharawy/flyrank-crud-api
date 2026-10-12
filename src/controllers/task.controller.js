const {
	getAllTasks,
	getTaskById,
	createTask,
	updateTask,
	deleteTask,
} = require('../db/task.repository');

exports.getAllTasks = async (req, res) => {
	try {
		const tasks = await getAllTasks();
		return res.status(200).json(tasks);
	} catch (error) {
		console.error(error);
		return res.status(500).json({ error: 'Internal server error' });
	}
};

exports.getTaskById = async (req, res) => {
	try {
		const { id } = req.params;
		const task = await getTaskById(id);

		if (!task) {
			return res.status(404).json({ error: 'Task not found' });
		}

		return res.status(200).json(task);
	} catch (error) {
		console.error(error);
		return res.status(500).json({ error: 'Internal server error' });
	}
};

exports.addTask = async (req, res) => {
	try {
		const { title } = req.body;

		if (
			title === undefined ||
			typeof title !== 'string' ||
			title.trim() === ''
		) {
			return res.status(400).json({
				error: 'Title is required and must be a non-empty string',
			});
		}

		const task = await createTask(title.trim());

		return res.status(201).json(task);
	} catch (error) {
		console.error(error);
		return res.status(500).json({ error: 'Internal server error' });
	}
};

exports.updateTask = async (req, res) => {
	try {
		const { id } = req.params;
		const { title, done } = req.body;

		const hasTitle = Object.prototype.hasOwnProperty.call(req.body, 'title');
		const hasDone = Object.prototype.hasOwnProperty.call(req.body, 'done');

		if (!hasTitle && !hasDone) {
			return res.status(400).json({
				error: 'title or done are required',
			});
		}

		if (hasTitle && (typeof title !== 'string' || title.trim() === '')) {
			return res.status(400).json({ error: 'Invalid title' });
		}

		if (hasDone && typeof done !== 'boolean') {
			return res.status(400).json({ error: 'done is invalid' });
		}

		const task = await getTaskById(id);

		if (!task) {
			return res.status(404).json({ error: 'task is not found' });
		}

		const newTitle = hasTitle ? title.trim() : task.title;
		const newDone = hasDone ? done : task.done;

		const updatedTask = await updateTask(id, newTitle, newDone);

		return res.status(200).json(updatedTask);
	} catch (error) {
		console.error(error);
		return res.status(500).json({ error: 'Internal server error' });
	}
};

exports.deleteTask = async (req, res) => {
	try {
		const { id } = req.params;

		const deleted = await deleteTask(id);

		if (!deleted) {
			return res.status(404).json({ error: 'task is not found' });
		}

		return res.status(204).send();
	} catch (error) {
		console.error(error);
		return res.status(500).json({ error: 'Internal server error' });
	}
};
