// const Lecture = require('../models/Lecture');

import { Request, Response, NextFunction } from 'express';
import { MysqlError } from 'mysql';

import con from '../../connection';

// 작동 확인용 테스트 API
export const getComments = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // API 및 쿼리문 작성
  const sql = 'SELECT * FROM comments';

  // 이 sql 문을 어떻게 실행하지?
  con.query(sql, (err: any, result: any) => {
    if (err) {
      throw err;
    }

    console.log(result);
    // res.status(200).json(result);
    // res.send(result);
  });
};

// 특정 게시물에 댓글을 추가하는 함수
export const createComment = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const postId = req.params.postId;
  const email = req.body.email;
  const comment = req.body.comment;

  console.log(postId, email, comment);

  // 로그인 확인
  if (!email) {
    return res.status(500).send('로그인 유저가 아닙니다.');
  }

  // req에 필요한 데이터가 전부 들어왔는지 확인
  if (!email && !comment) {
    return res
      .status(500)
      .send('입력 정보가 부족합니다. 다시 한번 확인해주세요.');
  }

  // 존재하는 유저인지 확인
  // select name from members where email = dfadfdfd // 이름 정보만.
  // const searchUserQuery = `SELECT * FROM members WHERE email = ${email}`;
  // const searchUserQuery = `SELECT * FROM members WHERE email = '(email)'`;
  const searchUserQuery = `SELECT * FROM members WHERE email = (?)`;

  try {
    con.query(searchUserQuery, email, (err, _) => {
      if (err) {
        res.status(500).send('등록된 회원이 아닙니다.');

        throw err;
      }
    });
  } catch (err) {
    throw new Error(`Error searching member: ${err}`);
  }

  // 존재하는 게시물인지 확인
  const searchPostQuery = `SELECT * FROM posts WHERE id = ${postId}`;

  try {
    con.query(searchPostQuery, (err, _) => {
      if (err) {
        res.status(500).send('존재하지 않는 게시물입니다.');

        throw err;
      }
    });
  } catch (err) {
    throw new Error(`Error searching post: ${err}`);
  }

  // 댓글 등록
  const createCommentQuery =
    'INSERT INTO comments (post_id, content, author_email) VALUES (?, ?, ?)';

  try {
    con.query(createCommentQuery, [postId, comment, email], (err, result) => {
      if (err) {
        res.status(500).send('댓글 등록 중 에러가 발생했습니다.');

        throw err;
      }

      console.log(result);
      res.status(201).json(result);
    });
  } catch (err) {
    throw new Error(`Error creating comment: ${err}`);
  }
};
