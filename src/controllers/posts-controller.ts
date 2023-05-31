import { Request, Response, NextFunction } from 'express';
import { RowDataPacket } from 'mysql2/promise';

import con from '../../connection';

// 게시물 조회
export const getPostList = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (req.query.category === '공지게시판') {
    try {
      const category = req.query.category;
      const getNoticesQuery =
        'SELECT * FROM posts WHERE category = ? ORDER BY created_at DESC';
      const getResult = await con.promise().query(getNoticesQuery, [category]);
      return res.status(200).json(getResult[0]);
    } catch (err) {
      next(err);
    }
  } else if (req.query.category === '자유게시판') {
    try {
      const category = req.query.category;
      const getPostsQuery =
        'SELECT * FROM posts WHERE category = ? ORDER BY created_at DESC';
      const getResult = await con.promise().query(getPostsQuery, [category]);
      return res.status(200).json(getResult[0]);
    } catch (err) {
      next(err);
    }
  } else if (req.query.email) {
    try {
      const email = req.query.email;
      console.log(email);
      const getMemberPostsQuery =
        'SELECT * FROM posts WHERE author_email = ? ORDER BY created_at DESC';
      const getResult = await con.promise().query(getMemberPostsQuery, [email]);
      return res.status(200).json(getResult[0]);
    } catch (err) {
      next(err);
    }
  } else {
    try {
      const getAllPostsQuery = `SELECT * FROM posts ORDER BY created_at DESC;`;
      const getResult = await con.promise().query(getAllPostsQuery);
      return res.status(200).json(getResult[0]);
    } catch (err) {
      next(err);
    }
  }
};

// 게시물 생성
export const writePost = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const {
      author_email: email,
      category,
      title,
      images,
      description,
    } = req.body;

    const createPostQuery = `INSERT INTO posts (author_email, category, title, images, description)
      VALUES (?, ?, ?, ?, ?)`;
    const [result] = await con
      .promise()
      .query(createPostQuery, [email, category, title, images, description]);

    // 생성 데이터 반환
    const postId = (result as RowDataPacket).insertId;
    const getPostQuery = `SELECT * FROM posts WHERE id = ${postId}`;
    const getResult = await con.promise().query(getPostQuery);

    return res.status(200).json(getResult[0]);
  } catch (err) {
    next(err);
  }
};

// 게시물 상세 조회
export const getPost = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const postId = req.params.postId;
    const getPostQuery = 'SELECT * FROM posts WHERE id = ?;';
    const getResult = await con.promise().query(getPostQuery, [postId]);

    return res.status(200).json(getResult[0]);
  } catch (err) {
    next(err);
  }
};

// 게시물 수정
export const editPost = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const postId = req.params.postId;
    const { title, images, description } = req.body;
    const updatePostQuery = ` UPDATE posts SET title=?, images=?, description=? WHERE id = ${postId}`;
    const [updateResult] = await con
      .promise()
      .query(updatePostQuery, [title, images, description]);

    // 수정 데이터 반환
    const getUpdatedPostQuery = `SELECT * FROM posts WHERE id=?`;
    const [updatedPost] = await con
      .promise()
      .query(getUpdatedPostQuery, [postId]);

    return res.status(201).json(updatedPost);
  } catch (err) {
    next(err);
  }
};

// 게시물 삭제
export const removePost = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const postId = req.params.postId;
    const deletePostQuery = 'DELETE FROM posts WHERE id = ?';
    const deleteResult = await con.promise().query(deletePostQuery, [postId]);
    console.log(deleteResult);
    return res.status(204).json({ msg: 'Post deleted successfully' });
  } catch (err) {
    next(err);
  }
};
