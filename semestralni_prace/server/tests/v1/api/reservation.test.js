import supertest from 'supertest';
import app from '../../../app.js';
import Users from '../../../models/users.js';
import Stores from '../../../models/stores.js';
import Reservations from '../../../models/reservations.js';
import bcrypt from 'bcryptjs';
import * as db from '../../db.js';
import dayjs from 'dayjs';
import Tables from '../../../models/tables.js';
import jwt from 'jsonwebtoken';
import { CONFIG } from '../../../config/config.js';

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

describe(`Reservation merchant on opened store`, () => {
	let user,
		user2,
		store,
		store2,
		table,
		table2,
		table3,
		reservation,
		reservation2;

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
					isOpen: false,
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

		table3 = await Tables.create({
			name: 'Test Table 3',
			person: 2,
			isAvailable: false,
			storeId: store._id,
		});

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
			isCancelled: true,
		});
	});

	test('should fetch reservation by ID', async () => {
		const response = await request.get(
			`/api/${apiVersion}/reservation/${reservation._id}`
		);

		expect(response.status).toBe(200);
		expect(response.body.success).toBe(true);
		expect(response.body.msg._id).toBe(reservation._id.toString());
		expect(response.body.msg.store.name).toBe(store.name);
		expect(response.body.msg.table.name).toBe(table.name);
	});

	test('should not found reservation', async () => {
		const response = await request.get(
			`/api/${apiVersion}/reservation/665afa570e49b003942d1ff0`
		);

		expect(response.status).toBe(404);
		expect(response.body.success).toBe(false);
	});

	test('should add new reservation for nonexisting user', async () => {
		const start = dayjs()
			.add(2, 'days')
			.set('hour', 10)
			.set('minute', 0)
			.format('YYYYMMDDHHmm');
		const end = dayjs()
			.add(2, 'days')
			.set('hour', 12)
			.set('minute', 0)
			.format('YYYYMMDDHHmm');

		const newReservation = {
			tableId: table._id.toString(),
			email: 'tesssss@gmai.com',
			name: 'New Reservation',
			start,
			end,
		};

		const response = await request
			.post(`/api/${apiVersion}/reservation`)
			.send(newReservation);

		expect(response.status).toBe(200);
		expect(response.body.success).toBe(true);
		expect(response.body.msg.userId).toBeNull();
	});

	test('should add new reservation for existing user', async () => {
		const start = dayjs()
			.add(2, 'days')
			.set('hour', 10)
			.set('minute', 0)
			.format('YYYYMMDDHHmm');
		const end = dayjs()
			.add(2, 'days')
			.set('hour', 12)
			.set('minute', 0)
			.format('YYYYMMDDHHmm');

		const newReservation = {
			tableId: table._id.toString(),
			email: user.email,
			name: 'New Reservation',
			start,
			end,
		};

		const response = await request
			.post(`/api/${apiVersion}/reservation`)
			.send(newReservation);

		expect(response.status).toBe(200);
		expect(response.body.success).toBe(true);
		expect(response.body.msg.userId).toBe(user._id.toString());
	});

	test('should check closed store', async () => {
		const start = dayjs()
			.add(2, 'days')
			.set('hour', 10)
			.set('minute', 0)
			.format('YYYYMMDDHHmm');
		const end = dayjs()
			.add(2, 'days')
			.set('hour', 12)
			.set('minute', 0)
			.format('YYYYMMDDHHmm');

		const newReservation = {
			tableId: table2._id.toString(),
			email: user.email,
			name: 'New Reservation',
			start,
			end,
		};

		const response = await request
			.post(`/api/${apiVersion}/reservation`)
			.send(newReservation);

		expect(response.status).toBe(400);
		expect(response.body.success).toBe(false);
	});
	test('should check disabled table', async () => {
		const start = dayjs()
			.add(2, 'days')
			.set('hour', 10)
			.set('minute', 0)
			.format('YYYYMMDDHHmm');
		const end = dayjs()
			.add(2, 'days')
			.set('hour', 12)
			.set('minute', 0)
			.format('YYYYMMDDHHmm');

		const newReservation = {
			tableId: table3._id.toString(),
			email: user.email,
			name: 'New Reservation',
			start,
			end,
		};

		const response = await request
			.post(`/api/${apiVersion}/reservation`)
			.send(newReservation);

		expect(response.status).toBe(404);
		expect(response.body.success).toBe(false);
	});

	test('should check invalid time reservation', async () => {
		const start = dayjs()
			.add(2, 'days')
			.set('hour', 10)
			.set('minute', 0)
			.format('YYYYMMDDHHmm');
		const end = dayjs()
			.add(2, 'days')
			.set('hour', 10)
			.set('minute', 0)
			.format('YYYYMMDDHHmm');

		const newReservation = {
			tableId: table._id.toString(),
			email: 'newreservation@example.com',
			name: 'New Reservation',
			start,
			end,
		};

		const response = await request
			.post(`/api/${apiVersion}/reservation`)
			.send(newReservation);

		expect(response.status).toBe(400);
		expect(response.body.success).toBe(false);
	});
	test('should check bad input', async () => {
		const start = dayjs()
			.add(2, 'days')
			.set('hour', 10)
			.set('minute', 0)
			.format('YYYYMMDDHHmm');
		const end = dayjs()
			.add(2, 'days')
			.set('hour', 10)
			.set('minute', 0)
			.format('YYYYMMDDHHmm');

		const newReservation = {
			tableId: table._id.toString(),
			email: 'newreservation@',
			name: 'New Reservation',
			start,
			end,
		};

		const response = await request
			.post(`/api/${apiVersion}/reservation`)
			.send(newReservation);

		expect(response.status).toBe(400);
		expect(response.body.success).toBe(false);
	});
	test('should check bad input', async () => {
		const start = dayjs()
			.add(2, 'days')
			.set('hour', 10)
			.set('minute', 0)
			.format('YYYYMMDDHHmm');
		const end = dayjs()
			.add(2, 'days')
			.set('hour', 10)
			.set('minute', 0)
			.format('YYYYMMDDHHmm');

		const newReservation = {
			tableId: table._id.toString(),
			email: 'newreservation@example.com',
			name: 'New Reservation',
			start,
			end,
			haha: 'haha',
		};

		const response = await request
			.post(`/api/${apiVersion}/reservation`)
			.send(newReservation);

		expect(response.status).toBe(400);
		expect(response.body.success).toBe(false);
	});

	test('should check exists', async () => {
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

		const newReservation = {
			tableId: table._id.toString(),
			email: 'newreservation@example.com',
			name: 'New Reservation',
			start,
			end,
		};

		const response = await request
			.post(`/api/${apiVersion}/reservation`)
			.send(newReservation);

		expect(response.status).toBe(409);
		expect(response.body.success).toBe(false);
	});

	test('should send reservation cancellation token', async () => {
		const response = await request.get(
			`/api/${apiVersion}/reservation/cancel/${reservation._id}`
		);

		expect(response.status).toBe(200);
		expect(response.body.success).toBe(true);
		expect(typeof response.body.msg).toBe('string');

		const decoded = jwt.verify(response.body.msg, CONFIG.JWT_SECRET);
		expect(decoded.reservationId).toBe(reservation._id.toString());
	});

	test('should check cancelled reservation', async () => {
		const response = await request.get(
			`/api/${apiVersion}/reservation/cancel/${reservation2._id}`
		);

		expect(response.status).toBe(400);
		expect(response.body.success).toBe(false);
	});

	test('should cancel a reservation', async () => {
		const token = jwt.sign(
			{ reservationId: reservation._id },
			CONFIG.JWT_SECRET,
			{
				expiresIn: '30m',
			}
		);

		const response = await request.put(
			`/api/${apiVersion}/reservation/cancel/${token}`
		);

		expect(response.status).toBe(200);
		expect(response.body.success).toBe(true);
		expect(response.body.msg).toBe('srv_reservation_cancelled');

		const cancelledReservation = await Reservations.findById(reservation._id);
		expect(cancelledReservation.isCancelled).toBe(true);
	});

	test('should check canceled reservation', async () => {
		const token = jwt.sign(
			{ reservationId: reservation2._id },
			CONFIG.JWT_SECRET,
			{
				expiresIn: '30m',
			}
		);

		const response = await request.put(
			`/api/${apiVersion}/reservation/cancel/${token}`
		);

		expect(response.status).toBe(400);
		expect(response.body.success).toBe(false);
	});

	test('should fetch day reservations', async () => {
		const day1 = dayjs('15/06/2024', 'DD/MM/YYYY');

		const start = day1.set('hour', 9).set('minute', 0);
		const end = day1.set('hour', 10).set('minute', 0);

		await Reservations.create({
			userId: user._id,
			storeId: store._id,
			tableId: table._id,
			email: 'reservation@example.com',
			name: 'Reservation Name',
			start: start.toDate(),
			end: end.toDate(),
			isCancelled: false,
		});

		await Reservations.create({
			userId: user._id,
			storeId: store._id,
			tableId: table._id,
			email: 'reservation@example.com',
			name: 'Reservation Name',
			start: start.add(1, 'hour').toDate(),
			end: end.add(1, 'hour').toDate(),
			isCancelled: false,
		});

		const response = await request
			.post(`/api/${apiVersion}/reservations`)
			.send({
				date: day1.format('YYYYMMDD'),
				storeId: store._id.toString(),
			});

		expect(response.status).toBe(200);
		expect(response.body.success).toBe(true);
		expect(response.body.msg).toHaveLength(2);
	});

	test('should not fetch day reservations, return 400 bad input', async () => {
		const day1 = dayjs('15/06/2024', 'DD/MM/YYYY');
		const response = await request
			.post(`/api/${apiVersion}/reservations`)
			.send({
				date: day1.format('YYYYMMDDHHmm'),
				storeId: store._id.toString(),
			});

		expect(response.status).toBe(400);
		expect(response.body.success).toBe(false);
	});
	test('should not fetch day reservations, return 400 bad input', async () => {
		const day1 = dayjs('15/06/2024', 'DD/MM/YYYY');
		const response = await request
			.post(`/api/${apiVersion}/reservations`)
			.send({
				date: day1.format('YYYYMMDDHHmm'),
			});

		expect(response.status).toBe(400);
		expect(response.body.success).toBe(false);
	});
});
