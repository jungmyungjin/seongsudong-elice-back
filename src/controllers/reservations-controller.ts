import { Request, Response, NextFunction } from 'express';
import { RowDataPacket } from 'mysql2/promise';
import con from '../../connection';
import { v4 as uuidv4 } from 'uuid';
import { sendEmail } from '../utils/send-email';
import { ExtendedRequest } from '../types/checkAuth';



// 예약 생성
export const createReservation = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const {
            member_generation,
            member_name,
            member_email,
            reservation_date,
            start_time,
            end_time,
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
        const seat: RowDataPacket | undefined = (seatRows as RowDataPacket[])[0];

        if (!seat) {
            return res.status(400).json({ error: '잘못된 좌석 번호입니다.' });
        }

        // 예약 가능 여부 확인
        const originalCurrentDate = new Date();
        const year = originalCurrentDate.getFullYear();
        const month = String(originalCurrentDate.getMonth() + 1).padStart(2, '0');
        const day = String(originalCurrentDate.getDate()).padStart(2, '0');
        const hours = String(originalCurrentDate.getHours()).padStart(2, '0');
        const minutes = String(originalCurrentDate.getMinutes()).padStart(2, '0');

        const currentDate = `${year}-${month}-${day} ${hours}:${minutes}`;
        const selectedDate = reservation_date + ' ' + end_time

        if (selectedDate < currentDate) {
            return res.status(400).json({ error: '지난 날짜로 예약을 생성할 수 없습니다.' });
        }

        // 해당 좌석의 중복 예약 확인
        const checkDuplicateQuery = `
            SELECT *
            FROM reservations
            WHERE seat_number = ? AND reservation_date = ? AND start_time <= ? AND end_time >= ?
        `;

        const [duplicateRows] = await con
            .promise()
            .query(checkDuplicateQuery, [seat_number, reservation_date, start_time, end_time]);

        if (Array.isArray(duplicateRows) && duplicateRows.length > 0) {
            return res.status(400).json({ error: '해당 좌석은 이미 예약된 좌석입니다.' });
        }

        // 예약 생성
        const reservation_id = uuidv4();

        const createReservationQuery = `
        INSERT INTO reservations (
          reservation_id,
          generation,
          name,
          member_email,
          reservation_date,
          start_time,
          end_time,
          visitors,
          seat_number,
          seat_type,
          status
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

        const createReservationParams = [
            reservation_id,
            member_generation,
            member_name,
            member_email,
            reservation_date,
            start_time,
            end_time,
            visitors,
            seat_number,
            seat_type,
            '예약완료' // 
        ];

        await con.promise().query(createReservationQuery, createReservationParams);

        // 이메일 보내기
        const emailText = `성수동 엘리스를 이용해 주셔서 감사합니다. \n \n${member_name}님의 엘리스랩 예약이 아래와 같이 완료되었습니다.\n예약 ID: ${reservation_id} \n예약일자: ${reservation_date} ${start_time}~${end_time} \n예약좌석: ${seat_type} ${seat_number}번 \n\n예약시간을 꼭 지켜주세요.`;
        const emailSubject = '성수동 엘리스 예약이 완료되었습니다.';
        const receiver = member_email;
        sendEmail(receiver, emailSubject, emailText)
        // 예약 정보 조회
        const getReservationQuery = `
            SELECT *
            FROM reservations
            WHERE reservation_id = ?
        `;
        const [reservationRows] = await con.promise().query<RowDataPacket[]>(getReservationQuery, [reservation_id]);
        const reservation: RowDataPacket | undefined = (reservationRows as RowDataPacket[])[0];

        return res.status(201).json({ message: '예약이 완료되었습니다.', reservation: reservation });
    } catch (err) {
        return Promise.reject(err);
    }
};

// 좌석조회
export const seatCheck = async (req: Request, res: Response): Promise<{ [seatNumber: string]: any } | Response> => {
    try {
        const { reservation_date } = req.query;

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
        reservations.forEach((reservation: RowDataPacket) => {
            const startTime = reservation.start_time;
            const endTime = reservation.end_time;
            const seatNumber = reservation.seat_number;

            if (startTime <= '10:00' && endTime >= '14:00') {
                seatAvailability[seatNumber].available10to14 = false;
            }

            if (startTime <= '14:00' && endTime >= '18:00') {
                seatAvailability[seatNumber].available14to18 = false;
            }

            if (startTime <= '18:00' && endTime >= '22:00') {
                seatAvailability[seatNumber].available18to22 = false;
            }
        });
        return res.status(200).json(seatAvailability);
    } catch (err) {
        return Promise.reject(err);
    }
};

// 예약 취소(일반사용자)
export const cancelReservation = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const email = (req as ExtendedRequest).user.email;

    // 로그인 확인
    if (!email) {
        return res.status(500).json({ message: '로그인이 필요한 기능입니다.' });
    }
    try {
        const { reservationId, email } = req.body;

        // 예약 정보 조회
        const getReservationQuery = `
            SELECT *
            FROM reservations
            WHERE reservation_id = ?
        `;
        const [reservationRows] = await con.promise().query<RowDataPacket[]>(getReservationQuery, [reservationId]);
        const reservation: RowDataPacket | undefined = (reservationRows as RowDataPacket[])[0];

        // 예약이 존재하지 않을 경우
        if (!reservation || !reservationRows.length) {
            return res.status(404).json({ error: '예약을 찾을 수 없습니다.' });
        }

        // 예약자와 로그인된 사용자의 이메일 비교
        const isMyReservation = reservation.member_email === email;

        // 현재 날짜와 예약된 날짜 비교 
        const originalCurrentDate = new Date();
        const year = originalCurrentDate.getFullYear();
        const month = String(originalCurrentDate.getMonth() + 1).padStart(2, '0');
        const day = String(originalCurrentDate.getDate()).padStart(2, '0');

        const currentDate = `${year}-${month}-${day}`;
        const reservationDate = reservation.reservation_date;

        // 현재시간
        const options = { timeZone: 'Asia/Seoul', hour12: false };
        const currentTime = new Date().toLocaleTimeString('en-US', options);

        // 예약 체크인 시간
        const checkInTime = reservation.start_time + ':00';

        // 예약 날짜와 현재 날짜, 체크인 시간과 현재 시간을 비교하여 처리
        if (reservationDate < currentDate || (reservationDate === currentDate && currentTime > checkInTime)) {
            return res.status(400).json({ error: '지난 예약은 취소할 수 없습니다.' });
        }

        // 일반 사용자는 자신의 예약만 삭제 가능
        if (isMyReservation) {
            // 예약 삭제
            const deleteReservationQuery = `
            DELETE FROM reservations
            WHERE reservation_id = ?
          `;
            await con.promise().query(deleteReservationQuery, [reservationId]);

            return res.status(200).json({ message: '예약이 삭제되었습니다.' });
        }
        // 권한이 없는 경우
        return res.status(403).json({ error: '내 예약만 삭제할 수 있습니다.' });
    } catch (err) {
        return Promise.reject(err);
    }
};

// 내 예약 조회
export const getMyReservation = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        //토큰이메일
        const email = (req as ExtendedRequest).user.email;
        //쿼리이메일
        const userEmail = req.query.member_email;
        if (email !== userEmail) {
            throw new Error('내 예약만 조회할 수 있습니다.');
        }
        // 현재 날짜와 예약된 날짜 비교 
        const originalCurrentDate = new Date();
        const year = originalCurrentDate.getFullYear();
        const month = String(originalCurrentDate.getMonth() + 1).padStart(2, '0');
        const day = String(originalCurrentDate.getDate()).padStart(2, '0');
        const currentDate = `${year}-${month}-${day}`;

        // 현재시간
        const options = { timeZone: 'Asia/Seoul', hour12: false };
        const currentTime = new Date().toLocaleTimeString('en-US', options);

        const currentDateTime = currentDate + ' ' + currentTime;

        // 지난 예약 조회
        const pastReservationsQuery = `
            SELECT *
            FROM reservations
            WHERE member_email = ? AND CONCAT(reservation_date, ' ', start_time, ':00') < ?
        `;

        const [pastReservationRows] = await con.promise().query<RowDataPacket[]>(pastReservationsQuery, [
            email,
            currentDateTime,
        ]);
        const pastReservations: RowDataPacket[] = pastReservationRows;

        // 다가오는 예약 조회
        const upcomingReservationsQuery = `
            SELECT *
            FROM reservations
            WHERE member_email = ? AND CONCAT(reservation_date, ' ', start_time, ':00') >= ?
        `;
        const [upcomingReservationRows] = await con.promise().query<RowDataPacket[]>(upcomingReservationsQuery, [
            email,
            currentDateTime,
        ]);
        const upcomingReservations: RowDataPacket[] = upcomingReservationRows;

        return res.status(200).json({ pastReservations, upcomingReservations });
    } catch (err) {
        return Promise.reject(err)
    }
};

// 다른 이메일로 예약정보 받기
export const sendEmailToUser = async (
    req: Request,
    res: Response
) => {
    const newEmail = req.body.email;
    const reservationId = req.body.reservationId;

    try {
        // 예약 정보 조회
        const getReservationQuery = `
            SELECT *
            FROM reservations
            WHERE reservation_id = ? 
        `;
        const [reservationRows] = await con.promise().query<RowDataPacket[]>(getReservationQuery, [reservationId]);
        const reservation: RowDataPacket | undefined = (reservationRows as RowDataPacket[])[0];

        // 예약이 존재하지 않을 경우
        if (!reservation || !reservationRows.length) {
            return res.status(404).json({ error: '예약을 찾을 수 없습니다.' });
        }
        // 이메일 보내기
        const emailText = `성수동 엘리스를 이용해 주셔서 감사합니다. \n \n${reservation.name}님의 엘리스랩 예약이 아래와 같이 완료되었습니다.\n예약 ID: ${reservation.reservation_id} \n예약일자: ${reservation.reservation_date} ${reservation.start_time}~${reservation.end_time} \n예약좌석: ${reservation.seat_type} ${reservation.seat_number}번 \n\n예약시간을 꼭 지켜주세요.`;
        const emailSubject = '성수동 엘리스 예약이 완료되었습니다.';
        const receiver = newEmail;
        sendEmail(receiver, emailSubject, emailText)
        return res.status(200).json({ message: '메일 전송이 완료되었습니다.' });
    }
    catch (err) {
        return Promise.reject(err)
    }
};

// 날짜별 이용자 수 조회 
export const getReservationCountByDate = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { date } = req.params;

        // 날짜 형식 검증
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(date)) {
            return res.status(400).json({ error: '잘못된 날짜 형식입니다.' });
        }

        // 예약 건 수 조회 쿼리
        const getReservationCountQuery = `
        SELECT COUNT(*) AS count
        FROM reservations
        WHERE reservation_date = ?
      `;
        const [countRows] = await con.promise().query<RowDataPacket[]>(getReservationCountQuery, [date]);
 
        let personalSeatCount = 0;
        let groupSeatCount = 0;


        // 예약 건 수 계산
        const getReservationDetailsQuery = `
        SELECT seat_type, seat_number
        FROM reservations
        WHERE reservation_date = ?
      `;
        const [reservationRows] = await con.promise().query<RowDataPacket[]>(getReservationDetailsQuery, [date]);
        const reservations = reservationRows as RowDataPacket[];

        for (const reservation of reservations) {
            const seatType = reservation.seat_type;
            const seatNumber = reservation.seat_number;

            if (seatType === '개인석' || seatType === '수료기수석') {
                personalSeatCount += 1;
            }

            if ([31, 33, 35, 37, 49, 51, 53].includes(seatNumber)) {
                groupSeatCount += 4;
            }

            if (seatNumber === 'A') {
                groupSeatCount += 6;
            }

            if (seatNumber === 'B') {
                groupSeatCount += 10;
            }

            if ([32, 34, 36, 38].includes(seatNumber)) {
                groupSeatCount += 2;
            }
        }

        // 총 이용자 수 계산
        const totalUserCount = personalSeatCount + groupSeatCount;

        return res.status(200).json({ totalUserCount: totalUserCount });
    } catch (err) {
        return Promise.reject(err)
    }
};

// 날짜별 예약 건수 조회
export const getUserReservationCount = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { date } = req.params;

        // 날짜 형식 검증
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(date)) {
            return res.status(400).json({ error: '잘못된 날짜 형식입니다.' });
        }

        // 예약 건 수 조회 쿼리
        const getReservationCountQuery = `
            SELECT COUNT(*) AS count
            FROM reservations
            WHERE reservation_date = ?
        `;
        const [countRows] = await con.promise().query<RowDataPacket[]>(getReservationCountQuery, [date]);
        const count = countRows[0].count;

        return res.status(200).json({ count });
    } catch (err) {
        return Promise.reject(err)
    }
};
