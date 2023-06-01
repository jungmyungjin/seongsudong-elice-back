import express from 'express';
import {
  createComment,
  getComments,
  updateComment,
} from '../controllers/comments-controllers';

const commentRouter = express.Router();

commentRouter.get('/', getComments);
commentRouter.post('/:postId', createComment);
commentRouter.patch('/:postId', updateComment);

export default commentRouter;
