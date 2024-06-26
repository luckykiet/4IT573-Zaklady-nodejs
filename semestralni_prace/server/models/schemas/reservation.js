import mongoose from 'mongoose';
import utils from '../../utils.js';
const { Schema } = mongoose;

const ReservationSchema = new Schema(
	{
		userId: { type: Schema.ObjectId, default: null },
		storeId: { type: Schema.ObjectId, required: true },
		tableId: { type: Schema.ObjectId, required: true },
		email: {
			type: String,
			match: [utils.emailRegex, 'srv_invalid_email'],
			required: true,
		},
		name: {
			type: String,
			trim: true,
			required: true,
		},
		start: {
			type: Date,
			required: true,
		},
		end: {
			type: Date,
			required: true,
		},
		isCancelled: {
			type: Boolean,
			default: false,
			required: true,
		},
	},
	{ strict: true, timestamps: true }
);

ReservationSchema.indexes({
	name: 1,
	time: 1,
	email: 1,
	isCancelled: 0,
});

export default ReservationSchema;
