import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response, NextFunction } from 'express';

import commentRouter from './src/routes/comment-routes';
import memberRouter from './src/routes/member-routes';
import adminRouter from './src/routes/admin-routes';
import postRouter from './src/routes/post-routes';
import reservationRouter from './src/routes/reservaton-routes';

import session from 'express-session';
import passport from 'passport';
import cors from 'cors';

import {
  googleCallback,
  googleCallbackRedirect,
  googleStrategy,
} from './src/controllers/members-controllers';

const app = express();
app.use(express.json());

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

app.listen(3000, () => {
  console.log('server on!');
});

app.get('/auth/google', googleStrategy);
app.get('/auth/google/callback', googleCallback, googleCallbackRedirect);
app.use('/api/members', memberRouter);
app.use('/api/admin', adminRouter);
app.use('/api/comments', commentRouter);
app.use('/api/posts', postRouter);
app.use('/api/reservations', reservationRouter);
