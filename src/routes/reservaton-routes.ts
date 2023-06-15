import express, { Request, Response, NextFunction } from 'express';
import {
    createReservation, seatCheck, getMyReservation, cancelReservation, sendEmailToUser, getReservationCountByDate, getUserReservationCount
} from '../controllers/reservations-controller';
const checkAuth = require('../middlewares/check-auth');
const router = express.Router();

// 예약 생성
router.post('/', checkAuth, createReservation);

// 좌석 조회
router.get('/seat-check', seatCheck);

// 예약 취소(일반사용자)
router.delete('/cancel-reservation', checkAuth, cancelReservation);

// 내 예약 조회
router.get('/reservation-check', checkAuth, getMyReservation);

// 다른이메일로 예약정보 받기
router.post('/send-email', checkAuth, sendEmailToUser);

// 날짜별 이용자 수 조회
router.get('/users/:date', getReservationCountByDate);

// 날짜별 예약건 수 조회
router.get('/:date', getUserReservationCount)

// 다른이메일로 예약정보 받기
router.post('/send-email', sendEmailToUser);

export default router;
