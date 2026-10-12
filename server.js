const app = require('./src/app');
const { initializeDatabase } = require('./src/db/database');

const port = 3000;

const startServer = async () => {
	try {
		await initializeDatabase();

		app.listen(port, () => {
			console.log(`Server listening on port ${port}`);
		});
	} catch (error) {
		console.error('Failed to initialize database:', error);
		process.exit(1);
	}
};

startServer();
