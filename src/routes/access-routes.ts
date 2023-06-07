import express from 'express';
import { setUserAccess, setUserExit } from '../controllers/access-controllers';

const accessRouter = express.Router();

accessRouter.post('/login', setUserAccess);
accessRouter.delete('/logout', setUserExit);

export default accessRouter;
