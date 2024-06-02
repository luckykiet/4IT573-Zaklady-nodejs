import mongoose from 'mongoose';
import Address from './address.js';
import { STORES } from '../../config/stores.js';
const { Schema } = mongoose;

import customParseFormat from 'dayjs/plugin/customParseFormat.js';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import utils from '../../utils.js';

dayjs.extend(utc);
dayjs.extend(customParseFormat);

const defaultStartTime = '08:00';
const defaultEndTime = '20:00';
const format = 'HH:mm';

const OpeningTimeSchema = new Schema(
	{
		start: {
			type: String,
			match: [utils.openingTimeRegex, format],
			default: defaultStartTime,
			required: true,
		},
		end: {
			type: String,
			match: [utils.openingTimeRegex, format],
			default: defaultEndTime,
			required: true,
		},
		isOpen: {
			type: Boolean,
			default: false,
			required: true,
		},
	},
	{ strict: true, _id: false }
);

const StoreSchema = new Schema(
	{
		userId: { type: Schema.ObjectId, required: true },
		name: {
			type: String,
			trim: true,
			required: true,
		},
		address: {
			type: Address,
			required: true,
		},
		type: {
			type: String,
			trim: true,
			default: 'restaurant',
			enum: Object.keys(STORES),
			required: true,
		},
		openingTime: {
			type: [OpeningTimeSchema],
			required: true,
			//indexing from sunday to saturday
			default: Array(7)
				.fill()
				.map(() => ({
					start: defaultStartTime,
					end: defaultEndTime,
					isOpen: false,
				})),
			validate: [
				(val) => {
					return val.length <= 7;
				},
				'srv_invalid_days',
			],
		},
		isAvailable: {
			type: Boolean,
			required: true,
			default: true,
		},
	},
	{ strict: true, timestamps: true }
);

StoreSchema.index(
	{
		name: 1,
		'address.street': 1,
		'address.city': 1,
		type: 1,
	},
	{ name: 'store_indexes' }
);

export default StoreSchema;
