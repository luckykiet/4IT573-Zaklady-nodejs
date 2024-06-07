// @ts-nocheck
import { CONSTANTS } from '../../../config/constants.js';
import HttpError from '../../../http-error.js';
import Reservation from '../../../models/reservations.js';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import utils from '../../../utils.js';
import Tables from '../../../models/tables.js';
import Stores from '../../../models/stores.js';

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
		const now = dayjs();
		const query = {
			$or: [{ userId: req.user._id }, { email: req.user.email }],
		};

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
		const storeIds = new Set();
		const tableIds = new Set();

		const reservations = await Reservation.find(query)
			.sort({ createdAt: -1 })
			.limit(limitValue);

		reservations.map((reservation) => {
			if (!storeIds.has(reservation.storeId.toString())) {
				storeIds.add(reservation.storeId.toString());
			}

			if (!tableIds.has(reservation.tableId.toString())) {
				tableIds.add(reservation.tableId.toString());
			}
		});

		const tables = await Tables.find({ _id: { $in: Array.from(tableIds) } });
		const stores = await Stores.find({ _id: { $in: Array.from(storeIds) } });

		return res.json({ success: true, msg: { reservations, tables, stores } });
	} catch (error) {
		console.error(error);
		return next(new HttpError('srv_error', 500));
	}
};
