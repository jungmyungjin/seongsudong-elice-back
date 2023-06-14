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
exports.setUserExit = exports.setUserAccess = void 0;
const connection_1 = __importDefault(require("../../connection"));
// 로그인 시 유저의 접속 상태를 활성화하는 함수
const setUserAccess = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // 토큰 만료에 대하여
    // 쿠키 다루는 미들웨어에서 함께 구현해야함
    // 만료된 토큰 사용 -> 쿠키 미들웨어 -> 토큰 유효성 검사 -> False -> 로그아웃 실행
    // 관리자.
    // 일단 req.user
    const email = req.body.email;
    // 로그인 확인
    if (!email) {
        return res.status(500).json({ message: '로그인 유저가 아닙니다.' });
    }
    // 존재하는 유저인지 확인
    const searchUserQuery = `SELECT * FROM members WHERE email = ?`;
    try {
        const [userData] = (yield connection_1.default
            .promise()
            .query(searchUserQuery, email));
        if (userData.length === 0) {
            return res.status(500).json({ message: '등록된 회원이 아닙니다.' });
        }
    }
    catch (err) {
        res.status(500).json({ message: '유저 조회 중 에러가 발생했습니다.' });
        throw new Error(`Error searching member: ${err}`);
    }
    // 접속 데이터 on
    const accessQuery = 'INSERT INTO connection_status (member_email, isActive, lastSeenAt) VALUES (?, ?, NOW())';
    try {
        yield connection_1.default.promise().query(accessQuery, [email, true]);
        return res.status(201).json({ message: '엘리스에 입장하였습니다.' });
    }
    catch (err) {
        res.status(500).json({ message: '접속 처리 중 에러가 발생했습니다.' });
        // throw new Error(`Error processing access data: ${err}`);
        next(err);
    }
});
exports.setUserAccess = setUserAccess;
// 로그아웃 시 유저의 접속 상태를 비활성화하는 함수
const setUserExit = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const email = req.body.email;
    // 로그인한 유저인지 확인
    if (!email) {
        return res.status(500).json({ message: '로그인 유저가 아닙니다.' });
    }
    // 존재하는 유저인지 확인
    const searchUserQuery = `SELECT * FROM members WHERE email = ?`;
    try {
        const [userData] = (yield connection_1.default
            .promise()
            .query(searchUserQuery, email));
        if (userData.length === 0) {
            return res.status(500).json({ message: '등록된 회원이 아닙니다.' });
        }
    }
    catch (err) {
        res.status(500).json({ message: '유저 조회 중 에러가 발생했습니다.' });
        throw new Error(`Error searching member: ${err}`);
    }
    // 접속 데이터 delete
    const deleteAccessQuery = 'DELETE FROM connection_status WHERE member_email = ?';
    try {
        yield connection_1.default.promise().query(deleteAccessQuery, email);
        return res.status(204).json();
    }
    catch (err) {
        res.status(500).json({ message: '접속 해제 처리 중 에러가 발생했습니다.' });
        throw new Error(`Error processing access data: ${err}`);
    }
});
exports.setUserExit = setUserExit;
