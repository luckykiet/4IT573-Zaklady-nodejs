import HttpError from '../../http-error.js';
import Reservation from '../../models/reservations.js';
import Store from '../../models/stores.js';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import isBetween from 'dayjs/plugin/isBetween.js';
import utils from '../../utils.js';
import { CONSTANTS } from '../../config/constants.js';
import mongoose from 'mongoose';
import * as jwt from 'jsonwebtoken';
import { CONFIG } from '../../config/config.js';
import Table from '../../models/tables.js';

dayjs.extend(utc);
dayjs.extend(isBetween);

/**
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
export const addReservation = async (req, res, next) => {
	try {
		const { tableId, email, name, start, end } = req.body;

		const validator = {
			email: utils.emailRegex,
			name: /^.{3,100}$/,
			start: /^.{12}$/,
			end: /^.{12}$/,
			tableId: /^\w{24}$/,
			storeId: /^\w{24}$/,
		};

		if (!utils.isValidRequest(validator, req.body)) {
			return next(new HttpError('srv_invalid_request', 400));
		}

		const newStart = dayjs.utc(start, CONSTANTS.RESERVATION_TIME_FORMAT, true);
		const newEnd = dayjs.utc(end, CONSTANTS.RESERVATION_TIME_FORMAT, true);

		if (!newStart.isValid() || !newEnd.isValid() || !newEnd.isAfter(newStart)) {
			return next(new HttpError('srv_invalid_time', 400));
		}

		const table = await Table.findOne({ _id: tableId, isAvailable: true });

		if (!table) {
			return next(new HttpError('srv_table_not_found', 404));
		}

		const store = await Store.findById(table.storeId);

		if (!store) {
			return next(new HttpError('srv_store_not_found', 404));
		}

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

		const checkReservation = await Reservation.findOne({
			tableId,
			start: { $lt: newEnd.toDate() },
			end: { $gt: newStart.toDate() },
		});

		if (checkReservation) {
			return next(new HttpError('srv_reservation_exists', 409));
		}

		const newReservation = new Reservation({
			userId: req.user._id,
			storeId,
			tableId,
			email,
			name,
			start: newStart.toDate(),
			end: newEnd.toDate(),
			isCancelled: false,
		});

		await newReservation.save();

		// TODO: Send confirmation email

		return res.json({
			success: true,
			msg: 'Reservation created',
			data: newReservation,
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
export const sendReservationToken = async (req, res, next) => {
	try {
		const { reservationId } = req.body;

		if (!reservationId || !mongoose.Types.ObjectId.isValid(reservationId)) {
			return next(new HttpError('srv_invalid_request', 400));
		}

		const reservation = await Reservation.findById(reservationId);

		if (!reservation) {
			return next(new HttpError('srv_reservation_not_found', 404));
		}

		// TODO: Send cancellation token email
		const token = jwt.sign({ reservationId }, CONFIG.JWT_SECRET, {
			expiresIn: '30m',
		});
		return res.json({ success: true, msg: token });
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
export const cancelReservation = async (req, res, next) => {
	try {
		const { token } = req.params;

		if (!token) {
			return next(new HttpError('srv_invalid_request', 400));
		}

		try {
			jwt.verify(token, CONFIG.JWT_SECRET);
		} catch (error) {
			console.log(error);
			return next(new HttpError('srv_token_expired', 400));
		}

		const decode = jwt.decode(token);

		if (
			!decode.reservationId ||
			!mongoose.Types.ObjectId.isValid(decode.reservationId)
		) {
			return next(new HttpError('srv_invalid_request', 400));
		}

		const reservation = await Reservation.findById(decode.reservationId);

		if (!reservation) {
			return next(new HttpError('srv_reservation_not_found', 404));
		}

		await Reservation.findByIdAndDelete(reservation._id);

		// TODO: Send cancellation email

		return res.json({ success: true, msg: 'srv_reservation_cancelled' });
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
export const fetchReservation = async (req, res, next) => {
	try {
		const { reservationId } = req.params;

		if (!reservationId || !mongoose.Types.ObjectId.isValid(reservationId)) {
			return next(new HttpError('srv_invalid_request', 400));
		}

		const reservation = await Reservation.findById(reservationId);

		if (!reservation) {
			return next(new HttpError('srv_reservation_not_found', 404));
		}

		const store = await Store.findById(reservation.storeId);
		const table = await Table.findById(reservation.tableId);

		return res.json({
			success: true,
			msg: {
				...reservation.toObject(),
				store: { name: store.name, address: store.address },
				table: { name: table.name, person: table.person },
			},
		});
	} catch (error) {
		console.error(error);
		return next(new HttpError('srv_error', 500));
	}
};
