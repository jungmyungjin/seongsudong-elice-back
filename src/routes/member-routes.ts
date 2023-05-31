import express, { Request, Response, NextFunction } from 'express';
import { findOrCreateUser, logout } from '../controllers/members-controllers';
import { googleCallback, googleCallbackRedirect, googleStrategy } from '../controllers/members-controllers';
const router = express.Router();

router.post('/register', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;
    const user = await findOrCreateUser({ email });
    res.json(user);
  } catch (error) {
    next(error);
  }
});


router.get('/auth/google', googleStrategy);
router.get('/auth/google/callback', googleCallback, googleCallbackRedirect);
router.post('/logout', logout);



export default router;
