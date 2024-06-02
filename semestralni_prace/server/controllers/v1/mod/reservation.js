// @ts-nocheck
import Store from '../../../models/stores.js';
import HttpError from '../../../http-error.js';
import mongoose from 'mongoose';
import Reservation from '../../../models/reservations.js';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import { CONSTANTS } from '../../../config/constants.js';
import utils from '../../../utils.js';

dayjs.extend(utc);

const reservationsTypes = ['all', 'incoming', 'expired', 'cancelled'];

/**
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
export const fetchReservationsOfStore = async (req, res, next) => {
	try {
		const { storeId, types, limit } = req.params;

		const limitValue =
			limit && !isNaN(parseInt(limit)) && parseInt(limit) > 0
				? parseInt(limit)
				: 50;

		const store = await Store.findOne({ _id: storeId, userId: req.user._id });

		if (!store) {
			return res
				.status(404)
				.json({ success: false, msg: 'srv_store_not_found' });
		}

		const typesToFind = types.split(';');
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

/**
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
export const fetchReservationsOfAllStores = async (req, res, next) => {
	try {
		const { types, limit } = req.params;

		const limitValue =
			limit && !isNaN(parseInt(limit)) && parseInt(limit) > 0
				? parseInt(limit)
				: 50;

		const stores = await Store.find({ userId: req.user._id });
		const storeIds = stores.map((s) => s._id);

		const typesToFind = types.split(';');
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
			query.$or = conditions;
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

			const storeStartTime = dayjs.utc(storeOpeningTime.start, 'HH:mm');
			const storeEndTime = dayjs.utc(storeOpeningTime.end, 'HH:mm');

			if (
				!newStart.isBetween(storeStartTime, storeEndTime) ||
				!newEnd.isBetween(storeStartTime, storeEndTime)
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

				if (tableId) reservation.tableId = tableId;
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
		// TODO send new email
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

		await Reservation.findByIdAndDelete(reservation._id);

		// TODO: Send cancellation email

		return res.json({ success: true, msg: 'srv_reservation_deleted' });
	} catch (error) {
		console.error(error);
		return next(new HttpError('srv_error', 500));
	}
};
