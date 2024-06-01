import { Router } from 'express';
import {
	addTable,
	deleteTable,
	fetchTable,
	fetchTablesOfStore,
	updateTable,
} from '../../../../controllers/v1/mod/tables.js';

export const router = Router();

router.get('/tables/:storeId', fetchTablesOfStore);
router.get('/table/:tableId', fetchTable);

router.put('/table', updateTable);

router.post('/table', addTable);

router.delete('/table/:tableId', deleteTable);
