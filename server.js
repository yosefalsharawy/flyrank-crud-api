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

app.listen(port, () => {
	console.log(`Example app listening on port ${port}`);
});
