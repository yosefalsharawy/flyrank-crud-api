const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');

router.get('/profile', async (req, res) => {
	try {
		const authHeader = req.headers.authorization;

		// Check if Authorization header exists
		if (!authHeader) {
			return res.status(401).json({
				error: 'Access token required',
			});
		}

		const parts = authHeader.split(' ');

		// Validate Bearer token format
		if (parts.length !== 2 || parts[0] !== 'Bearer' || !parts[1]) {
			return res.status(401).json({
				error: 'Access token required',
			});
		}

		const token = parts[1];

		// Verify token with Supabase
		const { data, error } = await supabase.auth.getUser(token);

		if (error || !data?.user) {
			return res.status(401).json({
				error: 'Invalid or expired token',
			});
		}

		const user = data.user;

		return res.status(200).json({
			id: user.id,
			email: user.email,
			created_at: user.created_at,
		});
	} catch (error) {
		console.error('Profile verification failed:', error.message);

		return res.status(500).json({
			error: 'Internal server error',
		});
	}
});

module.exports = router;
