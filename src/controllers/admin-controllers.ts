import { Request, Response, NextFunction } from 'express';
import { RowDataPacket } from 'mysql2/promise';
import con from '../../connection';
import { ExtendedRequest } from '../types/checkAuth';

//관리자 날짜별 예약정보 조회
export const getUserReservations = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // 사용자를 쿠키에서 확인한 후, 관리자인 경우 예약을 조회
  const isAdmin = (req as ExtendedRequest).user.isAdmin;

  if (isAdmin) {
    try {
      const { date } = req.params;
      console.log('date', date);

      // 관리자용 예약 조회 쿼리
      const getReservationsQuery = `
                SELECT *
                FROM reservations
                WHERE reservation_date = ?
            `;
      const [reservationRows] = await con
        .promise()
        .query<RowDataPacket[]>(getReservationsQuery, [date]);
      const reservations = reservationRows as RowDataPacket[];
      console.log(reservations);

      return res.status(200).json({ reservations });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: '내부 서버 오류' });
    }
  } else {
    return res
      .status(403)
      .json({ message: '관리자만 예약을 조회할 수 있습니다.' });
  }
};

//관리자 예약 취소
export const cancelReservationByAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // 사용자를 쿠키에서 확인한 후, 관리자인 경우에만 예약을 취소합니다.
  const isAdmin = (req as ExtendedRequest).user.isAdmin;

  if (isAdmin) {
    try {
      const { reservationId } = req.params;

      // 예약 정보 조회
      const getReservationQuery = `
                SELECT *
                FROM reservations
                WHERE reservation_id = ?;
            `;
      const [reservationRows] = await con
        .promise()
        .query<RowDataPacket[]>(getReservationQuery, [reservationId]);
      const reservation = reservationRows[0] as RowDataPacket;

      if (!reservation) {
        return res.status(404).json({ error: '예약을 찾을 수 없습니다.' });
      }

      // 예약 취소
      const cancelReservationQuery = `
                DELETE FROM reservations
                WHERE reservation_id = ?;
            `;

      await con.promise().query(cancelReservationQuery, [reservationId]);

      return res
        .status(200)
        .json({ message: '예약이 성공적으로 취소되었습니다.' });
    } catch (error) {
      return Promise.reject(error);
    }
  } else {
    return res
      .status(403)
      .json({ message: '관리자만 예약을 취소할 수 있습니다.' });
  }
};
