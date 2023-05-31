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

const postRouter = express.Router();

postRouter.get('/', getPostList);
postRouter.get('/recent', getRecentPosts);
postRouter.get('/top', getTopPosts);
postRouter.post('/write', writePost);
postRouter.get('/:postId', getPost);
postRouter.put('/:postId', editPost);
postRouter.delete('/:postId', removePost);
postRouter.put('/:postId/views', countViews);

export default postRouter;
