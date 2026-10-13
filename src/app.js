const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('../openapi.json');
const authRoutes = require('./routes/authRoutes');
const publicRoutes = require('./routes/publicRoutes');
const protectedRoutes = require('./routes/protectedRoutes');

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

app.use('/auth', authRoutes);

app.use('/public', publicRoutes);
app.use('/protected', protectedRoutes);

app.get('/', (req, res) => {
	res.json(apiTask);
});

app.get('/health', (req, res) => {
	res.json(serverCondition);
});

app.use('/tasks', require('./routes/task.route'));

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

module.exports = app;
