import express, { Request, Response, NextFunction } from 'express';
import {
  getMemberPosts,
  checkExistingUser,
  createUser,
  logout,
  loginUser,
} from '../controllers/member2_controller';
const checkAuth = require('../middlewares/check-auth');
const router = express.Router();

//로그인
router.post('/login', loginUser);
//회원가입
router.post('/register', createUser);
//로그아웃
router.post('/logout', logout); //checkAuth 필요?

//기존유저인지조회
router.get('/existuser-check', async (req: Request, res: Response) => {
  const { email } = req.query;
  try {
    const result = await checkExistingUser(email as string);
    res.json(result);
  } catch (error) {
    console.error('An error occurred:', error);
    res.status(500).json({ error: '유효한 유저가 아닙니다.' });
  }
});

//멤버게시물조회
router.get('/posts', checkAuth, getMemberPosts);



export default router;
