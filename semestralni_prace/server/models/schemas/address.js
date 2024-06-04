import mongoose from 'mongoose';

const { Schema } = mongoose;

const AddressSchema = new Schema(
	{
		street: { type: String, default: '', trim: true },
		city: { type: String, default: '', trim: true },
		zip: {
			type: String,
			default: '',
		},
		country: {
			type: String,
			default: 'Česká republika',
			trim: true,
		},
	},
	{ strict: true, _id: false }
);

export default AddressSchema;
