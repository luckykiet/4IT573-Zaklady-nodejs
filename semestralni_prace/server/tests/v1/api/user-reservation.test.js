import supertest from 'supertest';
import app from '../../../app.js';
import Users from '../../../models/users.js';
import Stores from '../../../models/stores.js';
import Reservations from '../../../models/reservations.js';
import bcrypt from 'bcryptjs';
import * as db from '../../db.js';
import dayjs from 'dayjs';
import Tables from '../../../models/tables.js';

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
	let user,
		user2,
		store,
		store2,
		table,
		table2,
		reservation,
		reservation2,
		cookie;

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

		table = await Tables.create({
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

		// Login user
		const response = await request.post(`/api/${apiVersion}/auth`).send({
			email: 'test@example.com',
			password: 'password123',
		});

		cookie = response.headers['set-cookie'];

		const start = dayjs()
			.add(1, 'day')
			.set('hour', 15)
			.set('minute', 0)
			.format('YYYYMMDDHHmm');
		const end = dayjs()
			.add(1, 'day')
			.set('hour', 17)
			.set('minute', 0)
			.format('YYYYMMDDHHmm');

		reservation = await Reservations.create({
			userId: user._id,
			storeId: store._id,
			tableId: table._id,
			email: 'reservation@example.com',
			name: 'Reservation Name',
			start: dayjs(start, 'YYYYMMDDHHmm').toDate(),
			end: dayjs(end, 'YYYYMMDDHHmm').toDate(),
			isCancelled: false,
		});

		reservation2 = await Reservations.create({
			userId: user2._id,
			storeId: store2._id,
			tableId: table2._id,
			email: 'reservation@example.com',
			name: 'Reservation Name',
			start: dayjs(start, 'YYYYMMDDHHmm').toDate(),
			end: dayjs(end, 'YYYYMMDDHHmm').toDate(),
			isCancelled: false,
		});
	});

	afterEach(async () => {
		await logoutUser(cookie);
	});

	test('should fetch reservations of a user', async () => {
		const response = await request
			.get(`/api/${apiVersion}/user/reservations`)
			.set('Cookie', cookie);

		expect(response.status).toBe(200);
		expect(response.body.success).toBe(true);
		expect(response.body.msg.reservations).toHaveLength(1);
		expect(response.body.msg.stores).toHaveLength(1);
		expect(response.body.msg.tables).toHaveLength(1);
	});

	test('should fetch 2 of all reservations', async () => {
		const newStart = dayjs().add(1, 'day').set('hour', 16).set('minute', 0);
		const newEnd = dayjs().add(1, 'day').set('hour', 17).set('minute', 0);

		await Reservations.create({
			userId: user._id,
			storeId: store._id,
			tableId: table._id,
			email: 'reservation@example.com',
			name: 'Reservation Name',
			start: newStart.toDate(),
			end: newEnd.toDate(),
			isCancelled: true,
		});

		await Reservations.create({
			userId: user._id,
			storeId: store2._id,
			tableId: table2._id,
			email: 'reservation@example.com',
			name: 'Reservation Name',
			start: newStart.toDate(),
			end: newEnd.toDate(),
			isCancelled: false,
		});

		const response = await request
			.get(`/api/${apiVersion}/user/reservations`)
			.query({ limit: 2 })
			.set('Cookie', cookie);

		expect(response.status).toBe(200);
		expect(response.body.success).toBe(true);
		expect(response.body.msg.reservations).toHaveLength(2);
		expect(response.body.msg.stores).toHaveLength(2);
		expect(response.body.msg.tables).toHaveLength(2);
	});

	test('should fetch 2 reservations of incoming stores', async () => {
		const newStart = dayjs().add(1, 'day').set('hour', 16).set('minute', 0);
		const newEnd = dayjs().add(1, 'day').set('hour', 17).set('minute', 0);

		await Reservations.create({
			userId: user._id,
			storeId: store._id,
			tableId: table._id,
			email: 'reservation@example.com',
			name: 'Reservation Name',
			start: newStart.toDate(),
			end: newEnd.toDate(),
			isCancelled: true,
		});

		await Reservations.create({
			userId: user._id,
			storeId: store._id,
			tableId: table._id,
			email: 'reservation@example.com',
			name: 'Reservation Name',
			start: newStart.toDate(),
			end: newEnd.toDate(),
			isCancelled: false,
		});

		await Reservations.create({
			userId: user._id,
			storeId: store._id,
			tableId: table._id,
			email: 'reservation@example.com',
			name: 'Reservation Name',
			start: newStart.toDate(),
			end: newEnd.toDate(),
			isCancelled: false,
		});

		const response = await request
			.get(`/api/${apiVersion}/user/reservations`)
			.query({ limit: 2, types: 'incoming' })
			.set('Cookie', cookie);

		expect(response.status).toBe(200);
		expect(response.body.success).toBe(true);
		expect(response.body.msg.reservations).toHaveLength(2);
		expect(response.body.msg.stores).toHaveLength(1);
		expect(response.body.msg.tables).toHaveLength(1);
	});

	test('should fetch 2 reservations of cancelled stores', async () => {
		const newStart = dayjs().add(1, 'day').set('hour', 16).set('minute', 0);
		const newEnd = dayjs().add(1, 'day').set('hour', 17).set('minute', 0);

		await Reservations.create({
			userId: user._id,
			storeId: store._id,
			tableId: table._id,
			email: 'reservation@example.com',
			name: 'Reservation Name',
			start: newStart.toDate(),
			end: newEnd.toDate(),
			isCancelled: true,
		});

		await Reservations.create({
			userId: user._id,
			storeId: store._id,
			tableId: table._id,
			email: 'reservation@example.com',
			name: 'Reservation Name',
			start: newStart.toDate(),
			end: newEnd.toDate(),
			isCancelled: false,
		});

		await Reservations.create({
			userId: user._id,
			storeId: store._id,
			tableId: table._id,
			email: 'reservation@example.com',
			name: 'Reservation Name',
			start: newStart.toDate(),
			end: newEnd.toDate(),
			isCancelled: true,
		});

		const response = await request
			.get(`/api/${apiVersion}/user/reservations`)
			.query({ limit: 2, types: 'cancelled' })
			.set('Cookie', cookie);

		expect(response.status).toBe(200);
		expect(response.body.success).toBe(true);
		expect(response.body.msg.reservations).toHaveLength(2);
		expect(response.body.msg.stores).toHaveLength(1);
		expect(response.body.msg.tables).toHaveLength(1);
	});

	test('should fetch 3 reservations of expired and cancelled stores', async () => {
		const newStart = dayjs().add(1, 'day').set('hour', 16).set('minute', 0);
		const newEnd = dayjs().add(1, 'day').set('hour', 17).set('minute', 0);

		await Reservations.create({
			userId: user._id,
			storeId: store._id,
			tableId: table._id,
			email: 'reservation@example.com',
			name: 'Reservation Name',
			start: newStart.toDate(),
			end: newEnd.toDate(),
			isCancelled: true,
		});

		await Reservations.create({
			userId: user._id,
			storeId: store._id,
			tableId: table._id,
			email: 'reservation@example.com',
			name: 'Reservation Name',
			start: newStart.toDate(),
			end: newEnd.toDate(),
			isCancelled: false,
		});

		await Reservations.create({
			userId: user._id,
			storeId: store._id,
			tableId: table._id,
			email: 'reservation@example.com',
			name: 'Reservation Name',
			start: newStart.toDate(),
			end: newEnd.toDate(),
			isCancelled: true,
		});

		await Reservations.create({
			userId: user._id,
			storeId: store._id,
			tableId: table._id,
			email: 'reservation@example.com',
			name: 'Reservation Name',
			start: newStart.subtract(10, 'days').toDate(),
			end: newEnd.subtract(10, 'days').toDate(),
			isCancelled: false,
		});

		const response = await request
			.get(`/api/${apiVersion}/user/reservations`)
			.query({ limit: 3, types: 'cancelled;expired' })
			.set('Cookie', cookie);

		expect(response.status).toBe(200);
		expect(response.body.success).toBe(true);
		expect(response.body.msg.reservations).toHaveLength(3);
		expect(response.body.msg.stores).toHaveLength(1);
		expect(response.body.msg.tables).toHaveLength(1);
		response.body.msg.reservations.forEach((reservation) => {
			expect(reservation.userId).toBe(user._id.toString());
		});
	});
	test('should fetch 1 own reservation', async () => {
		const newStart = dayjs().add(1, 'day').set('hour', 16).set('minute', 0);
		const newEnd = dayjs().add(1, 'day').set('hour', 17).set('minute', 0);

		await Reservations.create({
			userId: user2._id,
			storeId: store._id,
			tableId: table._id,
			email: 'reservation@example.com',
			name: 'Reservation Name',
			start: newStart.toDate(),
			end: newEnd.toDate(),
			isCancelled: true,
		});

		await Reservations.create({
			userId: null,
			storeId: store._id,
			tableId: table._id,
			email: 'reservation@example.com',
			name: 'Reservation Name',
			start: newStart.toDate(),
			end: newEnd.toDate(),
			isCancelled: false,
		});

		await Reservations.create({
			userId: null,
			storeId: store._id,
			tableId: table._id,
			email: 'reservation@example.com',
			name: 'Reservation Name',
			start: newStart.toDate(),
			end: newEnd.toDate(),
			isCancelled: true,
		});

		await Reservations.create({
			userId: user2._id,
			storeId: store._id,
			tableId: table._id,
			email: 'reservation@example.com',
			name: 'Reservation Name',
			start: newStart.subtract(10, 'days').toDate(),
			end: newEnd.subtract(10, 'days').toDate(),
			isCancelled: false,
		});

		const response = await request
			.get(`/api/${apiVersion}/user/reservations`)
			.query({ limit: 3, types: 'all' })
			.set('Cookie', cookie);

		expect(response.status).toBe(200);
		expect(response.body.success).toBe(true);
		expect(response.body.msg.reservations).toHaveLength(1);
		expect(response.body.msg.stores).toHaveLength(1);
		expect(response.body.msg.tables).toHaveLength(1);
		response.body.msg.reservations.forEach((reservation) => {
			expect(reservation.userId).toBe(user._id.toString());
		});
	});
});
