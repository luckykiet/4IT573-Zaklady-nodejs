import { Router } from 'express';
import {
	deleteReservation,
	fetchReservationsOfAllStores,
	fetchReservationsOfStore,
	updateCustomerReservation,
} from '../../../../controllers/v1/mod/reservation.js';

export const router = Router();

router.get('/reservations', fetchReservationsOfAllStores);
router.get('/reservations/store/:storeId', fetchReservationsOfStore);

router.put('/reservation', updateCustomerReservation);
router.delete('/reservation/:reservationId', deleteReservation);
