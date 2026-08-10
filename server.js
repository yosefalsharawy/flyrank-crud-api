const express = require('express');
const app = express();
const port = 3000;

const apiTask = {
	name: 'Task API',
	version: '1.0',
	endpoints: ['/', '/tasks', '/health'],
};

const serverCondition = {
	status: 'ok',
};

app.get('/', (req, res) => {
	res.json(apiTask);
});

app.get('/health', (req, res) => {
	res.json(serverCondition);
});

app.listen(port, () => {
	console.log(`Example app listening on port ${port}`);
});
