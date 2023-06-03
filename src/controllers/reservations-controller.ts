import { Request, Response, NextFunction } from 'express';
import { RowDataPacket } from 'mysql2/promise';
import passport from '../middlewares/passport'

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

// 좌석조회
export const seatCheck = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { reservation_date } = req.query;
        console.log(reservation_date)

        // 예약 조회
        const getReservationsQuery = `
            SELECT *
            FROM reservations
            WHERE reservation_date = ?
        `;
        const [reservationRows] = await con.promise().query<RowDataPacket[]>(getReservationsQuery, [
            reservation_date,
        ]);
        const reservations: RowDataPacket[] = reservationRows;

        // 모든 좌석 정보 조회
        const getSeatsQuery = `
            SELECT seat_number, seat_type
            FROM seats
        `;
        const [seatRows] = await con.promise().query<RowDataPacket[]>(getSeatsQuery);
        const seats: RowDataPacket[] = seatRows;

        // 시간대별 예약 가능 여부 초기화
        const seatAvailability: { [seatNumber: string]: any } = {};

        // 시간대별로 예약 가능 여부와 좌석 번호를 저장하기 위해 좌석 정보를 초기화
        seats.forEach((seat: RowDataPacket) => {
            const seatNumber = seat.seat_number;
            seatAvailability[seatNumber] = {
                seat_type: seat.seat_type,
                available10to14: true,
                available14to18: true,
                available18to22: true
            };
        });

        // 예약된 좌석 확인
        console.log('예약좌석확인', reservations)
        reservations.forEach((reservation: RowDataPacket) => {
            const startTime = reservation.start_time;
            const endTime = reservation.end_time;
            const seatNumber = reservation.seat_number;
            console.log('시작시간: ', startTime, '종료시간: ', endTime)

            if (startTime <= '10:00:00' && endTime >= '14:00:00') {
                seatAvailability[seatNumber].available10to14 = false;
            }

            if (startTime <= '14:00:00' && endTime >= '18:00:00') {
                seatAvailability[seatNumber].available14to18 = false;
            }

            if (startTime <= '18:00:00' && endTime >= '22:00:00') {
                seatAvailability[seatNumber].available18to22 = false;
            }
        });



        return res.status(200).json(seatAvailability);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

// 내 예약 조회
export const getMyReservation = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        // 로그인된 사용자의 이메일 가져오기 *에러*
        //const userEmail = req.user.email;

        // 현재 날짜 및 시간
        const currentDate = new Date();

        // 지난 예약 조회
        const pastReservationsQuery = `
            SELECT *
            FROM reservations
            WHERE member_email = ? AND reservation_date < ?
        `;
        const [pastReservationRows] = await con.promise().query<RowDataPacket[]>(pastReservationsQuery, [
            //userEmail, *에러*
            currentDate,
        ]);
        const pastReservations: RowDataPacket[] = pastReservationRows;

        // 다가오는 예약 조회
        const upcomingReservationsQuery = `
            SELECT *
            FROM reservations
            WHERE member_email = ? AND reservation_date >= ?
        `;
        const [upcomingReservationRows] = await con.promise().query<RowDataPacket[]>(upcomingReservationsQuery, [
            //userEmail, *에러*
            currentDate,
        ]);
        const upcomingReservations: RowDataPacket[] = upcomingReservationRows;

        return res.status(200).json({ pastReservations, upcomingReservations });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal server error' });
    }
};