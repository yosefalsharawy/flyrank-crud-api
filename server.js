const express = require('express');
const app = express();
const port = 3000;

const apiTask = {
	name: 'Task API',
	version: '1.0',
	endpoints: ['/', '/tasks', '/health'],
};

const tasks = [
	{
		id: 1,
		title: 'task 1 implementation',
		done: true,
	},
	{
		id: 2,
		title: 'task 2 implementation',
		done: false,
	},
	{
		id: 3,
		title: 'task 3 implementation',
		done: true,
	},
];

const serverCondition = {
	status: 'ok',
};

app.use(express.json());

app.get('/', (req, res) => {
	res.json(apiTask);
});

app.get('/health', (req, res) => {
	res.json(serverCondition);
});

app.get('/tasks', (req, res) => {
	res.status(200).json(tasks);
});

app.get('/tasks/:id', (req, res) => {
	const { id } = req.params;
	const task = tasks.find((elem) => elem.id.toString() === id);
	if (task === undefined) {
		return res.status(404).json({ error: `Task not found` });
	}
	res.status(200).json(task);
});

app.post('/tasks', (req, res) => {
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
});

app.listen(port, () => {
	console.log(`Example app listening on port ${port}`);
});
