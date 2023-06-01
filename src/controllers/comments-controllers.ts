// const Lecture = require('../models/Lecture');

import { Request, Response, NextFunction, response } from 'express';
import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';

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
    // res.json(result);
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

  // req에 필요한 데이터가 전부 들어왔는지 확인
  if (!email || !comment) {
    return res
      .status(500)
      .json({ message: '입력 정보가 부족합니다. 다시 한번 확인해주세요.' });
  }

  // 로그인 확인
  if (!email) {
    return res.status(500).json({ message: '로그인 유저가 아닙니다.' });
  }

  // 존재하는 유저인지 확인
  // select name from members where email = dfadfdfd // 이름 정보만.
  // const searchUserQuery = `SELECT * FROM members WHERE email = ${email}`;
  // const searchUserQuery = `SELECT * FROM members WHERE email = '(email)'`;
  const searchUserQuery = `SELECT * FROM members WHERE email = (?)`;

  try {
    await con.promise().query(searchUserQuery, email);
  } catch (err) {
    res.status(500).json({ message: '등록된 회원이 아닙니다.' });

    throw new Error(`Error searching member: ${err}`);
  }

  // 존재하는 게시물인지 확인
  const searchPostQuery = `SELECT * FROM posts WHERE id = ${postId}`;

  try {
    await con.promise().query(searchPostQuery);
  } catch (err) {
    res.status(500).json({ message: '존재하지 않는 게시물입니다.' });

    throw new Error(`Error searching post: ${err}`);
  }

  let createdCommentId = null;

  // 댓글 등록
  const createCommentQuery =
    'INSERT INTO comments (post_id, content, author_email) VALUES (?, ?, ?)';

  try {
    const [result] = await con
      .promise()
      .query(createCommentQuery, [postId, comment, email]);

    createdCommentId = (result as RowDataPacket).insertId;
  } catch (err) {
    res.status(500).json({ message: '댓글 등록 중 에러가 발생했습니다.' });

    throw new Error(`Error creating comment: ${err}`);
  }

  // 등록 데이터 반환
  // 유저 데이터를 같이 반환해줘야함. 이름과 기수를 보여줘야하기 때문.
  // const searchCreatedCommentQuery = `SELECT * FROM comments WHERE id = ${createdCommentId}`;
  // const searchCreatedCommentQuery = `SELECT comment.*, members.name FROM comments JOIN members ON comments.author_email = members.email WHERE comments.id = ${createdCommentId}`;
  const searchCreatedCommentQuery = `SELECT comments.*, members.name, members.generation
  FROM comments 
  JOIN members ON comments.author_email = members.email 
  WHERE comments.id = ${createdCommentId}`;

  try {
    const [result] = (await con
      .promise()
      .query(searchCreatedCommentQuery)) as RowDataPacket[];

    res.status(201).json(result[0]);
  } catch (err) {
    res
      .status(500)
      .json({ message: '등록된 댓글 반환 중 에러가 발생했습니다.' });

    throw new Error(`Error searching comment: ${err}`);
  }
};

