import express, { Request, Response, NextFunction } from 'express';
import { isAdmin, AuthenticatedRequest } from '../middlewares/isAdmin'
import passport from 'passport';

const router = express.Router();

// 어드민페이지 
router.get('/admin', isAdmin as any, (req, res) => {
    // isAdmin 미들웨어를 통과한 경우에만 실행됨
    res.send('관리자 페이지');
});

export default router;