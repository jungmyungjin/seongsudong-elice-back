import { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import { User } from '../controllers/members-controllers'


export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
    // 로그인된 사용자의 정보 가져오기
    const user = req.user as User;
    const isAdmin = user?.isAdmin;
    console.log('isAdmin:', isAdmin);

    // isAdmin 여부 확인
    if (isAdmin) {
        // isAdmin이 true인 경우 다음 미들웨어로 이동
        next();
    } else {
        // isAdmin이 false인 경우 권한이 없음을 응답
        return res.status(403).json({ error: '권한이 없습니다.' });
    }
};