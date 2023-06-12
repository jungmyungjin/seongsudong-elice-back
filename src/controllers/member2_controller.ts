//passport 없이 구현중
import { Request, Response, NextFunction } from 'express';
import { google } from 'googleapis';
import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import con from '../../connection';
import { generateToken, verifyToken } from '../config/jwt';

//////////
import { OAuth2Client, GetTokenOptions } from 'google-auth-library';
const jwt = require('jsonwebtoken');

export interface User {
  email: string;
  name: string;
  generation: string;
  isAdmin: boolean;
}

// 기존 회원 여부 확인
export async function checkExistingUser(email: string): Promise<any> {
  let connection;
  try {
    connection = await con;

    const [rows] = await connection
      .promise()
      .query<RowDataPacket[]>('SELECT * FROM members WHERE email = ?', [email]);

    if (rows.length > 0) {
      const user = rows[0] as any;
      console.log('이미 있는 유저', user);
      return { existing: true, user };
    } else {
      return { existing: false };
    }
  } catch (error) {
    return Promise.reject(error);
  }
}

// 회원 가입 처리
// export async function createUser(
//   email: string,
//   name: string,
//   generation: string,
//   isAdmin = false,
// ): Promise<any> {
//   let connection;
//   try {
//     connection = await con;

//     const createdAt = new Date().toISOString().slice(0, 19).replace('T', ' ');
//     const [insertResult] = await connection
//       .promise()
//       .query<any>(
//         'INSERT INTO members (email, name, generation, isAdmin, createdAt) VALUES (?, ?, ?, ?, ?)',
//         [email, name, generation, isAdmin, createdAt],
//       );

//     const createdUserId = insertResult.insertId;
//     const createdUser = {
//       id: createdUserId,
//       email: email,
//       name: name,
//       generation: generation,
//       isAdmin: isAdmin,
//       createdAt: createdAt,
//     };

//     return createdUser;
//   } catch (error) {
//     return Promise.reject(error);
//   }
// }

//로그아웃
export function logout(req: Request, res: Response) {
  // 세션을 제거하여 로그아웃 처리
  req.session.destroy(err => {
    if (err) {
      console.error('Error while logging out:', err);
    } else {
      console.log('User logged out');
    }
    // 로그아웃 후 리다이렉트 또는 응답 처리
    res.redirect('/'); // 로그아웃 후 리다이렉트할 경로
  });
}

// //유저게시물조회
export async function getMemberPosts(email: string): Promise<any[]> {
  try {
    const [rows] = await con.promise().query<RowDataPacket[]>(
      `
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
      `,
      [email],
    );

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
      isAdmin: row.isAdmin,
    }));
    console.log(posts);
    return posts;
  } catch (error) {
    console.error('An error occurred in getMemberPosts:', error);
    throw error;
  }
}

// const clientID = process.env.CLIENT_ID;
// const clientSecret = process.env.CLIENT_SECRET; // 구글 클라이언트 시크릿
// const redirectURI = 'http://localhost:3000/auth/google/callback'; // 로그인 완료 후 리디렉션할 URI

// const oauth2Client = new google.auth.OAuth2(
//   clientID,
//   clientSecret,
//   redirectURI,
// );

// // 구글 로그인 요청 처리
// export function googleLogin(req: Request, res: Response) {
//   const scopes = [
//     'https://www.googleapis.com/auth/userinfo.email',
//     'https://www.googleapis.com/auth/userinfo.profile',
//   ];
//   const url = oauth2Client.generateAuthUrl({
//     access_type: 'offline',
//     scope: scopes,
//   });

//   res.redirect(url);
// }

// // 구글 콜백 처리 (똑같이 여기서 get: cors 오류)
// export async function googleCallback(req: Request, res: Response) {
//   const { code } = req.query;

//   try {
//     const { tokens } = await oauth2Client.getToken(code as string);
//     oauth2Client.setCredentials(tokens);

//     const oauth2 = google.oauth2({
//       version: 'v2',
//       auth: oauth2Client,
//     });

//     const { data } = await oauth2.userinfo.get();

//     const { email } = data;
//     const processedEmail = email ? email : '';

//     const user = await checkExistingUser(processedEmail);

//     if (!user.existing) {
//       // 회원 가입 처리
//       const newUser = await createUser(processedEmail, '', '');
//       user.user = newUser;
//     }

//     // 토큰 생성
//     const token = generateToken(user.user.email);

//     res.setHeader('Authorization', token);
//     res.redirect('http://localhost:8000');
//   } catch (error) {
//     console.error('Google OAuth 인증 실패:', error);
//     res.status(500).json({ error: 'Google OAuth 인증 실패' });
//   }
// }

///////////////////////////////
export const loginUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const redirectURI = 'http://localhost:3000'; // 로그인 완료 후 리디렉션할 URI

  const oAuth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    redirectURI,
  );

  let decodedToken;

  try {
    const { tokens } = await oAuth2Client.getToken(req.body.code);

    if (!tokens.access_token || !tokens.id_token) {
      throw new Error('로그인 처리 중 에러가 발생했습니다.');
    }

    decodedToken = jwt.decode(tokens.id_token);

    if (!decodedToken.email_verified) {
      throw new Error('유효하지 않은 이메일입니다.');
    }
  } catch (err) {
    res.status(500).json({ message: '로그인 처리 중 에러가 발생했습니다.' });

    next(err);
  }

  // 유저 조회
  const searchUserQuery = 'SELECT * FROM members WHERE email = ?';

  try {
    const [response] = (await con
      .promise()
      .query(searchUserQuery, [decodedToken.email])) as RowDataPacket[];

    // 회원가입 되지 않은 유저
    if (response.length === 0) {
      return res.status(201).json({ email: decodedToken.email });
    }

    // 회원가입 된 유저
    // 커스텀 JWT 구현
    let customJWT;

    customJWT = jwt.sign(
      {
        email: response[0].email,
        name: response[0].name,
        generation: response[0].generation,
        isAdmin: response[0].isAdmin === 0 ? 0 : 1,
      },
      process.env.JWT_SECRET_KEY,
      { expiresIn: '1h' },
    );

    res.cookie('elice_token', customJWT, {
      httpOnly: true, // document.cookie API로는 사용할 수 없게 만든다(true).
      // maxAge: 900000,
      secure: true, // 오직 HTTPS 연결에서만 사용할 수 있게 만든다(true)
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
  } catch (err) {
    res.status(500).json({ message: '로그인 처리 중 에러가 발생했습니다.' });

    next(err);
  }
};

export const createUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const email = req.body.email;
  const name = req.body.name;
  const generation = req.body.generation;

  try {
    const createUserQuery =
      'INSERT INTO members (email, name, generation) VALUES (?,?,?)';

    const result = await con
      .promise()
      .query(createUserQuery, [email, name, generation]);

    // 나중에 동명이인 처리 필요

    return res.status(201).json({
      message: '회원가입이 성공했습니다.',
    });
  } catch (err) {
    res.status(500).json({ message: '회원가입이 실패했습니다.' });

    next(err);
  }
};
