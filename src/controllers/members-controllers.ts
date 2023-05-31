import { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import { Strategy as GoogleStrategy, Profile } from 'passport-google-oauth20';
import { RowDataPacket } from 'mysql2/promise';
import con from '../../connection';

const config = {
  clientID: "176418337321-nlsk84qeitsk1d5r4ssl2indih8sea5t.apps.googleusercontent.com",
  clientSecret: "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",
  callbackURL: "/auth/google/callback"
};

passport.serializeUser((user: any, done) => {
  done(null, user);
});

passport.deserializeUser((user: any, done) => {
  done(null, user);
});

passport.use(
  new GoogleStrategy(
    config,
    async (accessToken, refreshToken, profile, done) => {
        const { email } = profile._json;
        
        try {
          const user = await findOrCreateUser({ email: email as string });
          done(null, {
            shortId: user.id,
            email: user.email,
          });
        } catch (e) {
        const error = new Error('An error occurred');
        console.log(e);
        done(error, undefined);
      }      
    }
  )
);

export async function findOrCreateUser({ email }: { email: string }): Promise<any> {
    let connection;
    try {
      connection = await con;
  
      const [rows] = await connection.promise().query<RowDataPacket[]>(
        'SELECT * FROM members WHERE email = ?',
        [email]
      );
  
      if (rows.length > 0) {
          const user = rows[0] as any;
          return user;
      }
      
      // 구글에서 받아온 데이터를 저장만 하는 함수
      // 페이지를 옮기면 위 함수의 데이터를 사용하기

      // 사용자가 구글 로그인 후 웹사이트에서 입력한 값들
      const name = "엄윤주"; // 사용자가 입력한 이름
      const generation = "SW4기"; // 사용자가 입력한 기수
      const isAdmin = false; // isAdmin 디폴트 값
      const createdAt = new Date().toISOString().slice(0, 19).replace('T', ' '); // 자동 생성된 가입 날짜
  
      const [insertResult] = await connection.promise().query<any>(
        'INSERT INTO members (email, name, generation, isAdmin, createdAt) VALUES (?, ?, ?, ?, ?)',
        [email, name, generation, isAdmin, createdAt]
      );
  
      const createdUserId = insertResult.insertId;
      const createdUser = {
        id: createdUserId,
        email: email,
        name: name,
        generation: generation,
        isAdmin: isAdmin,
        createdAt: createdAt,
      };
  
      return createdUser;
    } catch (error) {
      console.error('An error occurred in findOrCreateUser:', error);
      throw error;
    } finally {
      if (connection) {
        connection.end();
      }
    }
  }



export function googleStrategy(req: Request, res: Response, next: NextFunction) {
  passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
}

export function googleCallback(req: Request, res: Response, next: NextFunction) {
  passport.authenticate('google', { failureRedirect: '/login' })(req, res, next);
}

export function googleCallbackRedirect(req: Request, res: Response) {
    if (req.user) {
      // 로그인 정보가 있을 경우
      res.redirect('/');
    } else {
      // 로그인 정보가 없을 경우
      res.redirect('/register');
    }
  }
  