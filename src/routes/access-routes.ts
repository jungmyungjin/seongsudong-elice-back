import express from 'express';
import {
  isUserAccess,
  setUserAccess,
  setUserExit,
} from '../controllers/access-controllers';
const checkAuth = require('../middlewares/check-auth');

const accessRouter = express.Router();

accessRouter.get('/loginUser', isUserAccess);
accessRouter.post('/login', setUserAccess);
accessRouter.delete('/logout', setUserExit);

export default accessRouter;
