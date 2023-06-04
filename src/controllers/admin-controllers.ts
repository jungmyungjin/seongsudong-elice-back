import { Request, Response, NextFunction } from 'express';
import { checkExistingUser } from './members-controllers';
import passport from 'passport';
import { Strategy as GoogleStrategy, Profile } from 'passport-google-oauth20';
import { RowDataPacket } from 'mysql2/promise';
import con from '../../connection';

export interface User {
    email: string;
    name: string;
    generation: string;
    isAdmin: boolean;
    createdAt: string;
}

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.CLIENT_ID!,
            clientSecret: process.env.CLIENT_SECRET!,
            callbackURL: process.env.CALLBACK_URL!,
            passReqToCallback: true,
        },
        async (req, accessToken, refreshToken, profile, done) => {
            const { email } = profile._json;
            const processedEmail = email ? email : '';

            try {
                const user = await checkExistingUser(processedEmail);
                const query = "SELECT * FROM members WHERE email = ?";
                const [rows] = await con.promise().query(query, [processedEmail]);
                const userData = (rows as RowDataPacket[])[0] || undefined;

                if (userData) {
                    user.user.isAdmin = userData.isAdmin === 1; // 1일 경우 true, 그 외의 값일 경우 false로 설정
                    console.log('관리자님 환영합니다.');
                }
                done(null, user.user);
                console.log(user.user.email);
            } catch (e) {
                const error = new Error('An error occurred');
                console.log(e);
                done(error, undefined);
            }
        }
    )
);

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user: User, done) => {
    done(null, user)
});

export function googleStrategy(req: Request, res: Response, next: NextFunction) {
    if (req.user) {
        // 이미 로그인한 사용자인 경우
        res.redirect('/');
        console.log('이미 로그인한 사용자입니다.')
    } else {
        // 로그인 요청 처리
        passport.authenticate('google', { scope: ['email'] })(req, res, next);
    }
}

export function googleCallback(req: Request, res: Response, next: NextFunction) {
    passport.authenticate('google', { failureRedirect: '/' })(req, res, (err: Error) => {
        if (err) {
            console.error('Google OAuth 인증 실패:', err);
            return next(err);
        }

        // req.login을 통해 사용자 정보를 세션에 저장
        req.login(req.user as any, (err) => {
            if (err) {
                console.error('사용자 정보를 세션에 저장하는데 실패했습니다:', err);
                return next(err);
            }

            // 인증 성공 시 사용자 정보 및 토큰 출력
            console.log('Google OAuth 인증 성공');
            console.log('사용자 정보:', req.user);
            console.log('토큰:', (req.user as any).token);

            next();
        });
    });
}

export function googleCallbackRedirect(req: Request, res: Response) {
    if (req.user) {
        // 로그인 정보가 있을 경우
        res.redirect('/');
    } else {
        // 로그인 정보가 없을 경우
        res.redirect('/register'); //cannot get register 떠도 멤버생성은 됨
    }
}

