import express from 'express';
import {
  createComment,
  getComments,
} from '../controllers/comments-controllers';

const commentRouter = express.Router();

commentRouter.get('/', getComments);
commentRouter.post('/:postId', createComment);

export default commentRouter;
