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
exports.deleteMember = exports.getMemberPosts = exports.logout = exports.checkExistingUser = exports.createUser = exports.loginUser = void 0;
const googleapis_1 = require("googleapis");
const connection_1 = __importDefault(require("../../connection"));
const jwt = require('jsonwebtoken');
//로그인
const loginUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const redirectURI = 'http://localhost:3000'; // 로그인 완료 후 리디렉션할 URI
    const oAuth2Client = new googleapis_1.google.auth.OAuth2(process.env.CLIENT_ID, process.env.CLIENT_SECRET, redirectURI);
    let decodedToken;
    try {
        const { tokens } = yield oAuth2Client.getToken(req.body.code);
        if (!tokens.access_token || !tokens.id_token) {
            throw new Error('로그인 처리 중 에러가 발생했습니다.');
        }
        decodedToken = jwt.decode(tokens.id_token);
        if (!decodedToken.email_verified) {
            throw new Error('유효하지 않은 이메일입니다.');
        }
    }
    catch (err) {
        res.status(500).json({ message: '로그인 처리 중 에러가 발생했습니다.' });
        next(err);
    }
    // 유저 조회
    const searchUserQuery = 'SELECT * FROM members WHERE email = ?';
    try {
        const [response] = (yield connection_1.default
            .promise()
            .query(searchUserQuery, [decodedToken.email]));
        // 회원가입 되지 않은 유저
        if (response.length === 0) {
            return res.status(201).json({ email: decodedToken.email });
        }
        // 회원가입 된 유저
        // 커스텀 JWT 구현
        let customJWT;
        customJWT = jwt.sign({
            email: response[0].email,
            name: response[0].name,
            generation: response[0].generation,
            isAdmin: response[0].isAdmin === 0 ? 0 : 1,
        }, process.env.JWT_SECRET_KEY, { expiresIn: '1h' });
        res.cookie('elice_token', customJWT, {
            httpOnly: true,
            // maxAge: 900000,
            secure: true,
            sameSite: 'none', // 만약 sameSite를 None으로 사용한다면 반드시 secure를 true로 설정해야한다.
            //   secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
            //   sameSite: 'strict', // Protect against CSRF attacks
        });
        return res.status(200).json({
            token: customJWT,
            email: response[0].email,
            name: response[0].name,
            generation: response[0].generation,
            isAdmin: response[0].isAdmin === 0 ? 0 : 1,
        });
    }
    catch (err) {
        res.status(500).json({ message: '로그인 처리 중 에러가 발생했습니다.' });
        next(err);
    }
});
exports.loginUser = loginUser;
//회원가입
const createUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const email = req.body.email;
    const name = req.body.name;
    const generation = req.body.generation;
    try {
        const createUserQuery = 'INSERT INTO members (email, name, generation) VALUES (?,?,?)';
        const result = yield connection_1.default
            .promise()
            .query(createUserQuery, [email, name, generation]);
        // 나중에 동명이인 처리 필요
        return res.status(201).json({
            message: '회원가입이 성공했습니다.',
        });
    }
    catch (err) {
        res.status(500).json({ message: '회원가입이 실패했습니다.' });
        next(err);
    }
});
exports.createUser = createUser;
// 기존 회원 여부 확인
function checkExistingUser(email) {
    return __awaiter(this, void 0, void 0, function* () {
        let connection;
        try {
            connection = yield connection_1.default;
            const [rows] = yield connection
                .promise()
                .query('SELECT * FROM members WHERE email = ?', [email]);
            if (rows.length > 0) {
                const user = rows[0];
                console.log('이미 있는 유저', user);
                return { existing: true, user };
            }
            else {
                return { existing: false };
            }
        }
        catch (error) {
            return Promise.reject(error);
        }
    });
}
exports.checkExistingUser = checkExistingUser;
//로그아웃
function logout(req, res) {
    try {
        // 쿠키 삭제 및 로그아웃 메시지 전달
        return res
            .clearCookie('elice_token', { path: '/', domain: 'localhost' })
            .status(200)
            .json({ message: '로그아웃이 완료되었습니다.' })
            .end();
    }
    catch (error) {
        return Promise.reject(error);
    }
}
exports.logout = logout;
//유저게시물조회
function getMemberPosts(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const email = req.user.email;
        try {
            const [rows] = yield connection_1.default.promise().query(`
        SELECT
          posts.id,
          posts.category,
          posts.title,
          posts.images,
          posts.description,
          posts.created_at,
          posts.views,
          members.email,
          members.name,
          members.generation,
          members.isAdmin
        FROM posts
        LEFT JOIN members ON posts.author_email = members.email
        WHERE author_email = ?
        ORDER BY created_at DESC
      `, [email]);
            const posts = rows.map((row) => ({
                id: row.id,
                category: row.category,
                title: row.title,
                images: row.images,
                description: row.description,
                created_at: row.created_at,
                views: row.views,
                email: row.email,
                name: row.name,
                generation: row.generation,
                isAdmin: row.isAdmin,
            }));
            console.log(posts);
            return posts;
        }
        catch (error) {
            console.error('An error occurred in getMemberPosts:', error);
            throw error;
        }
    });
}
exports.getMemberPosts = getMemberPosts;
//회원탈퇴
function deleteMember(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const email = req.user.email;
        try {
            // 멤버 존재 여부 확인
            const checkMemberQuery = `SELECT * FROM members WHERE email = '${email}'`;
            const [memberRows] = yield connection_1.default.promise().query(checkMemberQuery);
            if (memberRows.length === 0) {
                return res.status(404).json({ message: '멤버를 찾을 수 없습니다.' });
            }
            const deleteChatMessageQuery = `DELETE FROM chat_messages WHERE sender_email = '${email}'`;
            yield connection_1.default.promise().query(deleteChatMessageQuery);
            const deleteChatRoom = `DELETE FROM chat_rooms WHERE member_email = '${email}'`;
            yield connection_1.default.promise().query(deleteChatRoom);
            // 멤버의 예약 삭제
            const deleteReservationsQuery = `DELETE FROM reservations WHERE member_email = '${email}'`;
            yield connection_1.default.promise().query(deleteReservationsQuery);
            // 외래 키 제약 조건 비활성화
            yield connection_1.default.promise().query('SET FOREIGN_KEY_CHECKS = 0');
            // 멤버의 댓글 삭제
            const deleteCommentsQuery = `DELETE FROM comments WHERE author_email = '${email}'`;
            yield connection_1.default.promise().query(deleteCommentsQuery);
            // 멤버의 게시글 삭제
            const deletePostsQuery = `DELETE FROM posts WHERE author_email = '${email}'`;
            yield connection_1.default.promise().query(deletePostsQuery);
            // 외래 키 제약 조건 다시 활성화
            yield connection_1.default.promise().query('SET FOREIGN_KEY_CHECKS = 1');
            // 멤버 삭제
            const deleteMemberQuery = `DELETE FROM members WHERE email = '${email}'`;
            yield connection_1.default.promise().query(deleteMemberQuery);
            return res.status(200).json({ message: '탈퇴가 완료되었습니다.' });
        }
        catch (error) {
            return Promise.reject(error);
        }
    });
}
exports.deleteMember = deleteMember;
