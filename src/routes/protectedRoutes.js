const express = require('express');
const router = express.Router();

router.get('/profile', (req, res) => {
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

	return res.status(200).json({
		message: 'Token received',
	});
});

module.exports = router;
