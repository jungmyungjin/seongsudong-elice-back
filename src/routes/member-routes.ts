import express, { Request, Response, NextFunction } from 'express';
import { getMemberPosts, findOrCreateUser, logout } from '../controllers/members-controllers';
import { googleCallback, googleCallbackRedirect, googleStrategy } from '../controllers/members-controllers';
import passport from 'passport';

const router = express.Router();

// Passport 초기화 및 미들웨어 설정
router.use(passport.initialize());
router.use(passport.session());

router.get('/auth/google', googleStrategy);
router.get('/auth/google/callback', googleCallback, googleCallbackRedirect);
router.post('/logout', logout);


router.post('/register', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;
    const user = await findOrCreateUser({ email });
    res.json(user);
  } catch (error) {
    next(error);
  }
});
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







export default router;
