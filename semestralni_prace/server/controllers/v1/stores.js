//@ts-check
import Store from '../../models/stores.js';
import HttpError from '../../http-error.js';
import mongoose from 'mongoose';
import Table from '../../models/tables.js';

/**
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
export const fetchAvailableStores = async (req, res, next) => {
	try {
		const { params } = req;
		const limit =
			params.limit &&
			!isNaN(parseInt(params.limit)) &&
			parseInt(params.limit) > 0
				? parseInt(params.limit)
				: 50;
		const stores = await Store.find({
			isAvailable: true,
		})
			.select('name address type openingTime')
			.limit(limit);

		const result = [];
		const promises = stores.map(async (store) => {
			const tables = await Table.find({
				storeId: store._id,
			});
			result.push({ ...store, tables });
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
export const fetchAvailableStoreWithTables = async (req, res, next) => {
	try {
		if (!mongoose.Types.ObjectId.isValid(req.params.storeId)) {
			return next(new HttpError('srv_invalid_request', 400));
		}

		const store = await Store.findOne({
			_id: req.params.storeId,
			isAvailable: true,
		}).select('name address type openingTime -__v');

		if (!store) {
			return next(new HttpError('srv_invalid_request', 404));
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
