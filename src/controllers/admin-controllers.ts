import { Request, Response, NextFunction } from 'express';
import { checkExistingUser } from './members-controllers';
import { isAdmin } from '../middlewares/isAdmin';
import passport from 'passport';
import { Strategy as GoogleStrategy, Profile } from 'passport-google-oauth20';
import { RowDataPacket } from 'mysql2/promise';
import con from '../../connection';


//관리자 날짜별 예약정보 조회
export const getUserReservations = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { date } = req.params;
        console.log('date', date)
        // 예약 조회 전에 미들웨어 사용 - isAdmin
        isAdmin(req, res, async () => {
            // 사용자가 관리자인 경우, 예약을 조회합니다.
            const getReservationsQuery = `
            SELECT *
            FROM reservations
            WHERE reservation_date = ?
            `;
            const [reservationRows] = await con.promise().query<RowDataPacket[]>(getReservationsQuery, [date]);
            const reservations = reservationRows as RowDataPacket[];
            console.log(reservations)
            return res.status(200).json({ reservations });
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: '내부 서버 오류' });
    }
};
