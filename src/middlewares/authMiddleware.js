const supabase = require('../config/supabase');

const authMiddleware = async (req, res, next) => {
	try {
		const authHeader = req.headers.authorization;

		if (!authHeader) {
			return res.status(401).json({
				error: 'Access token required',
			});
		}

		const parts = authHeader.split(' ');

		if (parts.length !== 2 || parts[0] !== 'Bearer' || !parts[1]) {
			return res.status(401).json({
				error: 'Access token required',
			});
		}

		const token = parts[1];

		const { data, error } = await supabase.auth.getUser(token);

		if (error || !data?.user) {
			return res.status(401).json({
				error: 'Invalid or expired token',
			});
		}

		// Store authenticated user on request
		req.user = data.user;
		req.accessToken = token;

		// Continue to the next middleware/handler
		next();
	} catch (error) {
		console.error('Authentication failed:', error.message);

		return res.status(500).json({
			error: 'Internal server error',
		});
	}
};

module.exports = authMiddleware;
