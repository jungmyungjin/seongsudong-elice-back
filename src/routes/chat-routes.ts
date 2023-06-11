import express from 'express';
import { getChatRoomList } from '../controllers/chat-controller';

const chatRouter = express.Router();

chatRouter.get('/', getChatRoomList);

export default chatRouter;
