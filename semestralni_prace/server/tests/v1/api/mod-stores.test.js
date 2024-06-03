import supertest from 'supertest';
import app from '../../../app.js';
import Users from '../../../models/users.js';
import Stores from '../../../models/stores.js';
import bcrypt from 'bcryptjs';
import * as db from '../../db.js';
import Tables from '../../../models/tables.js';
import Reservations from '../../../models/reservations.js';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
dayjs.extend(utc);

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

describe(`Store MOD api`, () => {
	let user, user2, store, store2, table1, table2, table3, cookie;

	beforeEach(async () => {
		// Create a user and store
		const hashedPassword = await bcrypt.hash('password123', 10);
		user = await Users.create({
			email: 'test@example.com',
			password: hashedPassword,
			name: 'Test User',
			role: 'merchant',
		});

		user2 = await Users.create({
			email: 'test2@example.com',
			password: hashedPassword,
			name: 'Test User 2',
			role: 'merchant',
		});

		store = await Stores.create({
			userId: user._id,
			name: 'Test store',
			address: {
				street: 'Test street',
				city: 'Praha',
				zip: '11000',
			},
			type: 'restaurant',
			openingTime: Array(7)
				.fill()
				.map(() => ({
					start: '08:00',
					end: '20:00',
					isOpen: true,
				})),
			isAvailable: true,
		});

		store2 = await Stores.create({
			userId: user2._id,
			name: 'Test store 2',
			address: {
				street: 'Test street',
				city: 'Praha',
				zip: '11000',
			},
			type: 'bistro',
			openingTime: Array(7)
				.fill()
				.map(() => ({
					start: '08:00',
					end: '20:00',
					isOpen: true,
				})),
			isAvailable: true,
		});

		table1 = await Tables.create({
			name: 'Test Table',
			person: 2,
			isAvailable: true,
			storeId: store._id,
		});

		table2 = await Tables.create({
			name: 'Test Table 2',
			person: 2,
			isAvailable: true,
			storeId: store2._id,
		});

		table3 = await Tables.create({
			name: 'Test Table 3',
			person: 2,
			isAvailable: false,
			storeId: store._id,
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

	test('should return 400 invalid type', async () => {
		const response = await request
			.post(`/api/${apiVersion}/mod/store`)
			.set('Cookie', cookie)
			.send({
				name: 'New Store',
				address: {
					street: '123 Main St',
					city: 'City',
					zip: '12345',
					country: 'Country',
				},
				type: 'resta',
			});

		expect(response.status).toBe(400);
		expect(response.body.success).toBe(false);
	});

	test('should return 201 and create new store', async () => {
		const response = await request
			.post(`/api/${apiVersion}/mod/store`)
			.set('Cookie', cookie)
			.send({
				name: 'Test Store',
				address: {
					street: '123 Main St',
					city: 'City',
					zip: '12345',
					country: 'Country',
				},
				type: 'bistro',
			});

		expect(response.status).toBe(201);
		expect(response.body.success).toBe(true);
		expect(response.body.msg.name).toBe('Test Store');
	});

	test("should return 200 and fetch a user's store with tables", async () => {
		const response = await request
			.get(`/api/${apiVersion}/mod/store/${store._id.toString()}`)
			.set('Cookie', cookie);

		expect(response.status).toBe(200);
		expect(response.body.success).toBe(true);
		expect(response.body.msg.tables).toHaveLength(2);
	});

	test('should return 404 for not owned store', async () => {
		const response = await request
			.get(`/api/${apiVersion}/mod/store/${store2._id.toString()}`)
			.set('Cookie', cookie);

		expect(response.status).toBe(404);
		expect(response.body.success).toBe(false);
	});

	test('should return 400 for invalid store data', async () => {
		const response = await request
			.post(`/api/${apiVersion}/mod/store`)
			.set('Cookie', cookie)
			.send({
				name: 'S',
				address: { street: '123', city: 'C', zip: '1', country: 'C' },
				type: 'invalid_type',
			});

		expect(response.status).toBe(400);
		expect(response.body.msg).toBe('srv_invalid_request');
	});

	test('should return 200 and update a store', async () => {
		const response = await request
			.put(`/api/${apiVersion}/mod/store`)
			.set('Cookie', cookie)
			.send({
				storeId: store._id.toString(),
				name: 'Updated Store',
				address: {
					street: '456 Elm St',
					city: 'New City',
					zip: '67890',
					country: 'New Country',
				},
				isAvailable: true,
			});

		expect(response.status).toBe(200);
		expect(response.body.success).toBe(true);
		expect(response.body.msg.name).toBe('Updated Store');
		expect(response.body.msg.isAvailable).toBe(true);
	});

	test('should return 200 and update a store and openingtime', async () => {
		const response = await request
			.put(`/api/${apiVersion}/mod/store`)
			.set('Cookie', cookie)
			.send({
				storeId: store._id.toString(),
				name: 'Updated Store',
				address: {
					street: '456 Elm St',
					city: 'New City',
					zip: '67890',
					country: 'New Country',
				},
				isAvailable: true,
				openingTime: Array(7)
					.fill()
					.map(() => ({
						start: '09:00',
						end: '20:00',
						isOpen: true,
					})),
			});

		expect(response.status).toBe(200);
		expect(response.body.success).toBe(true);
		expect(response.body.msg.name).toBe('Updated Store');
		expect(response.body.msg.isAvailable).toBe(true);
	});

	test('should return 400 for bad openingtime for update a store', async () => {
		const response = await request
			.put(`/api/${apiVersion}/mod/store`)
			.set('Cookie', cookie)
			.send({
				storeId: store._id.toString(),
				name: 'Updated Store',
				address: {
					street: '456 Elm St',
					city: 'New City',
					zip: '67890',
					country: 'New Country',
				},
				isAvailable: true,
				openingTime: Array(7)
					.fill()
					.map(() => ({
						start: '09:00',
						end: '09:00',
						isOpen: true,
					})),
			});

		expect(response.status).toBe(400);
		expect(response.body.success).toBe(false);
	});

	test('should return 400 for bad openingtime for update a store', async () => {
		const response = await request
			.put(`/api/${apiVersion}/mod/store`)
			.set('Cookie', cookie)
			.send({
				storeId: store._id.toString(),
				name: 'Updated Store',
				address: {
					street: '456 Elm St',
					city: 'New City',
					zip: '67890',
					country: 'New Country',
				},
				isAvailable: true,
				openingTime: Array(7)
					.fill()
					.map(() => ({
						start: '09:00',
						end: '20:00',
					})),
			});

		expect(response.status).toBe(400);
		expect(response.body.success).toBe(false);
	});

	test('should return 400 for bad openingtime for update a store', async () => {
		const response = await request
			.put(`/api/${apiVersion}/mod/store`)
			.set('Cookie', cookie)
			.send({
				storeId: store._id.toString(),
				name: 'Updated Store',
				address: {
					street: '456 Elm St',
					city: 'New City',
					zip: '67890',
					country: 'New Country',
				},
				isAvailable: true,
				openingTime: Array(7)
					.fill()
					.map(() => ({
						start: '09:000',
						end: '20:00',
						isOpen: true,
					})),
			});

		expect(response.status).toBe(400);
		expect(response.body.success).toBe(false);
	});
	test('should return 400 for bad openingtime for update a store', async () => {
		const response = await request
			.put(`/api/${apiVersion}/mod/store`)
			.set('Cookie', cookie)
			.send({
				storeId: store._id.toString(),
				name: 'Updated Store',
				address: {
					street: '456 Elm St',
					city: 'New City',
					zip: '67890',
					country: 'New Country',
				},
				isAvailable: true,
				openingTime: Array(6)
					.fill()
					.map(() => ({
						start: '09:00',
						end: '20:00',
						isOpen: true,
					})),
			});

		expect(response.status).toBe(400);
		expect(response.body.success).toBe(false);
	});
	test('should return 400 for bad openingtime for update a store', async () => {
		const response = await request
			.put(`/api/${apiVersion}/mod/store`)
			.set('Cookie', cookie)
			.send({
				storeId: store._id.toString(),
				name: 'Updated Store',
				address: {
					street: '456 Elm St',
					city: 'New City',
					zip: '67890',
					country: 'New Country',
				},
				isAvailable: true,
				openingTime: Array(6)
					.fill()
					.map(() => ({
						start: '09:00',
						end: '09:00',
						isOpen: true,
					})),
			});

		expect(response.status).toBe(400);
		expect(response.body.success).toBe(false);
	});

	test('should return 400 for bad input for update a store', async () => {
		const response = await request
			.put(`/api/${apiVersion}/mod/store`)
			.set('Cookie', cookie)
			.send({
				storeId: store._id.toString(),
				name: 'Updated Store',
				address: {
					street: '456 Elm St',
					city: 'New City',
					zip: '67890',
					country: 'New Country',
				},
				type: 'store', //bad
			});

		expect(response.status).toBe(400);
		expect(response.body.success).toBe(false);
	});

	test('should return 404 for bad input for update a not owned store', async () => {
		const response = await request
			.put(`/api/${apiVersion}/mod/store`)
			.set('Cookie', cookie)
			.send({
				storeId: store2._id.toString(),
				name: 'Updated Store',
				address: {
					street: '456 Elm St',
					city: 'New City',
					zip: '67890',
					country: 'New Country',
				},
			});

		expect(response.status).toBe(404);
		expect(response.body.success).toBe(false);
	});

	test('should return 200 and delete a store with its tables and reservations', async () => {
		const start = dayjs
			.utc()
			.add(1, 'day')
			.set('hour', 15)
			.set('minute', 0)
			.format('YYYYMMDDHHmm');
		const end = dayjs
			.utc()
			.add(1, 'day')
			.set('hour', 17)
			.set('minute', 0)
			.format('YYYYMMDDHHmm');

		const storeResponse = await request
			.post(`/api/${apiVersion}/mod/store`)
			.set('Cookie', cookie)
			.send({
				name: 'Store to Delete',
				address: {
					street: '123 Main St',
					city: 'City',
					zip: '12345',
					country: 'Country',
				},
				type: 'bistro',
			});

		const storeId = storeResponse.body.msg._id;
		const t1 = await Tables.create({
			name: 'Test Table1',
			person: 2,
			isAvailable: true,
			storeId: storeId,
		});
		const t2 = await Tables.create({
			name: 'Test Table2',
			person: 2,
			isAvailable: true,
			storeId: storeId,
		});
		const t3 = await Tables.create({
			name: 'Test Table3',
			person: 2,
			isAvailable: true,
			storeId: storeId,
		});
		const r1 = await Reservations.create({
			userId: user._id,
			storeId: storeId,
			tableId: t1._id,
			email: 'reservation@example.com',
			name: 'Reservation Name',
			start: dayjs.utc(start, 'YYYYMMDDHHmm').toDate(),
			end: dayjs.utc(end, 'YYYYMMDDHHmm').toDate(),
			isCancelled: false,
		});

		const r2 = await Reservations.create({
			userId: null,
			storeId: storeId,
			tableId: t2._id,
			email: 'reservation@example.com',
			name: 'Reservation Name',
			start: dayjs.utc(start, 'YYYYMMDDHHmm').toDate(),
			end: dayjs.utc(end, 'YYYYMMDDHHmm').toDate(),
			isCancelled: false,
		});

		const r3 = await Reservations.create({
			userId: null,
			storeId: storeId,
			tableId: t3._id,
			email: 'reservation@example.com',
			name: 'Reservation Name',
			start: dayjs.utc(start, 'YYYYMMDDHHmm').toDate(),
			end: dayjs.utc(end, 'YYYYMMDDHHmm').toDate(),
			isCancelled: false,
		});
		const response = await request
			.delete(`/api/${apiVersion}/mod/store/${storeId}`)
			.set('Cookie', cookie);

		expect(response.status).toBe(200);
		expect(response.body.success).toBe(true);
		expect(response.body.msg).toBe('srv_store_deleted');

		const findT1 = await Tables.findById(t1._id);
		const findT2 = await Tables.findById(t2._id);
		const findT3 = await Tables.findById(t3._id);

		expect(findT1).toBe(null);
		expect(findT2).toBe(null);
		expect(findT3).toBe(null);

		const findR1 = await Reservations.findById(r1._id);
		const findR2 = await Reservations.findById(r2._id);
		const findR3 = await Reservations.findById(r3._id);

		expect(findR1).toBe(null);
		expect(findR2).toBe(null);
		expect(findR3).toBe(null);
	});
});
