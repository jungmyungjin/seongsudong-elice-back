import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response, NextFunction } from 'express';

import { createMembersTable } from './src/models/members';
import { createConnectionStatusTable } from './src/models/connection_status';
import { createChatRoomTable } from './src/models/chat_room';
import { createChatsTable } from './src/models/chats';
import { createPostsTable } from './src/models/posts';
import { createCommentsTable } from './src/models/comments';
import { createSeatsTable } from './src/models/seats';
import { createReservationTable } from './src/models/reservations';
import commentRouter from './src/routes/comment-routes';
import postRouter from './src/routes/post-routes';

const app = express();
app.use(express.json());

app.get('/', (req: Request, res: Response, next: NextFunction) => {
  res.send('welcome!');
});

app.listen(5000, () => {
  console.log('server on!');
});

app.use('/api/comments', commentRouter);
app.use('/api/posts', postRouter);
