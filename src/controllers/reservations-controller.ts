import { Request, Response, NextFunction } from 'express';
import { RowDataPacket } from 'mysql2/promise';

import con from '../../connection';
import { v4 as uuidv4 } from 'uuid';


// 예약 생성
export const createReservation = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const {
            member_generation,
            member_name,
            member_email,
            reservation_date,
            start_time,
            end_time,
            num_of_guests,
            visitors,
            seat_number,
            seat_type
        } = req.body;

        // 좌석 유효성 검사
        const getSeatQuery = `
            SELECT *
            FROM seats
            WHERE seat_number = ?
        `;

        const [seatRows] = await con.promise().query(getSeatQuery, [seat_number]);
        const seat: RowDataPacket = (seatRows as RowDataPacket[])[0];
        //위 코드에서 빈배열이면어떻게 될까요? 바로 서버가 꺼지는건지 궁금합니다.

        if (!seat) {
            return res.status(400).json({ error: 'Invalid seat number' });
        }

        // 예약 생성
        const reservation_id = uuidv4();

        const createReservationQuery = `
        INSERT INTO reservations (
            reservation_id,
            member_generation,
            member_name,
            member_email,
            reservation_date,
            start_time,
            end_time,
            num_of_guests,
            visitors,
            seat_number,
            seat_type,
            status
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, '예약완료')
        `;
        await con.promise().query(createReservationQuery, [
            reservation_id,
            member_generation,
            member_name,
            member_email,
            reservation_date,
            start_time,
            end_time,
            num_of_guests,
            visitors,
            seat_number,
            seat_type
        ]);

        const getReservationQuery = `
      SELECT
      reservation_id,
        member_generation,
        member_name,
        member_email,
        reservation_date,
        start_time,
        end_time,
        num_of_guests,
        visitors,
        seat_number,
        seat_type,
        status,
        created_at
      FROM reservations
      WHERE reservation_id = ?
    `;
        const [reservationRows] = await con.promise().query(getReservationQuery, [
            reservation_id,
        ]);
        const reservation: RowDataPacket | undefined = (reservationRows as RowDataPacket[])[0];

        return res.status(200).json(reservation);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal server error' });
    }
};
