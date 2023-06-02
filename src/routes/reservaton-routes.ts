import express, { Request, Response, NextFunction } from 'express';
import {
    createReservation, seatCheck
} from '../controllers/reservations-controller';

const postRouter = express.Router();
const router = express.Router();

// 예약 생성
router.post('/', createReservation);

// 좌석 조회
router.get('/seat-check', seatCheck);

export default router;
