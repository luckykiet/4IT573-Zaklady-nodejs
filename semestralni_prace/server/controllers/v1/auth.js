// @ts-nocheck
import HttpError from '../../http-error.js';
import utils from '../../utils.js';
import { ROLES } from '../../config/roles.js';
import bcrypt from 'bcryptjs';
import Users from '../../models/users.js';

/**
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
export const registerUser = async (req, res, next) => {
	try {
		const validator = {
			email: utils.emailRegex,
			password: /^.{6,128}$/,
			name: /^.{3,100}$/,
			role: utils.createEnumRegex(ROLES),
		};

		if (!utils.isValidRequest(validator, req.body)) {
			return next(new HttpError('srv_invalid_request', 400));
		}
		const { email, name, password, role } = req.body;

		if (
			role === 'admin' &&
			req.isAuthenticated() &&
			req.user.role !== 'admin'
		) {
			return next(new HttpError('srv_no_privilleges', 403));
		}

		const foundUser = await Users.findOne({ email });

		if (foundUser) {
			return next(new HttpError('srv_duplicate', 409));
		}

		const hashedPassword = await bcrypt.hash(password, 10);

		const newUser = new Users({
			email,
			name,
			password: hashedPassword,
			role,
		});
		await newUser.save();

		req.login(newUser, function (err) {
			if (err) {
				return next(new HttpError('srv_log_in_failed', 500));
			}

			return res.json({
				success: true,
				msg: {
					isAuthenticated: true,
					email: req.user.email,
					name: req.user.name,
					role: req.user.role,
				},
			});
		});
	} catch (error) {
		console.log(error);
		return next(new HttpError('srv_register_failed', 500));
	}
};

/**
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
export const login = (req, res) => {
	return res.json({
		success: true,
		msg: {
			isAuthenticated: req.isAuthenticated(),
			email: req.user.email,
			name: req.user.name,
			role: req.user.role,
		},
	});
};

/**
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
export const checkIsAuthenticated = (req, res) => {
	try {
		if (!req.isAuthenticated()) {
			return res.json({ success: false, msg: 'srv_not_logged_in' });
		}
		return res.json({
			isAuthenticated: req.isAuthenticated(),
			email: req.user.email,
			name: req.user.name,
			role: req.user.role,
		});
	} catch (error) {
		console.error(error);
		return res.json({ success: false, msg: 'srv_failed_to_check' });
	}
};

/**
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
export const signout = (req, res, next) => {
	try {
		if (!req.isAuthenticated()) {
			return res.json({ success: false, msg: 'srv_not_logged_in' });
		}
		req.logout((err) => {
			if (err) {
				return next(err);
			}
			req.session.destroy(() => {
				res.json({ success: true });
			});
		});
	} catch (error) {
		console.error(error);
		return res.json({ success: false, msg: 'srv_failed_to_check' });
	}
};
