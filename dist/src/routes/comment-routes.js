"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const comments_controllers_1 = require("../controllers/comments-controllers");
const checkAuth = require('../middlewares/check-auth');
const commentRouter = express_1.default.Router();
commentRouter.use(checkAuth);
commentRouter.post('/:postId', comments_controllers_1.createComment);
commentRouter.delete('/:postId/:commentId', comments_controllers_1.deleteComment);
commentRouter.patch('/:postId', comments_controllers_1.updateComment);
commentRouter.delete('/admin/:postId/:commentId', comments_controllers_1.deleteCommentAdmin);
exports.default = commentRouter;
