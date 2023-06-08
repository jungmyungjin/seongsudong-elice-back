import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response, NextFunction } from 'express';

import commentRouter from './src/routes/comment-routes';
import memberRouter from './src/routes/member-routes';
import postRouter from './src/routes/post-routes';
import reservationRouter from './src/routes/reservaton-routes';

import session from 'express-session';
import passport from 'passport';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';

import {
  googleCallback,
  googleCallbackRedirect,
  googleStrategy,
} from './src/controllers/members-controllers';

const app = express();

const server = http.createServer(app);

// 세션 설정
const sessionConfig = {
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // HTTPS가 아닌 경우 false로 설정
    maxAge: 1000 * 60 * 60, // 세션 유효 기간 (예: 1시간)
  },
};

app.use(express.json());

// cors
app.use(
  cors({
    origin: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    maxAge: 86400,
    optionsSuccessStatus: 200,
  }),
);

// Express 애플리케이션에 세션 미들웨어 추가
app.use(session(sessionConfig));

app.use(passport.initialize());
app.use(passport.session());

app.get('/', (req: Request, res: Response, next: NextFunction) => {
  res.sendFile(__dirname + '/index.html');
});

app.use('/uploads', express.static('uploads'));

app.get('/auth/google', googleStrategy);
app.get('/auth/google/callback', googleCallback, googleCallbackRedirect);

app.use('/api/members', memberRouter);
app.use('/api/comments', commentRouter);
app.use('/api/posts', postRouter);
app.use('/api/reservations', reservationRouter);

// socket.io 서버 생성 및 옵션 설정
export const io = new Server(server, {
  cors: {
    origin: true, // 허용할 도메인
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  },
});

app.listen(3000, () => {
  console.log('server on!');
});

// socket.io 서버
server.listen(3001, () => {
  console.log(`Socket server on 3001 !!`);
});
