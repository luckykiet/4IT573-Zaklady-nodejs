import supertest from 'supertest';
import app from '../../../app.js';
import Users from '../../../models/users.js';
import Stores from '../../../models/stores.js';
import Reservations from '../../../models/reservations.js';
import bcrypt from 'bcryptjs';
import * as db from '../../db.js';
import dayjs from 'dayjs';

const apiVersion = 'v1';
const request = supertest(app);

beforeAll(async () => {
	await db.connect();
});

afterEach(async () => {
	await db.clearDatabase();
});

afterAll(async () => {
	await db.closeDatabase();
});

const logoutUser = async (cookie) => {
	await request.post(`/api/${apiVersion}/signout`).set('Cookie', cookie);
};

describe(`Reservation merchant on opened store`, () => {
	let user, store, table, cookie;

	beforeEach(async () => {
		// Create a user and store
		const hashedPassword = await bcrypt.hash('password123', 10);
		user = await Users.create({
			email: 'test@example.com',
			password: hashedPassword,
			name: 'Test User',
			role: 'guest',
		});

		store = await Stores.create({
			userId: user._id,
			name: 'Test store',
			address: {
				street: 'Test street',
				city: 'Praha',
				zip: '11000',
			},
			type: 'retail_store',
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
		});

		// Login user
		const response = await request.post(`/api/${apiVersion}/auth`).send({
			email: 'test@example.com',
			password: 'password123',
		});

		cookie = response.headers['set-cookie'];
	});

	afterEach(async () => {
		await logoutUser(cookie);
	});

	test('should add a reservation successfully', async () => {
		const start = dayjs.utc().add(1, 'day').format('YYYYMMDDHHmm');
		const end = dayjs.utc().add(2, 'day').format('YYYYMMDDHHmm');

		const response = await request
			.post(`/api/${apiVersion}/reservations`)
			.set('Cookie', cookie)
			.send({
				storeId: store._id.toString(),
				tableId: '609e2adf8f1d2c00172fba13',
				email: 'reservation@example.com',
				name: 'Reservation Name',
				start,
				end,
			});

		expect(response.status).toBe(200);
		expect(response.body.success).toBe(true);
		expect(response.body.msg).toHaveProperty(
			'email',
			'reservation@example.com'
		);
		expect(response.body.msg).toHaveProperty('name', 'Reservation Name');
	});

	test('should update a reservation successfully', async () => {
		const start = dayjs.utc().add(1, 'day').format('YYYYMMDDHHmm');
		const end = dayjs.utc().add(2, 'day').format('YYYYMMDDHHmm');

		const reservation = await Reservations.create({
			userId: user._id,
			storeId: store._id,
			tableId: '609e2adf8f1d2c00172fba13',
			email: 'reservation@example.com',
			name: 'Reservation Name',
			start: dayjs.utc(start, 'YYYYMMDDHHmm').toDate(),
			end: dayjs.utc(end, 'YYYYMMDDHHmm').toDate(),
			isCancelled: false,
		});

		const newStart = dayjs.utc().add(3, 'day').format('YYYYMMDDHHmm');
		const newEnd = dayjs.utc().add(4, 'day').format('YYYYMMDDHHmm');

		const response = await request
			.put(`/api/${apiVersion}/reservation`)
			.set('Cookie', cookie)
			.send({
				reservationId: reservation._id.toString(),
				start: newStart,
				end: newEnd,
			});

		expect(response.status).toBe(200);
		expect(response.body.success).toBe(true);
		expect(response.body.msg).toHaveProperty('start');
		expect(response.body.msg).toHaveProperty('end');
	});

	test('should delete a reservation successfully', async () => {
		const start = dayjs.utc().add(1, 'day').format('YYYYMMDDHHmm');
		const end = dayjs.utc().add(2, 'day').format('YYYYMMDDHHmm');

		const reservation = await Reservations.create({
			userId: user._id,
			storeId: store._id,
			tableId: '609e2adf8f1d2c00172fba13',
			email: 'reservation@example.com',
			name: 'Reservation Name',
			start: dayjs.utc(start, 'YYYYMMDDHHmm').toDate(),
			end: dayjs.utc(end, 'YYYYMMDDHHmm').toDate(),
			isCancelled: false,
		});

		const response = await request
			.delete(`/api/${apiVersion}/reservation/${reservation._id.toString()}`)
			.set('Cookie', cookie);

		expect(response.status).toBe(200);
		expect(response.body.success).toBe(true);
		expect(response.body.msg).toBe('srv_reservation_deleted');
	});

	test('should fetch reservations of a store', async () => {
		const start = dayjs.utc().add(1, 'day').format('YYYYMMDDHHmm');
		const end = dayjs.utc().add(2, 'day').format('YYYYMMDDHHmm');

		await Reservations.create({
			userId: user._id,
			storeId: store._id,
			tableId: '609e2adf8f1d2c00172fba13',
			email: 'reservation@example.com',
			name: 'Reservation Name',
			start: dayjs.utc(start, 'YYYYMMDDHHmm').toDate(),
			end: dayjs.utc(end, 'YYYYMMDDHHmm').toDate(),
			isCancelled: false,
		});

		const response = await request
			.get(`/api/${apiVersion}/reservations/store/${store._id.toString()}`)
			.set('Cookie', cookie);

		expect(response.status).toBe(200);
		expect(response.body.success).toBe(true);
		expect(response.body.msg).toHaveLength(1);
	});

	test('should fetch reservations of all stores', async () => {
		const start = dayjs.utc().add(1, 'day').format('YYYYMMDDHHmm');
		const end = dayjs.utc().add(2, 'day').format('YYYYMMDDHHmm');

		await Reservations.create({
			userId: user._id,
			storeId: store._id,
			tableId: '609e2adf8f1d2c00172fba13',
			email: 'reservation@example.com',
			name: 'Reservation Name',
			start: dayjs.utc(start, 'YYYYMMDDHHmm').toDate(),
			end: dayjs.utc(end, 'YYYYMMDDHHmm').toDate(),
			isCancelled: false,
		});

		const response = await request
			.get(`/api/${apiVersion}/reservations`)
			.set('Cookie', cookie);

		expect(response.status).toBe(200);
		expect(response.body.success).toBe(true);
		expect(response.body.msg.reservations).toHaveLength(1);
		expect(response.body.msg.stores).toHaveLength(1);
	});
});
