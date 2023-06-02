import express, { Request, Response, NextFunction } from 'express';
import {
    createReservation
} from '../controllers/reservations-controller';

const postRouter = express.Router();
const router = express.Router();

// 예약 생성
router.post('/', createReservation);


export default router;
