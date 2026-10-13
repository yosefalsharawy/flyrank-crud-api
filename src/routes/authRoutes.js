const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const { signup, login, logout } = require('../controllers/auth.controller');

router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', authMiddleware, logout);

module.exports = router;
