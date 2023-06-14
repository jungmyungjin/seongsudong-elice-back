"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const admin_controllers_1 = require("../controllers/admin-controllers");
const checkAuth = require('../middlewares/check-auth');
const router = express_1.default.Router();
// 어드민페이지 
router.get('/', checkAuth, (req, res, next) => {
    const isAdmin = req.user.isAdmin;
    if (isAdmin === true) {
        return res.status(200).json({ message: '관리자 페이지에 접근하였습니다.' });
    }
    else {
        return res.status(403).json({ message: '권한이 없습니다.' });
    }
});
// 날짜별 예약조회
router.get('/reservations/:date', checkAuth, admin_controllers_1.getUserReservations);
// 날짜삭제
router.delete('/delete-reservation/:reservationId', checkAuth, admin_controllers_1.cancelReservationByAdmin);
exports.default = router;
