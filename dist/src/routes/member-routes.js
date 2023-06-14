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
const express_1 = __importDefault(require("express"));
const member2_controller_1 = require("../controllers/member2_controller");
const checkAuth = require('../middlewares/check-auth');
const router = express_1.default.Router();
//로그인
router.post('/login', member2_controller_1.loginUser);
//회원가입
router.post('/register', member2_controller_1.createUser);
//로그아웃
router.post('/logout', member2_controller_1.logout); //checkAuth 필요?
//기존유저인지조회
router.get('/existuser-check', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.query;
    try {
        const result = yield (0, member2_controller_1.checkExistingUser)(email);
        res.json(result);
    }
    catch (error) {
        console.error('An error occurred:', error);
        res.status(500).json({ error: '유효한 유저가 아닙니다.' });
    }
}));
//유저게시물조회
router.get('/posts', checkAuth, member2_controller_1.getMemberPosts);
//유저탈퇴
router.post('/delete', checkAuth, member2_controller_1.deleteMember);
exports.default = router;
