import express from 'express';
import { handleFirstMessage } from '../controllers/chat-controller';
const chatRouter = express.Router();

chatRouter.post('/message', handleFirstMessage);

export default chatRouter;
