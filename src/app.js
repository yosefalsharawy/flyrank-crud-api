const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('../openapi.json');
const app = express();

const apiTask = {
	name: 'Task API',
	version: '1.0',
	endpoints: ['/', '/tasks', '/health'],
};

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

app.use('/tasks', require('./routes/task.route'));

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

module.exports = app;
