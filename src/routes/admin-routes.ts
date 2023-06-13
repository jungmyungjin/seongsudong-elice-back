import express, { Request, Response, NextFunction } from 'express';
import { getUserReservations, cancelReservationByAdmin } from '../controllers/admin-controllers';
import { ExtendedRequest } from '../types/checkAuth';
const checkAuth = require('../middlewares/check-auth');
const router = express.Router();

// 어드민페이지 
router.get('/', checkAuth, (req: Request, res: Response, next: NextFunction) => {
    const isAdmin = (req as ExtendedRequest).user.isAdmin;

    if (isAdmin === true) {
        return res.status(200).json({ message: '관리자 페이지에 접근하였습니다.' });
    } else {
        return res.status(403).json({ message: '권한이 없습니다.' });
    }
});

// 날짜별 예약조회
router.get('/reservations/:date', checkAuth, getUserReservations)

// 날짜삭제
router.delete('/delete-reservation/:reservationId', checkAuth, cancelReservationByAdmin)

export default router;
