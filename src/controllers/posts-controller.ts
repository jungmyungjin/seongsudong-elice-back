import { Request, Response, NextFunction } from 'express';
import { RowDataPacket } from 'mysql2/promise';

import con from '../../connection';
import { request } from 'http';
import { error } from 'console';

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
        'SELECT id, category, title, images, description, created_at, views, email, name, generation, isAdmin FROM posts LEFT JOIN members ON posts.author_email = members.email WHERE category = ? ORDER BY created_at DESC';
      const getResult = await con.promise().query(getNoticesQuery, [category]);
      return res.status(200).json(getResult[0]);
    } catch (err) {
      next(err);
    }
  } else if (req.query.category === '자유게시판') {
    try {
      const category = req.query.category;
      const getPostsQuery =
        'SELECT id, category, title, images, description, created_at, views, email, name, generation, isAdmin FROM posts LEFT JOIN members ON posts.author_email = members.email WHERE category = ?';
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
        'SELECT id, category, title, images, description, created_at, views, email, name, generation, isAdmin FROM posts LEFT JOIN members ON posts.author_email = members.email WHERE author_email = ? ORDER BY created_at DESC';
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

// 최근 게시물 조회
export const getRecentPosts = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (req.query.category === '공지게시판') {
      const category = req.query.category;
      const getRecentPostsQuery =
        'SELECT id, category, title, images, description, created_at, views, email, name, generation, isAdmin FROM posts LEFT JOIN members ON posts.author_email = members.email WHERE category = ? ORDER BY created_at DESC LIMIT 0, 3;';
      const getResult = await con
        .promise()
        .query(getRecentPostsQuery, [category]);
      return res.status(200).json(getResult[0]);
    }
  } catch (err) {
    next(err);
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
    const getPostQuery = `SELECT id, category, title, images, description, created_at, views, email, name, generation, isAdmin FROM posts LEFT JOIN members ON posts.author_email = members.email WHERE id = ${postId}`;
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
    const getPostQuery =
      'SELECT id, category, title, images, description, created_at, views, email, name, generation, isAdmin FROM posts LEFT JOIN members ON posts.author_email = members.email WHERE id = ?;';
    const getResult = await con.promise().query(getPostQuery, [postId]);
    console.log(getResult);
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
    const updatePostQuery = ` UPDATE posts SET title = ?, images = ?, description = ? WHERE id = ${postId}`;
    const [updateResult] = await con
      .promise()
      .query(updatePostQuery, [title, images, description]);

    // 수정 데이터 반환
    const getUpdatedPostQuery = `SELECT id, category, title, images, description, created_at, views, email, name, generation, isAdmin FROM posts LEFT JOIN members ON posts.author_email = members.email WHERE id = ?`;
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

// 게시물 조회수 증가
export const countViews = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const postId = req.params.postId;

  const getRecentViewsQuery = 'SELECT id, views FROM posts WHERE id = ?;';
  const recentViews = await con.promise().query(getRecentViewsQuery, [postId]);
  let views = (recentViews[0] as any)[0]?.views;
  views += 1;

  const incViewsQuery = 'UPDATE posts SET views = ? WHERE id = ?;';
  const incResult = await con.promise().query(incViewsQuery, [views, postId]);

  const updatedViewsQuery = 'SELECT id, views FROM posts WHERE id = ?;';
  const [updatedViews] = await con.promise().query(updatedViewsQuery, [postId]);
  return res.status(201).json(updatedViews);
};