// 특정 게시물에서 댓글을 삭제하는 함수 - 일반 유저
export const deleteComment = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const postId = req.params.postId;
  const email = req.body.email;
  const commentId = req.body.commentId;

  // req에 필요한 데이터가 전부 들어왔는지 확인
  if (!email || !commentId) {
    return res
      .status(500)
      .json({ message: '입력 정보가 부족합니다. 다시 한번 확인해주세요.' });
  }

  // 로그인 확인
  if (!email) {
    return res.status(500).json({ message: '로그인 유저가 아닙니다.' });
  }

  // 존재하는 유저인지 확인
  const searchUserQuery = `SELECT * FROM members WHERE email = (?)`;

  try {
    await con.promise().query(searchUserQuery, email);
  } catch (err) {
    res.status(500).json({ message: '등록된 회원이 아닙니다.' });

    throw new Error(`Error searching member: ${err}`);
  }

  // 존재하는 게시물인지 확인
  const searchPostQuery = `SELECT * FROM posts WHERE id = ${postId}`;

  try {
    await con.promise().query(searchPostQuery);
  } catch (err) {
    res.status(500).json({ message: '존재하지 않는 게시물입니다.' });

    throw new Error(`Error searching post: ${err}`);
  }

  // 댓글 데이터 얻기
  let commentData;

  const searchCommentQuery = `SELECT * FROM comments WHERE id = ${commentId}`;

  try {
    [commentData] = (await con
      .promise()
      .query(searchCommentQuery)) as RowDataPacket[];
  } catch (err) {
    res.status(500).json({ message: '댓글 데이터 조회 실패.' });

    throw new Error(`Error searching comment: ${err}`);
  }

  // 댓글 작성자인지 확인
  if (commentData[0].author_email !== email) {
    return res.status(500).json({ message: '댓글 삭제 권한이 없습니다.' });
  }

  // 댓글 삭제
  const deleteCommentQuery = `DELETE FROM comments WHERE id = ${commentId}`;

  try {
    const [result] = await con.promise().query(deleteCommentQuery);

    const { affectedRows } = result as ResultSetHeader;

    if (affectedRows > 0) {
      // 204는 응답 데이터를 보낼 수 없으므로, 200으로 처리
      return res.status(200).json({
        message: '댓글 삭제가 성공하였습니다.',
      });
      // return res.status(204).json(response);
    }
  } catch (err) {
    res.status(500).json({ message: '댓글 삭제 중 에러가 발생했습니다.' });

    throw new Error(`Error deleting comment: ${err}`);
  }
};

// 특정 게시물의 데이터를 삭제하는 함수 - 관리자
export const deleteCommentAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const postId = req.params.postId;
  const email = req.body.email;
  const commentId = req.body.commentId;
  const isAdmin = req.body.isAdmin;

  // req에 필요한 데이터가 전부 들어왔는지 확인
  // 문제 발생! isAmdin이 number 타입인데 0으로 들어오는 경우 !0 === true가 되어버려서
  // 정보가 전달되었음에도 정보가 부족하다는 에러를 뱉음....!
  if (!commentId || !email || !isAdmin) {
    return res
      .status(500)
      .json({ message: '입력 정보가 부족합니다. 다시 한번 확인해주세요.' });
  }

  // 로그인 확인
  if (!email) {
    return res.status(500).json({ message: '로그인 유저가 아닙니다.' });
  }

  // 관리자 요청인지 확인
  if (!isAdmin) {
    return res.status(500).json({ message: '관리자가 아닙니다.' });
  }

  // 존재하는 유저인지 확인
  const searchUserQuery = `SELECT * FROM members WHERE email = (?)`;

  let userData;

  try {
    const response = (await con
      .promise()
      .query(searchUserQuery, email)) as RowDataPacket[];

    userData = response[0];
  } catch (err) {
    res.status(500).json({ message: '등록된 회원이 아닙니다.' });

    throw new Error(`Error searching member: ${err}`);
  }

  // 관리자 권한이 있는 유저인지 확인
  if (userData[0].isAdmin !== isAdmin) {
    return res.status(500).json({ message: '관리자 권한이 없습니다.' });
  }

  // 존재하는 게시물인지 확인
  const searchPostQuery = `SELECT * FROM posts WHERE id = ${postId}`;

  try {
    await con.promise().query(searchPostQuery);
  } catch (err) {
    res.status(500).json({ message: '존재하지 않는 게시물입니다.' });

    throw new Error(`Error searching post: ${err}`);
  }

  // 댓글 데이터 얻기
  const searchCommentQuery = `SELECT * FROM comments WHERE id = ${commentId}`;

  try {
    await con.promise().query(searchCommentQuery);
  } catch (err) {
    res.status(500).json({ message: '댓글 데이터 조회 실패.' });

    throw new Error(`Error searching comment: ${err}`);
  }

  // 댓글 삭제
  const deleteCommentQuery = `DELETE FROM comments WHERE id = ${commentId}`;

  try {
    const [result] = await con.promise().query(deleteCommentQuery);

    const { affectedRows } = result as ResultSetHeader;

    if (affectedRows > 0) {
      return res.status(200).json({
        message: '댓글 삭제가 성공하였습니다.',
      });
    }
  } catch (err) {
    res.status(500).json({ message: '댓글 삭제 중 에러가 발생했습니다.' });

    throw new Error(`Error deleting comment: ${err}`);
  }
};
