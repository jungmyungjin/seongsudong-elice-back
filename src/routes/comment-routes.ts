import express from 'express';
import {
  createComment,
  deleteComment,
  deleteCommentAdmin,
  updateComment,
} from '../controllers/comments-controllers';

const commentRouter = express.Router();

commentRouter.post('/:postId', createComment);
commentRouter.delete('/:postId', deleteComment);
commentRouter.delete('/:postId/admin', deleteCommentAdmin);
commentRouter.patch('/:postId', updateComment);

export default commentRouter;
