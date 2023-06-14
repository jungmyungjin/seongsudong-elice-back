import express from 'express';
import {
  createComment,
  deleteComment,
  deleteCommentAdmin,
  updateComment,
} from '../controllers/comment-controllers';
const checkAuth = require('../middlewares/check-auth');

const commentRouter = express.Router();

commentRouter.use(checkAuth);

commentRouter.post('/:postId', createComment);
commentRouter.delete('/:postId/:commentId', deleteComment);
commentRouter.patch('/:postId', updateComment);
commentRouter.delete('/admin/:postId/:commentId', deleteCommentAdmin);

export default commentRouter;
