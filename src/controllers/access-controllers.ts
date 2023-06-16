import { Request, Response, NextFunction, Router } from 'express';
import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import jwt, { JwtPayload } from 'jsonwebtoken';

import con from '../../connection';

const router = Router();

interface DecodedToken extends JwtPayload {
  email: string;
  isAdmin: boolean;
}

export const isUserAccess = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<Response | void> => {
  const token: string | undefined = req.cookies?.elice_token;

  if (token) {
    const decodedToken: DecodedToken | string = jwt.verify(
      token,
      process.env.JWT_SECRET_KEY || '',
    ) as DecodedToken;

    if (decodedToken) {
      return res
        .status(200)
        .json({ email: decodedToken.email, isAdmin: decodedToken.isAdmin })
        .end();
    }
  } else {
    return res.status(204).end();
  }
};

// 로그인 시 유저의 접속 상태를 활성화하는 함수
export const setUserAccess = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
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
    const [userData] = (await con
      .promise()
      .query(searchUserQuery, email)) as RowDataPacket[];

    if (userData.length === 0) {
      return res.status(500).json({ message: '등록된 회원이 아닙니다.' });
    }
  } catch (err) {
    res.status(500).json({ message: '유저 조회 중 에러가 발생했습니다.' });

    throw new Error(`Error searching member: ${err}`);
  }

  // 접속 데이터 on
  const accessQuery =
    'INSERT INTO connection_status (member_email, isActive, lastSeenAt) VALUES (?, ?, NOW())';

  try {
    await con.promise().query(accessQuery, [email, true]);

    return res.status(201).json({ message: '엘리스에 입장하였습니다.' });
  } catch (err) {
    res.status(500).json({ message: '접속 처리 중 에러가 발생했습니다.' });

    // throw new Error(`Error processing access data: ${err}`);

    next(err);
  }
};

// 로그아웃 시 유저의 접속 상태를 비활성화하는 함수
export const setUserExit = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const email = req.body.email;

  // 로그인한 유저인지 확인
  if (!email) {
    return res.status(500).json({ message: '로그인 유저가 아닙니다.' });
  }

  // 존재하는 유저인지 확인
  const searchUserQuery = `SELECT * FROM members WHERE email = ?`;

  try {
    const [userData] = (await con
      .promise()
      .query(searchUserQuery, email)) as RowDataPacket[];

    if (userData.length === 0) {
      return res.status(500).json({ message: '등록된 회원이 아닙니다.' });
    }
  } catch (err) {
    res.status(500).json({ message: '유저 조회 중 에러가 발생했습니다.' });

    throw new Error(`Error searching member: ${err}`);
  }

  // 접속 데이터 delete
  const deleteAccessQuery =
    'DELETE FROM connection_status WHERE member_email = ?';

  try {
    await con.promise().query(deleteAccessQuery, email);

    return res.status(204).json();
  } catch (err) {
    res.status(500).json({ message: '접속 해제 처리 중 에러가 발생했습니다.' });

    throw new Error(`Error processing access data: ${err}`);
  }
};
