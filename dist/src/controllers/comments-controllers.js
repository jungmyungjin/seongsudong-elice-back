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
exports.updateComment = exports.deleteCommentAdmin = exports.deleteComment = exports.createComment = void 0;
const connection_1 = __importDefault(require("../../connection"));
// 특정 게시물에 댓글을 추가하는 함수
const createComment = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const postId = req.params.postId;
    const comment = req.body.comment;
    const email = req.user.email;
    // 로그인 확인
    if (!email) {
        return res.status(500).json({ message: '로그인 유저가 아닙니다.' });
    }
    // req에 필요한 데이터가 전부 들어왔는지 확인(로그인 제외)
    if (!comment) {
        return res
            .status(500)
            .json({ message: '입력 정보가 부족합니다. 다시 한번 확인해주세요.' });
    }
    // 존재하는 유저인지 확인
    const searchUserQuery = `SELECT * FROM members WHERE email = ?`;
    try {
        const [userData] = (yield connection_1.default
            .promise()
            .query(searchUserQuery, email));
        if (userData.length === 0) {
            return res.status(500).json({ message: '등록된 회원이 아닙니다.' });
        }
    }
    catch (err) {
        res.status(500).json({ message: '유저 조회 중 에러가 발생했습니다.' });
        throw new Error(`Error searching member: ${err}`);
    }
    // 존재하는 게시물인지 확인
    const searchPostQuery = 'SELECT * FROM posts WHERE id = ?';
    try {
        const [postData] = (yield connection_1.default
            .promise()
            .query(searchPostQuery, [postId]));
        if (postData.length === 0) {
            return res.status(500).json({ message: '존재하지 않는 게시물입니다.' });
        }
    }
    catch (err) {
        res.status(500).json({ message: '게시물 조회 중 에러가 발생했습니다.' });
        throw new Error(`Error searching post: ${err}`);
    }
    let createdCommentId = null;
    // 댓글 등록
    const createCommentQuery = 'INSERT INTO comments (post_id, content, author_email) VALUES (?, ?, ?)';
    try {
        const [result] = yield connection_1.default
            .promise()
            .query(createCommentQuery, [postId, comment, email]);
        createdCommentId = result.insertId;
    }
    catch (err) {
        res.status(500).json({ message: '댓글 등록 중 에러가 발생했습니다.' });
        throw new Error(`Error creating comment: ${err}`);
    }
    // 등록 데이터 반환
    const searchCreatedCommentQuery = `SELECT comments.*, members.name, members.generation
  FROM comments 
  JOIN members ON comments.author_email = members.email 
  WHERE comments.id = ?`;
    try {
        const [result] = (yield connection_1.default
            .promise()
            .query(searchCreatedCommentQuery, [createdCommentId]));
        res.status(201).json(result[0]);
    }
    catch (err) {
        res
            .status(500)
            .json({ message: '등록된 댓글 반환 중 에러가 발생했습니다.' });
        throw new Error(`Error searching comment: ${err}`);
    }
});
exports.createComment = createComment;
// 특정 게시물에서 댓글을 삭제하는 함수 - 일반 유저
const deleteComment = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const postId = req.params.postId;
    const commentId = req.params.commentId;
    const email = req.user.email;
    // 로그인 확인
    if (!email) {
        return res.status(500).json({ message: '로그인 유저가 아닙니다.' });
    }
    // req에 필요한 데이터가 전부 들어왔는지 확인(로그인 제외)
    if (!commentId) {
        return res
            .status(500)
            .json({ message: '입력 정보가 부족합니다. 다시 한번 확인해주세요.' });
    }
    // 존재하는 유저인지 확인
    const searchUserQuery = `SELECT * FROM members WHERE email = ?`;
    try {
        const [userData] = (yield connection_1.default
            .promise()
            .query(searchUserQuery, email));
        if (userData.length === 0) {
            return res.status(500).json({ message: '등록된 회원이 아닙니다.' });
        }
    }
    catch (err) {
        res.status(500).json({ message: '유저 조회 중 에러가 발생했습니다.' });
        throw new Error(`Error searching member: ${err}`);
    }
    // 존재하는 게시물인지 확인
    const searchPostQuery = `SELECT * FROM posts WHERE id = ?`;
    try {
        const [postData] = (yield connection_1.default
            .promise()
            .query(searchPostQuery, postId));
        if (postData.length === 0) {
            return res.status(500).json({ message: '존재하지 않는 게시물입니다.' });
        }
    }
    catch (err) {
        res.status(500).json({ message: '게시물 조회 중 에러가 발생했습니다.' });
        throw new Error(`Error searching post: ${err}`);
    }
    // 댓글 데이터 얻기
    let commentData;
    const searchCommentQuery = `SELECT * FROM comments WHERE id = ?`;
    try {
        [commentData] = (yield connection_1.default
            .promise()
            .query(searchCommentQuery, commentId));
        if (commentData.length === 0) {
            return res.status(500).json({ message: '존재하지 않는 댓글입니다.' });
        }
    }
    catch (err) {
        res
            .status(500)
            .json({ message: '댓글 데이터 조회 중 에러가 발생했습니다.' });
        throw new Error(`Error searching comment: ${err}`);
    }
    // 댓글 작성자인지 확인
    if (commentData[0].author_email !== email) {
        return res.status(500).json({ message: '댓글 삭제 권한이 없습니다.' });
    }
    // 댓글 삭제
    const deleteCommentQuery = `DELETE FROM comments WHERE id = ?`;
    try {
        const [result] = yield connection_1.default.promise().query(deleteCommentQuery, commentId);
        const { affectedRows } = result;
        if (affectedRows > 0) {
            // 204는 응답 데이터를 보낼 수 없으므로, 200으로 처리
            return res.status(200).json({
                message: '댓글 삭제가 성공하였습니다.',
            });
        }
    }
    catch (err) {
        res.status(500).json({ message: '댓글 삭제 중 에러가 발생했습니다.' });
        throw new Error(`Error deleting comment: ${err}`);
    }
});
exports.deleteComment = deleteComment;
// 특정 게시물의 데이터를 삭제하는 함수 - 관리자
const deleteCommentAdmin = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user) {
        return;
    }
    const postId = req.params.postId;
    const commentId = req.params.commentId;
    const email = req.user.email;
    const isAdmin = req.user.isAdmin;
    // 관리자 요청인지 확인 req.params.isAdmin 정보 확인
    if (!isAdmin) {
        return res.status(500).json({ message: '관리자가 아닙니다.' });
    }
    // 로그인 확인
    if (!email) {
        return res.status(500).json({ message: '로그인 유저가 아닙니다.' });
    }
    // req에 필요한 데이터가 전부 들어왔는지 확인(로그인 제외)
    if (!commentId) {
        return res
            .status(500)
            .json({ message: '입력 정보가 부족합니다. 다시 한번 확인해주세요.' });
    }
    // 존재하는 유저인지 확인
    const searchUserQuery = `SELECT * FROM members WHERE email = ?`;
    let userData;
    try {
        const [response] = (yield connection_1.default
            .promise()
            .query(searchUserQuery, email));
        if (response.length === 0) {
            return res.status(500).json({ message: '등록된 회원이 아닙니다.' });
        }
        userData = response[0];
    }
    catch (err) {
        res.status(500).json({ message: '유저 조회 중 에러가 발생했습니다.' });
        throw new Error(`Error searching member: ${err}`);
    }
    // 관리자 권한이 있는 유저인지 확인
    if (userData.isAdmin !== isAdmin) {
        return res.status(500).json({ message: '관리자 권한이 없습니다.' });
    }
    // 존재하는 게시물인지 확인
    const searchPostQuery = `SELECT * FROM posts WHERE id = ?`;
    try {
        const [postData] = (yield connection_1.default
            .promise()
            .query(searchPostQuery, postId));
        if (postData.length === 0) {
            return res.status(500).json({ message: '존재하지 않는 게시물입니다.' });
        }
    }
    catch (err) {
        res.status(500).json({ message: '게시물 조회 중 에러가 발생했습니다.' });
        throw new Error(`Error searching post: ${err}`);
    }
    // 댓글 데이터 얻기
    const searchCommentQuery = `SELECT * FROM comments WHERE id = ?`;
    try {
        const [commentData] = (yield connection_1.default
            .promise()
            .query(searchCommentQuery, commentId));
        if (commentData.length === 0) {
            return res.status(500).json({ message: '존재하지 않는 댓글입니다.' });
        }
    }
    catch (err) {
        res
            .status(500)
            .json({ message: '댓글 데이터 조회 중 에러가 발생했습니다.' });
        throw new Error(`Error searching comment: ${err}`);
    }
    // 댓글 삭제
    const deleteCommentQuery = `DELETE FROM comments WHERE id = ?`;
    try {
        const [result] = yield connection_1.default.promise().query(deleteCommentQuery, commentId);
        const { affectedRows } = result;
        if (affectedRows > 0) {
            return res.status(200).json({
                message: '댓글 삭제가 성공하였습니다.',
            });
        }
    }
    catch (err) {
        res.status(500).json({ message: '댓글 삭제 중 에러가 발생했습니다.' });
        throw new Error(`Error deleting comment: ${err}`);
    }
});
exports.deleteCommentAdmin = deleteCommentAdmin;
// 특정 게시물의 댓글을 수정하는 함수
const updateComment = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const postId = req.params.postId;
    const commentId = req.body.commentId;
    const updatedContent = req.body.updatedContent;
    const email = req.user.email;
    // 로그인 확인
    if (!email) {
        return res.status(500).json({ message: '로그인 유저가 아닙니다.' });
    }
    // req에 필요한 데이터가 전부 들어왔는지 확인(로그인 제외)
    if (!commentId || !updatedContent) {
        return res
            .status(500)
            .json({ message: '입력 정보가 부족합니다. 다시 한번 확인해주세요.' });
    }
    // 존재하는 유저인지 확인
    const searchUserQuery = `SELECT * FROM members WHERE email = ?`;
    try {
        const [userData] = (yield connection_1.default
            .promise()
            .query(searchUserQuery, email));
        if (userData.length === 0) {
            return res.status(500).json({ message: '등록된 회원이 아닙니다.' });
        }
    }
    catch (err) {
        res.status(500).json({ message: '유저 조회 중 에러가 발생했습니다.' });
        throw new Error(`Error searching member: ${err}`);
    }
    // 존재하는 게시물인지 확인
    const searchPostQuery = `SELECT * FROM posts WHERE id = ?`;
    try {
        const [postData] = (yield connection_1.default
            .promise()
            .query(searchPostQuery, postId));
        if (postData.length === 0) {
            return res.status(500).json({ message: '존재하지 않는 게시물입니다.' });
        }
    }
    catch (err) {
        res.status(500).json({ message: '게시물 조회 중 에러가 발생했습니다.' });
        throw new Error(`Error searching post: ${err}`);
    }
    // 존재하는 댓글인지 확인
    let commentData;
    const getCommentQuery = `SELECT * FROM comments WHERE id = ?`;
    try {
        [commentData] = (yield connection_1.default
            .promise()
            .query(getCommentQuery, commentId));
        if (commentData.length === 0) {
            return res.status(500).json({ message: '존재하지 않는 댓글입니다.' });
        }
    }
    catch (err) {
        res
            .status(500)
            .json({ message: '댓글 데이터 조회 중 에러가 발생했습니다.' });
        throw new Error(`Error matching author: ${err}`);
    }
    // 댓글 작성자인지 확인
    if (commentData[0].author_email !== email) {
        return res.status(500).json({ message: '댓글 수정 권한이 없습니다.' });
    }
    // 댓글 수정
    const updateCommentQuery = `UPDATE comments
  SET content = ?
  WHERE id = ?;
  `;
    try {
        yield connection_1.default.promise().query(updateCommentQuery, [updatedContent, commentId]);
    }
    catch (err) {
        res.status(500).json({ message: '댓글 수정 중 에러가 발생했습니다.' });
        throw new Error(`Error creating comment: ${err}`);
    }
    // 수정된 데이터 반환
    const searchCreatedCommentQuery = `SELECT comments.*, members.name, members.generation
  FROM comments 
  JOIN members ON comments.author_email = members.email 
  WHERE comments.id = ?`;
    try {
        const [result] = (yield connection_1.default
            .promise()
            .query(searchCreatedCommentQuery, commentId));
        res.status(200).json(result[0]);
    }
    catch (err) {
        res
            .status(500)
            .json({ message: '수정된 댓글 반환 중 에러가 발생했습니다.' });
        throw new Error(`Error searching comment: ${err}`);
    }
});
exports.updateComment = updateComment;
