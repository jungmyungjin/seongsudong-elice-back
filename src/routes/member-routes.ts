import express, { Request, Response, NextFunction } from 'express';
import { getMemberPosts, checkExistingUser, createUser, googleCallbackRedirect, logout, googleStrategy, googleCallback } from '../controllers/members-controllers';
import { isAdmin } from '../middlewares/isAdmin'
import passport from 'passport';


const router = express.Router();

// Passport 초기화 및 미들웨어 설정
router.use(passport.initialize());
router.use(passport.session());

//router.get('/auth/google', googleStrategy);
//router.get('/auth/google/callback', googleCallback, googleCallbackRedirect);
router.post('/logout', logout);

// Google OAuth 인증 요청 처리
router.get('/auth/google', passport.authenticate('google', { scope: ['email'] }));
// Google 로그인 콜백 처리
router.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), googleCallbackRedirect);


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

//회원가입
router.post('/register', async (req: Request, res: Response) => {
  const { email, name, generation } = req.body;
  try {
    const createdUser = await createUser(email, name, generation);
    res.json(createdUser);
  } catch (error) {
    console.error('An error occurred:', error);
    res.status(500).json({ error: 'An error occurred' });
  }
});

//멤버게시물조회
router.get('/posts', async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new Error('User not authenticated');
    }
    const { email } = req.user as any;
    const posts = await getMemberPosts(email);
    res.json(posts);
  } catch (error) {
    next(error);
  }
});




// router.post('/register', async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     const { email } = req.body;
//     const user = await findOrCreateUser({ email });
//     res.json(user);
//   } catch (error) {
//     next(error);
//   }
// });

export default router;
