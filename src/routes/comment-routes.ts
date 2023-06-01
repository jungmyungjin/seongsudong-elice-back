import express from 'express';
import {
  createComment,
  getComments,
  deleteComment,
  deleteCommentAdmin,
  updateComment,
} from '../controllers/comments-controllers';

const commentRouter = express.Router();

commentRouter.get('/', getComments);
commentRouter.post('/:postId', createComment);
commentRouter.delete('/:postId', deleteComment);
commentRouter.delete('/:postId/admin', deleteCommentAdmin);
commentRouter.patch('/:postId', updateComment);

export default commentRouter;
