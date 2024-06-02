// @ts-nocheck
import Store from '../../../models/stores.js';
import HttpError from '../../../http-error.js';
import mongoose from 'mongoose';
import Reservation from '../../../models/reservations.js';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import { CONSTANTS } from '../../../config/constants.js';
import utils from '../../../utils.js';
import Tables from '../../../models/tables.js';
import { sendCancelReservationTokenEmail } from '../../../mailer.js';

dayjs.extend(utc);

/**
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
export const fetchReservationsOfStore = async (req, res, next) => {
	try {
		const { storeId } = req.params;
		const { types, limit } = req.query;

		const validator = {
			types: false,
			limit: limit ? /^\d+$/ : false,
		};

		if (
			!storeId ||
			!mongoose.Types.ObjectId.isValid(storeId) ||
			!utils.isValidRequest(validator, req.query)
		) {
			return next(new HttpError('srv_invalid_request', 400));
		}

		const limitValue =
			limit && !isNaN(parseInt(limit)) && parseInt(limit) > 0
				? parseInt(limit)
				: 50;

		const store = await Store.findOne({ _id: storeId, userId: req.user._id });

		if (!store) {
			return next(new HttpError('srv_store_not_found', 404));
		}

		const typesToFind = types && types.length > 0 ? types.split(';') : ['all'];
		typesToFind.map((type) => {
			if (!CONSTANTS.RESERVATION_FILTERS.includes(type)) {
				return next(new HttpError('srv_invalid_request', 400));
			}
		});
		const now = dayjs.utc();
		const query = { storeId: store._id };

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

/**
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
export const fetchReservationsOfAllStores = async (req, res, next) => {
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

		const stores = await Store.find({ userId: req.user._id });
		const storeIds = stores.map((s) => s._id);

		const typesToFind = types && types.length > 0 ? types.split(';') : ['all'];
		typesToFind.map((type) => {
			if (!CONSTANTS.RESERVATION_FILTERS.includes(type)) {
				return next(new HttpError('srv_invalid_request', 400));
			}
		});
		const now = dayjs.utc();
		const query = { storeId: { $in: storeIds } };

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
		return res.json({ success: true, msg: { reservations, stores } });
	} catch (error) {
		console.error(error);
		return next(new HttpError('srv_error', 500));
	}
};

/**
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
export const updateCustomerReservation = async (req, res, next) => {
	try {
		//start YYYYMMDDHHmm
		//end YYYYMMDDHHmm
		const { reservationId, tableId, email, name, start, end, isCancelled } =
			req.body;

		const validator = {
			email: email ? utils.emailRegex : false,
			name: name ? /^.{3,100}$/ : false,
			start: start ? /^.{12}$/ : false,
			end: end ? /^.{12}$/ : false,
			tableId: tableId ? /^\w{24}$/ : false,
			reservationId: /^\w{24}$/,
			isCancelled:
				isCancelled !== undefined
					? utils.createEnumRegex(['true', 'false'])
					: false,
		};

		if (
			!reservationId ||
			!mongoose.Types.ObjectId.isValid(reservationId) ||
			!utils.isValidRequest(validator, req.body)
		) {
			return next(new HttpError('srv_invalid_request', 400));
		}

		const reservation = await Reservation.findById(reservationId);

		if (!reservation) {
			return next(new HttpError('srv_reservation_not_found', 404));
		}

		const store = await Store.findOne({
			_id: reservation.storeId,
			userId: req.user._id,
		});

		if (!store) {
			return next(new HttpError('srv_not_authorized', 403));
		}

		let table = await Tables.findOne({
			_id: reservation.tableId,
			storeId: store._id,
		});

		if (!table) {
			return next(new HttpError('srv_not_authorized', 403));
		}

		if (isCancelled === true) {
			reservation.isCancelled = true;
		} else {
			let newStart = dayjs.utc(reservation.start);
			let newEnd = dayjs.utc(reservation.end);

			if (start) {
				newStart = dayjs.utc(start, CONSTANTS.RESERVATION_TIME_FORMAT, true);
				if (!newStart.isValid()) {
					return next(new HttpError('srv_invalid_time', 400));
				}
			}
			if (end) {
				newEnd = dayjs.utc(end, CONSTANTS.RESERVATION_TIME_FORMAT, true);
				if (!newEnd.isValid()) {
					return next(new HttpError('srv_invalid_time', 400));
				}
			}

			if (!newEnd.isAfter(newStart)) {
				return next(new HttpError('srv_invalid_time', 400));
			}
			// check store open
			const dayOfWeek = newStart.day();

			const storeOpeningTime = store.openingTime[dayOfWeek];

			if (!storeOpeningTime || !storeOpeningTime.isOpen) {
				return next(new HttpError('srv_store_close', 400));
			}

			const timeStart = dayjs.utc(storeOpeningTime.start, 'HH:mm');
			const timeEnd = dayjs.utc(storeOpeningTime.end, 'HH:mm');

			const storeStartTime = newStart
				.clone()
				.set('hour', timeStart.hour())
				.set('minute', timeStart.minute());
			const storeEndTime = newStart
				.clone()
				.set('hour', timeEnd.hour())
				.set('minute', timeEnd.minute());

			if (
				(!newStart.isBetween(storeStartTime, storeEndTime) &&
					!newStart.isSame(storeStartTime)) ||
				(!newEnd.isBetween(storeStartTime, storeEndTime) &&
					!newEnd.isSame(storeEndTime))
			) {
				return next(new HttpError('srv_store_close', 400));
			}

			if (tableId || start || end) {
				// Check if there is an overlapping reservation for the same table
				const checkReservation = await Reservation.findOne({
					tableId: tableId || reservation.tableId,
					start: { $lt: newEnd.toDate() },
					end: { $gt: newStart.toDate() },
					_id: { $ne: reservation._id },
				});

				if (checkReservation) {
					return next(new HttpError('srv_reservation_exists', 409));
				}

				if (tableId) {
					table = await Tables.findById(tableId);
					if (!table || !table.isAvailable) {
						return next(new HttpError('srv_table_not_found', 404));
					}
					reservation.tableId = tableId;
				}
				if (start) reservation.start = newStart.toDate();
				if (end) reservation.end = newEnd.toDate();
			}

			if (email) {
				reservation.email = email;
			}
			if (name) {
				reservation.name = name;
			}
			if (isCancelled) {
				reservation.isCancelled = isCancelled;
			}
		}

		await reservation.save();

		if (process.env.NODE_ENV !== 'TEST') {
			try {
				await sendConfirmationEmail({
					email: reservation.email,
					reservation: {
						...reservation.toObject(),
						start: newStart.format('DD/MM/YYYY HH:mm'),
						end: newEnd.format('DD/MM/YYYY HH:mm'),
					},
					store,
					table,
				});
			} catch (error) {
				console.log(error);
			}
		}

		return res.json({
			success: true,
			msg: reservation,
		});
	} catch (error) {
		console.error(error);
		return next(new HttpError('srv_error', 500));
	}
};

/**
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
export const deleteReservation = async (req, res, next) => {
	try {
		const { reservationId } = req.params;

		if (!reservationId || !mongoose.Types.ObjectId.isValid(reservationId)) {
			return next(new HttpError('srv_invalid_request', 400));
		}

		const reservation = await Reservation.findById(reservationId);

		if (!reservation) {
			return next(new HttpError('srv_reservation_not_found', 404));
		}

		const store = await Store.findOne({
			_id: reservation.storeId,
			userId: req.user._id,
		});

		if (!store) {
			return next(new HttpError('srv_not_authorized', 403));
		}

		const table = await Tables.findOne({
			_id: reservation.tableId,
			storeId: store._id,
		});

		if (!table) {
			return next(new HttpError('srv_table_not_found', 404));
		}

		await Reservation.findByIdAndDelete(reservation._id);

		if (process.env.NODE_ENV !== 'TEST') {
			try {
				await sendCancellationEmail({
					email: reservation.email,
					reservation: {
						...reservation.toObject(),
						start: newStart.format('DD/MM/YYYY HH:mm'),
						end: newEnd.format('DD/MM/YYYY HH:mm'),
					},
					store,
					table,
				});
			} catch (error) {
				console.log(error);
			}
		}
		return res.json({ success: true, msg: 'srv_reservation_deleted' });
	} catch (error) {
		console.error(error);
		return next(new HttpError('srv_error', 500));
	}
};
