import { CONFIG } from '../../config/config.js';
import { CONSTANTS } from '../../config/constants.js';
import jwt from 'jsonwebtoken';
import dayjs from 'dayjs';
import HttpError from '../../http-error.js';
import isBetween from 'dayjs/plugin/isBetween.js';
import mongoose from 'mongoose';
import Reservation from '../../models/reservations.js';
import Store from '../../models/stores.js';
import Table from '../../models/tables.js';
import utc from 'dayjs/plugin/utc.js';
import utils from '../../utils.js';
import Users from '../../models/users.js';
import {
	sendCancellationEmail,
	sendCancelReservationTokenEmail,
	sendConfirmationEmail,
} from '../../mailer.js';

const { sign, decode, verify } = jwt;
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

		const checkReservation = await Reservation.findOne({
			tableId,
			start: { $lt: newEnd.toDate() },
			end: { $gt: newStart.toDate() },
		});

		if (checkReservation) {
			return next(new HttpError('srv_reservation_exists', 409));
		}

		const user = await Users.findOne({ email });

		const newReservation = new Reservation({
			userId: user ? user._id : null,
			storeId: store._id,
			tableId,
			email,
			name,
			start: newStart.toDate(),
			end: newEnd.toDate(),
			isCancelled: false,
		});

		await newReservation.save();

		if (process.env.NODE_ENV !== 'TEST') {
			try {
				await sendConfirmationEmail({
					email,
					reservation: {
						...newReservation.toObject(),
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
			msg: newReservation,
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
		const { reservationId } = req.params;

		if (!reservationId || !mongoose.Types.ObjectId.isValid(reservationId)) {
			return next(new HttpError('srv_invalid_request', 400));
		}

		const reservation = await Reservation.findById(reservationId);

		if (!reservation) {
			return next(new HttpError('srv_reservation_not_found', 404));
		}

		if (reservation.isCancelled) {
			return next(new HttpError('srv_reservation_already_cancelled', 400));
		}

		const store = await Store.findOne({
			_id: reservation.storeId,
		});

		if (!store) {
			return next(new HttpError('srv_store_not_found', 404));
		}

		const table = await Table.findOne({
			_id: reservation.tableId,
			storeId: store._id,
		});

		if (!table) {
			return next(new HttpError('srv_table_not_found', 404));
		}

		const token = sign({ reservationId }, CONFIG.JWT_SECRET, {
			expiresIn: '30m',
		});

		if (process.env.NODE_ENV !== 'TEST') {
			try {
				await sendCancelReservationTokenEmail({
					email: reservation.email,
					reservation: {
						...reservation.toObject(),
						start: newStart.format('DD/MM/YYYY HH:mm'),
						end: newEnd.format('DD/MM/YYYY HH:mm'),
					},
					store,
					table,
					token,
				});
			} catch (error) {
				console.log(error);
			}
		}

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
			verify(token, CONFIG.JWT_SECRET);
		} catch (error) {
			console.log(error);
			return next(new HttpError('srv_token_expired', 400));
		}

		const decoded = decode(token);

		if (
			!decoded.reservationId ||
			!mongoose.Types.ObjectId.isValid(decoded.reservationId)
		) {
			return next(new HttpError('srv_invalid_request', 400));
		}

		const reservation = await Reservation.findById(decoded.reservationId);

		if (!reservation) {
			return next(new HttpError('srv_reservation_not_found', 404));
		}

		if (reservation.isCancelled) {
			return next(new HttpError('srv_reservation_already_cancelled', 400));
		}

		const store = await Store.findOne({
			_id: reservation.storeId,
		});

		if (!store) {
			return next(new HttpError('srv_store_not_found', 404));
		}

		const table = await Table.findOne({
			_id: reservation.tableId,
			storeId: store._id,
		});

		if (!table) {
			return next(new HttpError('srv_table_not_found', 404));
		}

		await Reservation.findByIdAndUpdate(reservation._id, {
			$set: {
				isCancelled: true,
			},
		});

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
