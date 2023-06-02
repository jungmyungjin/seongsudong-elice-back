import express from 'express';

import {
  getPostList,
  getRecentPosts,
  getTopPosts,
  writePost,
  getPost,
  editPost,
  removePost,
  countViews,
} from '../controllers/posts-controller';
import upload from '../middlewares/upload-files';

const postRouter = express.Router();

postRouter.get('/', getPostList);
postRouter.get('/recent', getRecentPosts);
postRouter.get('/top', getTopPosts);
postRouter.post('/write', upload.single('images'), writePost);
postRouter.get('/:postId', getPost);
postRouter.put('/:postId', upload.single('images'), editPost);
postRouter.delete('/:postId', removePost);
postRouter.put('/:postId/views', countViews);

export default postRouter;
