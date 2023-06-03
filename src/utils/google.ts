import { Request, Response, NextFunction } from 'express';
import { RowDataPacket } from 'mysql2/promise';
import con from '../../connection';
import axios from 'axios';

async function findOrCreateUser(email: string): Promise<any> {
  let connection;
  try {
    connection = await con.getConnection();

    // 사용자 조회
    const [rows] = await connection.query<RowDataPacket[]>(
      'SELECT * FROM members WHERE email = ?',
      [email]
    );

    if (rows.length > 0) {
      // 사용자가 이미 존재하는 경우
      const user = rows[0] as any;
      return user;
    }

    // 사용자 생성
    const createdAt = new Date().toISOString();
    const [result] = await connection.query<RowDataPacket[]>(
      'INSERT INTO members (email, createdAt) VALUES (?, ?)',
      [email, createdAt]
    );

    const createdUserId = result.insertId;
    const createdUser = {
      id: createdUserId,
      email: email,
      createdAt: createdAt,
    };

    return createdUser;
  } catch (error) {
    throw error;
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

export async function googleStrategy(req: Request, res: Response, next: NextFunction) {
  const { code } = req.query;

  try {
    // Google에서 액세스 토큰 요청
    const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', {
      client_id: config.clientID,
      client_secret: config.clientSecret,
      redirect_uri: config.callbackURL,
      grant_type: 'authorization_code',
      code,
    });

    const accessToken = tokenResponse.data.access_token;

    // Google 사용자 정보 요청
    const profileResponse = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const { email } = profileResponse.data;

    // 사용자 생성 또는 조회
    const user = await findOrCreateUser(email);

    // 로그인 처리
    req.session.user = {
      shortId: user.id,
      email: user.email,
    };

    res.redirect('/'); // 로그인 후 리다이렉트할 경로 설정
  } catch (error) {
    // 에러 처리
    console.error(error);
    res.redirect('/login'); // 에러 발생 시 리다이렉트할 경로 설정
  }
}
