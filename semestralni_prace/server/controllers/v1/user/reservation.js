// @ts-nocheck
import HttpError from '../../../http-error.js';
import Reservation from '../../../models/reservations.js';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';

dayjs.extend(utc);

const reservationsTypes = ['all', 'incoming', 'expired', 'cancelled'];

/**
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
export const fetchReservationsOfUser = async (req, res, next) => {
	try {
		const { types, limit } = req.params;

		const limitValue =
			limit && !isNaN(parseInt(limit)) && parseInt(limit) > 0
				? parseInt(limit)
				: 50;

		const typesToFind = types.split(';');
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
			query.$or = conditions;
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
