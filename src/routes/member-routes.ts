import express, { Request, Response, NextFunction } from 'express';
import { findOrCreateUser } from '../controllers/members-controllers';

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





export default router;
