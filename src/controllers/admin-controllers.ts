import { Request, Response, NextFunction } from 'express';
import { isAdmin } from '../middlewares/isAdmin';
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

//관리자 예약 취소
export const cancelReservationByAdmin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { reservationId } = req.params;

        // 예약 조회 전에 미들웨어 사용 - isAdmin
        //isAdmin(req, res, async () => {
        // 예약 정보 조회
        const getReservationQuery = `
                SELECT *
                FROM reservations
                WHERE reservation_id = ?;
            `;
        const [reservationRows] = await con.promise().query<RowDataPacket[]>(getReservationQuery, [reservationId]);
        const reservation = reservationRows[0] as RowDataPacket;

        if (!reservation) {
            return res.status(404).json({ error: '예약을 찾을 수 없습니다.' });
        }

        // 현재 날짜와 예약된 날짜 비교
        const currentDate = new Date();
        const reservationDate = new Date(reservation.reservation_date);

        if (reservationDate < currentDate) {
            return res.status(403).json({ error: '지난 예약은 취소할 수 없습니다.' });
        }

        // 예약 취소
        const cancelReservationQuery = `
                DELETE FROM reservations
                WHERE reservation_id = ?;
            `;

        await con.promise().query(cancelReservationQuery, [reservationId]);

        return res.status(200).json({ message: '예약이 성공적으로 취소되었습니다.' });
        //});
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: '내부 서버 오류' });
    }
};