import express, { Request, Response, NextFunction } from 'express';
import {
    createReservation, seatCheck, getMyReservation, cancelReservation, sendEmailToUser
} from '../controllers/reservations-controller';
import { sendEmail } from '../utils/send-email'
const checkAuth = require('../middlewares/check-auth');
const router = express.Router();

//router.use(checkAuth);

// 예약 생성
router.post('/', createReservation);

// 좌석 조회
router.get('/seat-check', seatCheck);

// 예약 취소(일반사용자)
router.delete('/cancel-reservation', cancelReservation);

// 내 예약 조회
router.get('/reservation-check', getMyReservation);

// 다른이메일로 예약정보 받기
router.post('/send-email', sendEmailToUser);

export default router;
