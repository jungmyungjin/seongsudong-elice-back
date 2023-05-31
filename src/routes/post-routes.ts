import express from 'express';
import {
  getPostList,
  getRecentPosts,
  writePost,
  getPost,
  editPost,
  removePost,
} from '../controllers/posts-controller';

const postRouter = express.Router();

postRouter.get('/', getPostList);
postRouter.get('/recent', getRecentPosts);
postRouter.post('/write', writePost);
postRouter.get('/:postId', getPost);
postRouter.put('/:postId', editPost);
postRouter.delete('/:postId', removePost);

export default postRouter;
