// @ts-nocheck
import { CONSTANTS } from '../../../config/constants.js';
import HttpError from '../../../http-error.js';
import Reservation from '../../../models/reservations.js';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import utils from '../../../utils.js';

dayjs.extend(utc);

/**
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
export const fetchReservationsOfUser = async (req, res, next) => {
	try {
		const { types, limit } = req.query;

		const validator = {
			types: false,
			limit: limit ? /^\d+$/ : false,
		};

		if (!utils.isValidRequest(validator, req.query)) {
			return next(new HttpError('srv_invalid_request', 400));
		}

		const limitValue =
			limit && !isNaN(parseInt(limit)) && parseInt(limit) > 0
				? parseInt(limit)
				: 50;

		const typesToFind = types && types.length > 0 ? types.split(';') : ['all'];
		typesToFind.map((type) => {
			if (!CONSTANTS.RESERVATION_FILTERS.includes(type)) {
				return next(new HttpError('srv_invalid_request', 400));
			}
		});
		const now = dayjs.utc();
		const query = { userId: req.user._id };

		if (!typesToFind.includes('all')) {
			const conditions = [];
			if (typesToFind.includes('incoming')) {
				conditions.push({ start: { $gte: now.toDate() } });
			}
			if (typesToFind.includes('expired')) {
				conditions.push({ end: { $lt: now.toDate() } });
			}
			if (typesToFind.includes('cancelled')) {
				conditions.push({ isCancelled: true });
			}
			if (conditions.length > 0) {
				query.$or = conditions;
			}
		}

		const reservations = await Reservation.find(query)
			.sort({ createdAt: -1 })
			.limit(limitValue);
		return res.json({ success: true, msg: reservations });
	} catch (error) {
		console.error(error);
		return next(new HttpError('srv_error', 500));
	}
};
