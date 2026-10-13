const express = require('express');
const router = express.Router();

const authMiddleware = require('../middlewares/authMiddleware');

// Protected profile
router.get('/profile', authMiddleware, (req, res) => {
	const user = req.user;

	return res.status(200).json({
		id: user.id,
		email: user.email,
		created_at: user.created_at,
	});
});

// Protected dashboard
router.get('/dashboard', authMiddleware, (req, res) => {
	return res.status(200).json({
		message: 'Welcome to your dashboard',
		user: {
			id: req.user.id,
			email: req.user.email,
		},
	});
});

module.exports = router;
