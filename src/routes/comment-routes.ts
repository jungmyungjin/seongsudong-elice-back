import express from 'express';
import {
  createComment,
  deleteComment,
  deleteCommentAdmin,
  updateComment,
} from '../controllers/comments-controllers';

const commentRouter = express.Router();

commentRouter.post('/:postId', createComment);
commentRouter.delete('/:postId/:commentId/:email', deleteComment); // DELETE는 body를 넣을 수 없다!
commentRouter.delete(
  '/admin/:postId/:commentId/:email/:isAdmin',
  deleteCommentAdmin,
); // DELETE는 body를 넣을 수 없다!
commentRouter.patch('/:postId', updateComment);

export default commentRouter;
