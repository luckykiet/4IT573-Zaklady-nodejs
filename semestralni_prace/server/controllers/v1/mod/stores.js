// @ts-nocheck
import Store from '../../../models/stores.js';
import HttpError from '../../../http-error.js';
import mongoose from 'mongoose';
import Table from '../../../models/tables.js';
import { STORES } from '../../../config/stores.js';
import utils from '../../../utils.js';

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
			return res.json({
				success: false,
				msg: 'srv_invalid_request',
			});
		}

		const store = await Store.findOne({
			_id: req.params.storeId,
			userId: req.user._id,
			isAvailable: true,
		}).select('-__v');

		if (!store) {
			return res.json({
				success: false,
				msg: `srv_store_not_found`,
			});
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

		if (!mongoose.Types.ObjectId.isValid(storeId)) {
			return res.json({
				success: false,
				msg: 'srv_invalid_request',
			});
		}
		const store = await Store.findOne({
			_id: storeId,
			userId: req.user._id,
		});

		if (!store) {
			return res.json({
				success: false,
				msg: 'srv_store_not_found',
			});
		}

		store.name = name || store.name;
		store.address = address || store.address;
		store.type = type || store.type;
		store.openingTime = openingTime || store.openingTime;
		store.isAvailable = isAvailable ? isAvailable : store.isAvailable;

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
	try {
		const { storeId } = req.params;

		if (!mongoose.Types.ObjectId.isValid(storeId)) {
			return res.json({
				success: false,
				msg: 'srv_invalid_request',
			});
		}
		let tables = [];
		const store = await Store.findOne({
			_id: storeId,
			userId: req.user._id,
		});

		if (!store) {
			return res.json({
				success: false,
				msg: 'srv_store_not_found',
			});
		}
		tables = await Table.find({ storeId: store._id });

		await Table.deleteMany({ storeId: store._id });

		await Store.findByIdAndDelete(store._id);

		return res.status(200).json({
			success: true,
			msg: 'srv_store_deleted',
		});
	} catch (error) {
		console.error(error);
		try {
			await Table.insertMany(tables);
		} catch (restoreError) {
			console.error('Failed to restore tables:', restoreError);
		}
		return next(new HttpError('srv_delete_store_failed', 500));
	}
};
