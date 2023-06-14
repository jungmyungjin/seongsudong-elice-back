"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const reservations_controller_1 = require("../controllers/reservations-controller");
const checkAuth = require('../middlewares/check-auth');
const router = express_1.default.Router();
// 예약 생성
router.post('/', checkAuth, reservations_controller_1.createReservation);
// 좌석 조회
router.get('/seat-check', reservations_controller_1.seatCheck);
// 예약 취소(일반사용자)
router.delete('/cancel-reservation', checkAuth, reservations_controller_1.cancelReservation);
// 내 예약 조회
router.get('/reservation-check', checkAuth, reservations_controller_1.getMyReservation);
// 다른이메일로 예약정보 받기
router.post('/send-email', checkAuth, reservations_controller_1.sendEmailToUser);
exports.default = router;
