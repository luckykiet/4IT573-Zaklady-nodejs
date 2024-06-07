// @ts-nocheck
import Store from '../../../models/stores.js';
import HttpError from '../../../http-error.js';
import mongoose from 'mongoose';
import Table from '../../../models/tables.js';
import utils from '../../../utils.js';
import Reservations from '../../../models/reservations.js';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import customParseFormat from 'dayjs/plugin/customParseFormat.js';

dayjs.extend(utc);
dayjs.extend(customParseFormat);

/**
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
export const fetchTablesOfStore = async (req, res, next) => {
	try {
		const { storeId } = req.params;

		const store = await Store.findOne({
			_id: storeId,
			userId: req.user._id,
		});

		if (!store) {
			return next(new HttpError('srv_store_not_found', 404));
		}

		const tables = await Table.find({ storeId: store._id });
		return res.json({ success: true, msg: tables });
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
export const fetchTable = async (req, res, next) => {
	try {
		const { tableId } = req.params;

		if (!mongoose.Types.ObjectId.isValid(tableId)) {
			return next(new HttpError('srv_invalid_request', 400));
		}
		const table = await Table.findById(tableId);

		if (!table) {
			return next(new HttpError('srv_store_not_found', 404));
		}
		const store = await Store.findOne({
			_id: table.storeId,
			userId: req.user._id,
		});

		if (!store) {
			return next(new HttpError('srv_store_not_found', 404));
		}

		return res.status(200).json({
			success: true,
			msg: table,
		});
	} catch (error) {
		return next(new HttpError('srv_fetch_table_failed', 500));
	}
};

/**
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
export const updateTable = async (req, res, next) => {
	let reservations = [];
	try {
		const { tableId, name, person, isAvailable } = req.body;

		const validator = {
			tableId: /^\w{24}$/,
			name: /^.{1,100}$/,
			person: /^\d+$/,
			isAvailable: isAvailable ? utils.createEnumRegex([true, false]) : false,
		};

		if (
			!mongoose.Types.ObjectId.isValid(tableId) ||
			!utils.isValidRequest(validator, req.body) ||
			parseInt(person) <= 0
		) {
			return next(new HttpError('srv_invalid_request', 400));
		}

		const table = await Table.findById(tableId);

		if (!table) {
			return next(new HttpError('srv_table_not_found', 404));
		}

		const store = await Store.findOne({
			_id: table.storeId,
			userId: req.user._id,
		});

		if (!store) {
			return next(new HttpError('srv_store_not_found', 404));
		}

		reservations = await Reservations.find({ tableId: table._id });
		if (reservations.length > 0) {
			await Reservations.deleteMany({ tableId: table._id });
		}
		//delete all reservation
		if (table.isAvailable && !isAvailable && reservations.length > 0) {
			// Send mail
			const promises = reservations.map(async (reservation) => {
				const now = dayjs();
				//send cancelation email for incoming reservation
				if (dayjs(reservation.end).isAfter(now) && !reservation.isCancelled) {
					if (process.env.NODE_ENV !== 'TEST') {
						try {
							const table = tables.find((t) => reservation._id.equals(t._id));
							await sendCancellationEmail({
								email: reservation.email,
								reservation: {
									...reservation.toObject(),
									start: dayjs(reservation.start).format('DD/MM/YYYY HH:mm'),
									end: dayjs(reservation.end).format('DD/MM/YYYY HH:mm'),
								},
								store,
								table,
							});
						} catch (error) {
							console.log(error);
						}
					}
				}
			});

			await Promise.all(promises);
		}

		table.name = name || table.name;
		table.person = person || table.person;
		table.isAvailable =
			isAvailable !== undefined ? isAvailable : table.isAvailable;

		await table.save();

		return res.status(200).json({
			success: true,
			msg: table,
		});
	} catch (error) {
		try {
			await Reservations.insertMany(reservations);
		} catch (err) {
			console.log(err);
		}
		console.error(error);
		return next(new HttpError('srv_update_store_failed', 500));
	}
};

/**
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
export const addTable = async (req, res, next) => {
	try {
		const { storeId, name, person } = req.body;
		const validator = {
			storeId: /^\w{24}$/,
			name: /^.{1,100}$/,
			person: /^\d+$/,
		};

		if (
			!mongoose.Types.ObjectId.isValid(storeId) ||
			!utils.isValidRequest(validator, req.body) ||
			parseInt(person) <= 0
		) {
			return next(new HttpError('srv_invalid_request', 400));
		}

		const store = await Store.findOne({
			_id: storeId,
			userId: req.user._id,
		});

		if (!store) {
			return next(new HttpError('srv_store_not_found', 404));
		}

		const newTable = new Table({
			storeId,
			name,
			person: parseInt(person),
			isAvailable: true,
		});

		await newTable.save();

		return res.status(201).json({
			success: true,
			msg: newTable,
		});
	} catch (error) {
		console.error(error);
		return next(new HttpError('srv_add_table_failed', 500));
	}
};

/**
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
export const deleteTable = async (req, res, next) => {
	let reservations = [];
	try {
		const { tableId } = req.params;

		if (!mongoose.Types.ObjectId.isValid(tableId)) {
			return next(new HttpError('srv_invalid_request', 400));
		}
		const table = await Table.findById(tableId);

		if (!table) {
			return next(new HttpError('srv_store_not_found', 404));
		}
		const store = await Store.findOne({
			_id: table.storeId,
			userId: req.user._id,
		});

		if (!store) {
			return next(new HttpError('srv_store_not_found', 404));
		}

		reservations = await Reservations.find({ tableId: table._id });
		if (reservations.length > 0) {
			await Reservations.deleteMany({ tableId: table._id });
		}

		// Send mail
		const promises = reservations.map(async (reservation) => {
			const now = dayjs();
			//send cancelation email for incoming reservation
			if (dayjs(reservation.end).isAfter(now) && !reservation.isCancelled) {
				if (process.env.NODE_ENV !== 'TEST') {
					try {
						const table = tables.find((t) => reservation._id.equals(t._id));
						await sendCancellationEmail({
							email: reservation.email,
							reservation: {
								...reservation.toObject(),
								start: dayjs(reservation.start).format('DD/MM/YYYY HH:mm'),
								end: dayjs(reservation.end).format('DD/MM/YYYY HH:mm'),
							},
							store,
							table,
						});
					} catch (error) {
						console.log(error);
					}
				}
			}
		});

		await Promise.all(promises);

		await Table.findByIdAndDelete(tableId);

		return res.status(200).json({
			success: true,
			msg: 'srv_table_deleted',
		});
	} catch (error) {
		console.log(error);
		try {
			await Reservations.insertMany(reservations);
		} catch (err) {
			console.log(err);
		}
		return next(new HttpError('srv_delete_table_failed', 500));
	}
};
