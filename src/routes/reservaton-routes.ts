import express, { Request, Response, NextFunction } from 'express';
import {
    createReservation, seatCheck, getMyReservation, cancelReservation
} from '../controllers/reservations-controller';
import { sendEmail } from '../utils/send-email'

const postRouter = express.Router();
const router = express.Router();


// 좌석 조회
router.get('/seat-check', seatCheck);

// 예약 취소(일반사용자)
router.delete('/cancel-reservation', cancelReservation);

// 내 예약 조회
router.get('/reservation-check', getMyReservation);

export default router;
