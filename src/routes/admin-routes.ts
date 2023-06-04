import express, { Request, Response, NextFunction } from 'express';
import { isAdmin } from '../middlewares/isAdmin'
import passport from 'passport';
import { getUserReservations } from '../controllers/admin-controllers';

const router = express.Router();

// 어드민페이지 
router.get('/', isAdmin as any, (req, res) => {
    // isAdmin 미들웨어를 통과한 경우에만 실행됨
    res.send('관리자 페이지');
});

router.get('/reservations/:date', getUserReservations)

export default router;