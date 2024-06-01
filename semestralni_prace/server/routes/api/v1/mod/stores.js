import { Router } from 'express';
import {
	fetchOwnStores,
	fetchUserStoreWithTables,
	deleteStore,
	updateStore,
	addStore,
} from '../../../../controllers/v1/mod/stores.js';

export const router = Router();

router.get('/stores', fetchOwnStores);
router.get('/store/:storeId', fetchUserStoreWithTables);

router.post('/store', addStore);

router.put('/store', updateStore);

router.delete('/store/:storeId', deleteStore);
