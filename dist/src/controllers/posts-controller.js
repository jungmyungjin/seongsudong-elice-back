"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.removePost = exports.editPost = exports.getPost = exports.writePost = exports.getTopPosts = exports.getRecentPosts = exports.getPostList = void 0;
const connection_1 = __importDefault(require("../../connection"));
// 게시물 조회
const getPostList = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (req.query.category) {
            const category = req.query.category;
            // 카테고리별 게시물 조회
            if (category === '공지게시판') {
                const getNoticesQuery = 'SELECT id, category, title, images, description, created_at, views, email, name, generation, isAdmin FROM posts LEFT JOIN members ON posts.author_email = members.email WHERE category = ? ORDER BY created_at DESC';
                const getResult = yield connection_1.default
                    .promise()
                    .query(getNoticesQuery, [category]);
                console.log(getResult[0]);
                return res.status(200).json(getResult[0]);
            }
            else if (category === '자유게시판') {
                const getPostsQuery = 'SELECT id, category, title, images, description, created_at, views, email, name, generation, isAdmin FROM posts LEFT JOIN members ON posts.author_email = members.email WHERE category = ? ORDER BY created_at DESC';
                const getResult = yield connection_1.default.promise().query(getPostsQuery, [category]);
                return res.status(200).json(getResult[0]);
            }
        }
        else if (req.query.email) {
            // 사용자 작성 게시물 조회
            const email = req.query.email;
            const getMemberPostsQuery = 'SELECT id, category, title, images, description, created_at, views, email, name, generation, isAdmin FROM posts LEFT JOIN members ON posts.author_email = members.email WHERE author_email = ? ORDER BY created_at DESC';
            const getResult = yield connection_1.default.promise().query(getMemberPostsQuery, [email]);
            return res.status(200).json(getResult[0]);
        }
    }
    catch (err) {
        console.error(err);
        return res.status(400).json({ error: 'Query required' });
    }
});
exports.getPostList = getPostList;
// 최근 게시물 조회
const getRecentPosts = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const category = req.query.category;
        if (category === '공지게시판') {
            const getRecentPostsQuery = 'SELECT id, category, title, images, description, created_at, views, email, name, generation, isAdmin FROM posts LEFT JOIN members ON posts.author_email = members.email WHERE category = ? ORDER BY created_at DESC LIMIT 0, 3;';
            const getResult = yield connection_1.default
                .promise()
                .query(getRecentPostsQuery, [category]);
            return res.status(200).json(getResult[0]);
        }
        else {
            return res.status(400).json({ error: 'Invalid category' });
        }
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});
exports.getRecentPosts = getRecentPosts;
// 인기 게시물 조회
const getTopPosts = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const category = req.query.category;
        if (category === '자유게시판') {
            const getTopPostsQuery = 'SELECT id, category, title, images, description, created_at, views, email, name, generation, isAdmin FROM posts LEFT JOIN members ON posts.author_email = members.email WHERE category = ? ORDER BY views DESC LIMIT 0, 3;';
            const topPosts = yield connection_1.default.promise().query(getTopPostsQuery, [category]);
            return res.status(200).json(topPosts[0]);
        }
        else {
            return res.status(400).json({ error: 'Invalid category' });
        }
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});
exports.getTopPosts = getTopPosts;
// 게시물 생성
const writePost = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const imgPaths = Array.isArray(req.files)
            ? req.files.map((file) => `uploads/${file.filename}`)
            : [];
        const images = JSON.stringify(imgPaths);
        const { author_email: email, category, title, description } = req.body;
        const createPostQuery = `INSERT INTO posts (author_email, category, title, images, description)
      VALUES (?, ?, ?, ?, ?)`;
        const [result] = yield connection_1.default
            .promise()
            .query(createPostQuery, [email, category, title, images, description]);
        // 생성 데이터 반환
        const postId = result.insertId;
        const getPostQuery = `SELECT id, category, title, images, description, created_at, views, email, name, generation, isAdmin FROM posts LEFT JOIN members ON posts.author_email = members.email WHERE id = ${postId}`;
        const getResult = yield connection_1.default.promise().query(getPostQuery);
        return res.status(200).json(getResult[0]);
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});
exports.writePost = writePost;
// 게시물 상세 조회
const getPost = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const postId = req.params.postId;
        // 조회수 증가
        const incrementViewsQuery = 'UPDATE posts SET views = views +1 WHERE id = ?;';
        yield connection_1.default.promise().query(incrementViewsQuery, [postId]);
        const getPostQuery = 'SELECT id, category, title, images, description, created_at, views, email, name, generation, isAdmin FROM posts LEFT JOIN members ON posts.author_email = members.email WHERE id = ?;';
        const postResult = yield connection_1.default.promise().query(getPostQuery, [postId]);
        const postData = Array.isArray(postResult[0]) ? postResult[0][0] : null;
        const getCommentsQuery = 'SELECT * FROM comments JOIN members ON comments.author_email = members.email WHERE post_id = ? ORDER BY created_at DESC;';
        const commentsResult = yield connection_1.default
            .promise()
            .query(getCommentsQuery, [postId]);
        const commentsData = commentsResult[0];
        const resultData = {
            postData: postData,
            commentsData: commentsData,
        };
        return res.status(200).json(resultData);
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});
exports.getPost = getPost;
// 게시물 수정
const editPost = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log(req.body);
        let imgPaths;
        let images;
        if (Array.isArray(req.files) && req.files.length > 0) {
            imgPaths = req.files.map((file) => `uploads/${file.filename}`);
            images = JSON.stringify(imgPaths);
        }
        const postId = req.params.postId;
        const { title, description } = req.body;
        if (!images) {
            const updatePostQuery = ` UPDATE posts SET title = ?, description = ? WHERE id = ${postId}`;
            const [updateResult] = yield connection_1.default
                .promise()
                .query(updatePostQuery, [title, description]);
            // 수정 데이터 반환
            const getUpdatedPostQuery = `SELECT id, category, title, images, description, created_at, views, email, name, generation, isAdmin FROM posts LEFT JOIN members ON posts.author_email = members.email WHERE id = ?`;
            const [updatedPost] = yield connection_1.default
                .promise()
                .query(getUpdatedPostQuery, [postId]);
            return res.status(201).json(updatedPost);
        }
        const updatePostQuery = ` UPDATE posts SET title = ?, images = ?, description = ? WHERE id = ${postId}`;
        const [updateResult] = yield connection_1.default
            .promise()
            .query(updatePostQuery, [title, images, description]);
        // 수정 데이터 반환
        const getUpdatedPostQuery = `SELECT id, category, title, images, description, created_at, views, email, name, generation, isAdmin FROM posts LEFT JOIN members ON posts.author_email = members.email WHERE id = ?`;
        const [updatedPost] = yield connection_1.default
            .promise()
            .query(getUpdatedPostQuery, [postId]);
        return res.status(201).json(updatedPost);
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});
exports.editPost = editPost;
// 게시물 삭제
const removePost = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const postId = req.params.postId;
        // 선 댓글 삭제
        const deleteComments = 'DELETE FROM comments WHERE post_id = ?';
        const commentsResult = yield connection_1.default.promise().query(deleteComments, [postId]);
        // 후 게시글 삭제
        const deletePostQuery = 'DELETE FROM posts WHERE id = ?';
        const postResult = yield connection_1.default.promise().query(deletePostQuery, [postId]);
        return res.status(200).json({ result: 'Post deleted successfully' });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});
exports.removePost = removePost;
