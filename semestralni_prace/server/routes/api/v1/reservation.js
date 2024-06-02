import { Router } from 'express';
import {
	addReservation,
	cancelReservation,
	fetchReservation,
	sendReservationToken,
} from '../../../controllers/v1/reservation.js';

export const router = Router();

router.get('/reservation/:reservationId', fetchReservation);
router.get('/reservation/cancelRequest/:reservationId', sendReservationToken);

router.post('/reservation', addReservation);
router.put('/reservation/cancel/:token', cancelReservation);
