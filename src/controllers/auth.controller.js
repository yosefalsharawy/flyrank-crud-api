const supabase = require('../config/supabase');

const signup = async (req, res) => {
	try {
		const { email, password } = req.body;

		if (!email || !password) {
			return res.status(400).json({
				error: 'Email and password are required',
			});
		}

		const { data, error } = await supabase.auth.signUp({
			email,
			password,
		});

		if (error) {
			return res.status(400).json({
				error: error.message,
			});
		}

		return res.status(201).json({
			user: data.user,
		});
	} catch (error) {
		return res.status(500).json({
			error: 'Internal server error',
		});
	}
};

const login = async (req, res) => {
	try {
		const { email, password } = req.body;

		if (!email || !password) {
			return res.status(400).json({
				error: 'Email and password are required',
			});
		}

		const { data, error } = await supabase.auth.signInWithPassword({
			email,
			password,
		});

		if (error) {
			return res.status(401).json({
				error: 'Invalid login credentials',
			});
		}

		return res.status(200).json({
			access_token: data.session.access_token,
			refresh_token: data.session.refresh_token,
		});
	} catch (error) {
		return res.status(500).json({
			error: 'Internal server error',
		});
	}
};

module.exports = { signup, login };
