"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const posts_controller_1 = require("../controllers/posts-controller");
const upload_files_1 = __importDefault(require("../middlewares/upload-files"));
const postRouter = express_1.default.Router();
postRouter.get('/', posts_controller_1.getPostList);
postRouter.get('/recent', posts_controller_1.getRecentPosts);
postRouter.get('/top', posts_controller_1.getTopPosts);
postRouter.post('/write', upload_files_1.default.array('file', 3), posts_controller_1.writePost);
postRouter.get('/:postId', posts_controller_1.getPost);
postRouter.patch('/:postId', upload_files_1.default.array('file', 3), posts_controller_1.editPost);
postRouter.delete('/:postId', posts_controller_1.removePost);
exports.default = postRouter;
