// @ts-nocheck
import Store from '../../../models/stores.js';
import HttpError from '../../../http-error.js';
import mongoose from 'mongoose';
import Table from '../../../models/tables.js';
import { STORES } from '../../../config/stores.js';
import utils from '../../../utils.js';
import Reservations from '../../../models/reservations.js';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import customParseFormat from 'dayjs/plugin/customParseFormat.js';
import { sendCancellationEmail } from '../../../mailer.js';
import _ from 'lodash';
dayjs.extend(utc);
dayjs.extend(customParseFormat);
/**
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
export const fetchOwnStores = async (req, res, next) => {
	try {
		const { params } = req;
		const limit = parseInt(params.limit) || 50;

		const stores = await Store.find({
			userId: req.user._id,
		})
			.select('-__v')
			.limit(limit)
			.sort({ type: 1, name: 1 });

		const result = [];
		const promises = stores.map(async (store) => {
			const tables = await Table.find({
				storeId: store._id,
			});
			result.push({ ...store.toObject(), tables });
		});
		await Promise.all(promises);
		return res.json({ success: true, msg: result });
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
export const fetchUserStoreWithTables = async (req, res, next) => {
	try {
		if (!mongoose.Types.ObjectId.isValid(req.params.storeId)) {
			return next(new HttpError('srv_invalid_request', 400));
		}

		const store = await Store.findOne({
			_id: req.params.storeId,
			userId: req.user._id,
		}).select('-__v');

		if (!store) {
			return next(new HttpError('srv_store_not_found', 404));
		}

		const tables = await Table.find({
			storeId: store._id,
		});

		return res.status(200).json({
			success: true,
			msg: { ...store.toObject(), tables },
		});
	} catch (error) {
		console.log(error);
		return next(new HttpError('srv_get_store_failed', 500));
	}
};

/**
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
export const updateStore = async (req, res, next) => {
	try {
		const { storeId, name, address, type, openingTime, isAvailable } = req.body;

		const addressValidator = {
			street: address ? /^.{0,100}$/ : false,
			city: address ? /^.{0,75}$/ : false,
			zip: address ? /^\w{0,5}$/ : false,
			country: address ? /^.{0,75}$/ : false,
		};

		if (!utils.isValidRequest(addressValidator, req.body.address)) {
			return next(new HttpError('srv_invalid_request', 400));
		}

		if (openingTime && (!_.isArray(openingTime) || openingTime.length !== 7)) {
			return next(new HttpError('srv_invalid_request', 400));
		}

		openingTime &&
			openingTime.map((day) => {
				if (
					day.isOpen === undefined ||
					typeof day.isOpen !== 'boolean' ||
					!day.start ||
					!dayjs(day.start, 'HH:mm', true).isValid() ||
					!day.end ||
					!dayjs(day.end, 'HH:mm', true).isValid() ||
					dayjs(day.end, 'HH:mm', true).isBefore(
						dayjs(day.start, 'HH:mm', true)
					) ||
					dayjs(day.end, 'HH:mm', true).isSame(dayjs(day.start, 'HH:mm', true))
				) {
					console.log('Invalid openingTime');
					return next(new HttpError('srv_invalid_request', 400));
				}
			});

		if (!utils.isValidRequest(addressValidator, req.body.address)) {
			return next(new HttpError('srv_invalid_request', 400));
		}

		const validator = {
			storeId: /^\w{24}$/,
			name: name ? /^.{3,100}$/ : false,
			type: type ? utils.createEnumRegex(Object.keys(STORES)) : false,
			address: false,
			openingTime: false,
			isAvailable: isAvailable ? utils.createEnumRegex([true, false]) : false,
		};

		if (!utils.isValidRequest(validator, req.body)) {
			return next(new HttpError('srv_invalid_request', 400));
		}

		if (!mongoose.Types.ObjectId.isValid(storeId)) {
			return next(new HttpError('srv_invalid_request', 400));
		}
		const store = await Store.findOne({
			_id: storeId,
			userId: req.user._id,
		});

		if (!store) {
			return next(new HttpError('srv_store_not_found', 404));
		}
		store.name = name || store.name;
		store.address = address || store.address;
		store.type = type || store.type;
		store.openingTime = openingTime || store.openingTime;
		store.isAvailable =
			isAvailable !== undefined ? isAvailable : store.isAvailable;

		await store.save();
		return res.status(200).json({
			success: true,
			msg: store,
		});
	} catch (error) {
		console.error(error);
		return next(new HttpError('srv_update_store_failed', 500));
	}
};

/**
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
export const addStore = async (req, res, next) => {
	try {
		const { name, address, type } = req.body;

		const addressValidator = {
			street: /^.{0,100}$/,
			city: /^.{0,75}$/,
			zip: /^\w{0,5}$/,
			country: /^.{0,75}$/,
		};

		if (!utils.isValidRequest(addressValidator, req.body.address)) {
			return next(new HttpError('srv_invalid_request', 400));
		}
		const validator = {
			name: /^.{3,100}$/,
			type: utils.createEnumRegex(Object.keys(STORES)),
			address: /^.*$/,
		};

		if (!utils.isValidRequest(validator, req.body)) {
			return next(new HttpError('srv_invalid_request', 400));
		}
		const defaultStartTime = '08:00';
		const defaultEndTime = '20:00';
		const newStore = new Store({
			userId: req.user._id,
			name,
			address,
			type,
			openingTime: Array(7)
				.fill()
				.map(() => ({
					start: defaultStartTime,
					end: defaultEndTime,
					isOpen: false,
				})),
			isAvailable: false,
		});

		await newStore.save();

		return res.status(201).json({
			success: true,
			msg: newStore,
		});
	} catch (error) {
		console.error(error);
		return next(new HttpError('srv_add_store_failed', 500));
	}
};

/**
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
export const deleteStore = async (req, res, next) => {
	let tables = [];
	let reservations = [];
	try {
		const { storeId } = req.params;

		if (!mongoose.Types.ObjectId.isValid(storeId)) {
			return next(new HttpError('srv_invalid_request', 400));
		}
		const store = await Store.findOne({
			_id: storeId,
			userId: req.user._id,
		});

		if (!store) {
			return next(new HttpError('srv_store_not_found', 404));
		}
		tables = await Table.find({ storeId: store._id });
		reservations = await Reservations.find({ storeId: store._id });

		if (reservations.length > 0) {
			// Send mail
			const promises = reservations.map(async (reservation) => {
				const now = dayjs.utc();
				//send cancelation email for incoming reservation
				if (
					dayjs.utc(reservation.end).isAfter(now) &&
					!reservation.isCancelled
				) {
					if (process.env.NODE_ENV !== 'TEST') {
						try {
							const table = tables.find((t) => reservation._id.equals(t._id));
							await sendCancellationEmail({
								email: reservation.email,
								reservation: {
									...reservation.toObject(),
									start: dayjs
										.utc(reservation.start)
										.format('DD/MM/YYYY HH:mm'),
									end: dayjs.utc(reservation.end).format('DD/MM/YYYY HH:mm'),
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

			await Reservations.deleteMany({ storeId: store._id });
		}
		if (tables.length > 0) {
			await Table.deleteMany({ storeId: store._id });
		}
		await Store.findByIdAndDelete(store._id);

		return res.status(200).json({
			success: true,
			msg: 'srv_store_deleted',
		});
	} catch (error) {
		console.error(error);
		try {
			await Table.insertMany(tables);
			await Reservations.insertMany(reservations);
		} catch (restoreError) {
			console.error('Failed to restore:', restoreError);
		}
		return next(new HttpError('srv_delete_store_failed', 500));
	}
};
