const app = require('./src/app');
const { initializeDatabase } = require('./src/db/database');
const supabase = require('./src/config/supabase');

const port = process.env.PORT || 3000;

const startServer = async () => {
	try {
		await initializeDatabase();

		app.listen(port, () => {
			console.log(`Server listening on port ${port}`);
			console.log('Supabase client initialized');
		});
	} catch (error) {
		console.error('Failed to initialize database:', error);
		process.exit(1);
	}
};

startServer();
