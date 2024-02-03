/** @format */
const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { StatusMessage } = require("../utils/statusMessage");
const config = require("config");
const { StatusCodes, ReasonPhrases } = require("http-status-codes");

const signup = async (req, res) => {
	/* 	#swagger.tags = ['Auth']
        #swagger.description = 'Endpoint to signup a specific user' */
	console.log(req.body);
	const { fullname, username, password, confirmPassword } = req.body;
	console.log(fullname);
	if (
		fullname == null ||
		username == null ||
		password == null ||
		confirmPassword == null ||
		fullname.length === 0 ||
		username.length === 0 ||
		password.length === 0 ||
		confirmPassword.length === 0
	) {
		return res.status(StatusCodes.NO_CONTENT).json({ message: StatusMessage.NO_CONTENT });
	}

	try {
		const user = await User.findOne({ username });
		if (user) {
			return res.status(400).json({ message: StatusMessage.USER_ALREADY_EXISTS });
		}

		if (password === confirmPassword) {
			const hashedPassword = await bcrypt.hash(password, 10);
			const newUser = new User({
				fullname,
				username,
				password: hashedPassword,
				created: Date.now(),
			});

			await newUser.save();
			res.status(201).json({ message: StatusMessage.SUCCESS });
		} else {
			res.status(401).json({ message: StatusMessage.INVALID_CREDENTIALS });
		}
	} catch (error) {
		res.status(500).json({ error: StatusMessage.INTERNAL_SERVER_ERROR });
	}
};

const signin = async (req, res) => {
	/* 	#swagger.tags = ['Auth']
        #swagger.description = 'Endpoint to signin a specific user' */
	const { username, password } = req.body;
	try {
		const response = await findUserWithPassword(username, password);
		await validateResponse(response, res);
	} catch (error) {
		res.status(500).json({ error: StatusMessage.INTERNAL_SERVER_ERROR });
	}
};

const findUserWithPassword = async (username, password) => {
	const user = await User.findOne({ username });

	if (user.isLocked()) {
		return user;
	}

	if (user.loginAttempts === config.get("security.maxLoginAttempts")) {
		user.resetLoginAttempts();
	}

	if (user) {
		const isValidPassword = await bcrypt.compare(password, user.password);
		// Reset login attempts on successful login

		if (!isValidPassword) {
			return handleFailedLogin(user);
		}
		user.resetLoginAttempts();
		return user;
	}
	return false;
};

const setCookies = (res, token) => {
	// Set the token as a cookie
	res.cookie("accesstoken", token, {
		httpOnly: true,
		// Add other cookie options as needed
	});
};

const handleFailedLogin = async (user) => {
	// Increment login attempts
	const result = await user.incrementLoginAttempts();
	// Check if login attempts exceed the limit
	if (user.isMaxLoginAttemptsExceeded()) {
		return await user.lockAccount();
	} else {
		return result;
	}
};

const validateResponse = (result, res) => {
	if (result instanceof User) {
		if (result.loginAttempts === 0) {
			const token = jwt.sign({ userId: result._id }, process.env.JWT_SECRET, {
				expiresIn: config.get("security.tokenexperiation"), // You can customize the expiration time
			});
			setCookies(res, token);
			res.status(200).json({ message: StatusMessage.SUCCESS, token });
		} else if (
			result.loginAttempts === config.get("security.maxLoginAttempts") ||
			result.loginAttempts > config.get("security.maxLoginAttempts")
		) {
			res.status(401).json({
				message: StatusMessage.ACCOUNT_LOCKED,
				attempts: result.loginAttempts,
			});
		} else if (result.loginAttempts > 0) {
			res.status(401).json({
				message: StatusMessage.INVALID_CREDENTIALS,
				attempts: result.loginAttempts,
			});
		}
	} else {
		return res.status(401).json({ error: StatusMessage.INVALID_CREDENTIALS });
	}
};

const simpleUserauthentication = async (username, password) => {
	const user = await User.findOne({ username });

	if (user) {
		const isValidPassword = await bcrypt.compare(password, user.password);
		if (isValidPassword) {
			return true;
		}
	}

	return false;
};

const verify = async (req, res) => {
	/* #swagger.ignore = true */
	const { token } = req.query;
	try {
		const decoded = await verifyToken(token);
		// If verification is successful, you can perform additional actions here
		res.json({ message: "Verification successful", user: decoded });
	} catch (error) {
		res.status(401).json({ error: "Invalid or expired token" });
	}
};

module.exports = { signin, signup, simpleUserauthentication, findUserWithPassword, verify };
