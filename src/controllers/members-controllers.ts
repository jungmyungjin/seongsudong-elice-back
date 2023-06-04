import { Request, Response, NextFunction } from 'express';
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
        }
        // accessToken을 req.user에 할당
        user.user.token = accessToken;

        done(null, user.user);
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



// 기존 회원 여부 확인
export async function checkExistingUser(email: string): Promise<any> {
  let connection;
  try {
    connection = await con;

    const [rows] = await connection.promise().query<RowDataPacket[]>(
      'SELECT * FROM members WHERE email = ?',
      [email]
    );

    if (rows.length > 0) {
      const user = rows[0] as any;
      console.log('이미 있는 유저', user)
      return { existing: true, user };
    } else {
      return { existing: false };
    }
  } catch (error) {
    return Promise.reject(error)
  }
}

// 회원 가입 처리
export async function createUser(email: string, name: string, generation: string, isAdmin = false): Promise<any> {
  let connection;
  try {
    connection = await con;

    const createdAt = new Date().toISOString().slice(0, 19).replace('T', ' ');
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
    return Promise.reject(error)
  }
}



//로그아웃
export function logout(req: Request, res: Response) {
  // 세션을 제거하여 로그아웃 처리
  req.session.destroy((err) => {
    if (err) {
      console.error('Error while logging out:', err);
    } else {
      console.log('User logged out');
    }
    // 로그아웃 후 리다이렉트 또는 응답 처리
    res.redirect('/'); // 로그아웃 후 리다이렉트할 경로
  });
}

//유저게시물조회
export async function getMemberPosts(email: string): Promise<any[]> {
  try {
    const [rows] = await con.promise().query<RowDataPacket[]>(`
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

    const posts = rows.map((row: RowDataPacket) => ({
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
      isAdmin: row.isAdmin
    }));
    console.log(posts)
    return posts;

  } catch (error) {
    console.error('An error occurred in getMemberPosts:', error);
    throw error;
  }
}

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


// export async function findOrCreateUser({ email }: { email: string }): Promise<any> {
//     let connection;
//     try {
//       connection = await con;

//       const [rows] = await connection.promise().query<RowDataPacket[]>(
//         'SELECT * FROM members WHERE email = ?',
//         [email]
//       );

//       if (rows.length > 0) {
//           const user = rows[0] as any;
//           return user;
//       }

//       // 구글에서 받아온 데이터를 저장만 하는 함수
//       // 페이지를 옮기면 위 함수의 데이터를 사용하기

//       // 사용자가 구글 로그인 후 웹사이트에서 입력한 값들
//       const name = "엄윤주"; // 사용자가 입력한 이름
//       const generation = "SW4기"; // 사용자가 입력한 기수
//       const isAdmin = false; // isAdmin 디폴트 값
//       const createdAt = new Date().toISOString().slice(0, 19).replace('T', ' '); // 자동 생성된 가입 날짜

//       const [insertResult] = await connection.promise().query<any>(
//         'INSERT INTO members (email, name, generation, isAdmin, createdAt) VALUES (?, ?, ?, ?, ?)',
//         [email, name, generation, isAdmin, createdAt]
//       );

//       const createdUserId = insertResult.insertId;
//       const createdUser = {
//         id: createdUserId,
//         email: email,
//         name: name,
//         generation: generation,
//         isAdmin: isAdmin,
//         createdAt: createdAt,
//       };

//       return createdUser;
//     } catch (error) {
//       console.error('An error occurred in findOrCreateUser:', error);
//       throw error;
//     }
// }


