"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cancelReservationByAdmin = exports.getUserReservations = void 0;
const connection_1 = __importDefault(require("../../connection"));
//관리자 날짜별 예약정보 조회
const getUserReservations = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // 사용자를 쿠키에서 확인한 후, 관리자인 경우 예약을 조회
    const isAdmin = req.user.isAdmin;
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
            const [reservationRows] = yield connection_1.default.promise().query(getReservationsQuery, [date]);
            const reservations = reservationRows;
            console.log(reservations);
            return res.status(200).json({ reservations });
        }
        catch (err) {
            console.error(err);
            return res.status(500).json({ error: '내부 서버 오류' });
        }
    }
    else {
        return res.status(403).json({ message: '관리자만 예약을 조회할 수 있습니다.' });
    }
});
exports.getUserReservations = getUserReservations;
//관리자 예약 취소
const cancelReservationByAdmin = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // 사용자를 쿠키에서 확인한 후, 관리자인 경우에만 예약을 취소합니다.
    const isAdmin = req.user.isAdmin;
    if (isAdmin) {
        try {
            const { reservationId } = req.params;
            // 예약 정보 조회
            const getReservationQuery = `
                SELECT *
                FROM reservations
                WHERE reservation_id = ?;
            `;
            const [reservationRows] = yield connection_1.default.promise().query(getReservationQuery, [reservationId]);
            const reservation = reservationRows[0];
            if (!reservation) {
                return res.status(404).json({ error: '예약을 찾을 수 없습니다.' });
            }
            // 예약 취소
            const cancelReservationQuery = `
                DELETE FROM reservations
                WHERE reservation_id = ?;
            `;
            yield connection_1.default.promise().query(cancelReservationQuery, [reservationId]);
            return res.status(200).json({ message: '예약이 성공적으로 취소되었습니다.' });
        }
        catch (error) {
            return Promise.reject(error);
        }
    }
    else {
        return res.status(403).json({ message: '관리자만 예약을 취소할 수 있습니다.' });
    }
});
exports.cancelReservationByAdmin = cancelReservationByAdmin;
