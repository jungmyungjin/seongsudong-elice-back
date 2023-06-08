// import express from 'express';
// import passport from 'passport';
// import { generateToken, verifyToken } from '../config/jwt';
// import { User } from '../controllers/members-controllers';

// const router = express.Router();

// // Google OAuth 인증 요청 처리
// router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// // Google OAuth 콜백 처리
// router.get(
//     '/auth/google/callback',
//     passport.authenticate('google', { failureRedirect: '/login' }),
//     (req, res) => {
//         // 인증 성공 시 사용자 정보 및 토큰 출력
//         console.log('Google OAuth 인증 성공');
//         console.log('사용자 정보:', req.user);
//         console.log('토큰:', req.user);

//         // 성공적으로 로그인한 경우 메인 페이지로 리디렉션
//         res.redirect('/');
//     }
// );

// // JWT 토큰 검증 미들웨어
// const verifyTokenMiddleware = (req: express.Request, res: express.Response, next: express.NextFunction) => {
//     const token = req.headers.authorization?.split(' ')[1]; // Authorization 헤더에서 토큰 추출

//     if (!token) {
//         return res.status(401).json({ message: '토큰이 없습니다.' });
//     }

//     const decodedToken = verifyToken(token);
//     if (!decodedToken) {
//         return res.status(401).json({ message: '유효하지 않은 토큰입니다.' });
//     }

//     // 검증된 토큰을 사용자 정보로 변환하여 req.user에 할당
//     // 사용자 정보에 토큰 할당
//     const user: User & { token: string } = {
//         email: decodedToken.email,
//         name: decodedToken.name,
//         generation: decodedToken.generation,
//         isAdmin: decodedToken.isAdmin,
//         createdAt: decodedToken.createdAt,
//         token: token,
//     };
//     req.user = user;

//     next();
// };

// // 인증이 필요한 API 예시
// router.get('/protected', verifyTokenMiddleware, (req, res) => {
//     res.json({ message: '인증된 사용자만 접근 가능한 API' });
// });

// export default router;
