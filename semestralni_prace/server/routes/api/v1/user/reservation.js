import { Router } from 'express';
import { fetchReservationsOfUser } from '../../../../controllers/v1/user/reservation.js';

export const router = Router();

router.get('/reservations', fetchReservationsOfUser);
