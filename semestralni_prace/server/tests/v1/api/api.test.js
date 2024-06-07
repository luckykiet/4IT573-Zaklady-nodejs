import supertest from 'supertest';
import app from '../../../app.js';
import * as db from '../../db.js';

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

test('test random API access', async () => {
	const response = await request.get(`/api/${apiVersion}`);
	expect(response.status).toBe(200);
});

test('test random API access', async () => {
	const response = await request.get('/random');
	expect(response.status).toBe(200);
});

test('test ping', async () => {
	const response = await request.get(`/api/${apiVersion}/ping`);
	expect(response.status).toBe(200);
});

test('test echo', async () => {
	const response = await request.get(`/api/${apiVersion}/echo`);
	expect(response.status).toBe(200);
});
