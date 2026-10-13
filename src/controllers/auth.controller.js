const supabase = require('../config/supabase');
const { createClient } = require('@supabase/supabase-js');

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

const logout = async (req, res) => {
	try {
		const userClient = createClient(
			process.env.SUPABASE_URL,
			process.env.SUPABASE_KEY,
			{
				auth: {
					persistSession: false,
					autoRefreshToken: false,
					detectSessionInUrl: false,
				},
				global: {
					headers: {
						Authorization: `Bearer ${req.accessToken}`,
					},
				},
			},
		);

		const { error } = await userClient.auth.signOut({
			scope: 'global',
		});

		if (error) {
			console.error('Logout failed:', error.message);
			return res.status(500).json({
				error: 'Logout failed',
			});
		}

		return res.status(204).send();
	} catch (error) {
		console.error('Logout failed:', error.message);
		return res.status(500).json({
			error: 'Internal server error',
		});
	}
};

module.exports = { signup, login, logout };
