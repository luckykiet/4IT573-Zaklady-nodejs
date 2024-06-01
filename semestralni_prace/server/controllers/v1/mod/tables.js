// @ts-nocheck
import Store from '../../../models/stores.js';
import HttpError from '../../../http-error.js';
import mongoose from 'mongoose';
import Table from '../../../models/tables.js';
import utils from '../../../utils.js';

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
			return res.json({
				success: false,
				msg: 'srv_store_not_found',
			});
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
			return res.json({
				success: false,
				msg: 'srv_invalid_request',
			});
		}
		const table = await Table.findById(tableId);

		if (!table) {
			return res.json({
				success: false,
				msg: 'srv_table_not_found',
			});
		}
		const store = await Store.findOne({
			_id: table.storeId,
			userId: req.user._id,
		});

		if (!store) {
			return res.json({
				success: false,
				msg: 'srv_table_not_found',
			});
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
	try {
		const { storeId, name, person, isAvailable } = req.body;

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
			return res.json({
				success: false,
				msg: 'srv_store_not_found',
			});
		}

		const table = await Table.findOne({
			storeId,
		});

		if (!table) {
			return res.json({
				success: false,
				msg: 'srv_table_not_found',
			});
		}

		table.name = name || table.name;
		table.person = person || table.person;
		table.isAvailable = isAvailable ? isAvailable : table.isAvailable;

		await table.save();

		return res.status(200).json({
			success: true,
			msg: table,
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
			return res.json({
				success: false,
				msg: 'srv_store_not_found',
			});
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
	try {
		const { tableId } = req.params;

		if (!mongoose.Types.ObjectId.isValid(tableId)) {
			return res.json({
				success: false,
				msg: 'srv_invalid_request',
			});
		}
		const table = await Table.findById(tableId);

		if (!table) {
			return res.json({
				success: false,
				msg: 'srv_table_not_found',
			});
		}
		const store = await Store.findOne({
			_id: table.storeId,
			userId: req.user._id,
		});

		if (!store) {
			return res.json({
				success: false,
				msg: 'srv_table_not_found',
			});
		}

		await Table.findOneAndDelete(tableId);

		return res.status(200).json({
			success: true,
			msg: 'srv_table_deleted',
		});
	} catch (error) {
		return next(new HttpError('srv_delete_table_failed', 500));
	}
};
