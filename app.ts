import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response, NextFunction } from 'express';

import commentRouter from './src/routes/comment-routes';
import memberRouter from './src/routes/member-routes';

import session from 'express-session';
import passport from 'passport';
import { googleCallback, googleCallbackRedirect, googleStrategy } from './src/controllers/members-controllers';
import {findOrCreateUser} from './src/controllers/members-controllers';


const app = express();
app.use(express.json());

app.use(session({
  secret: 'YourSecretKey',
  resave: false,
  saveUninitialized: false,
}));
app.use(passport.initialize());
app.use(passport.session());

app.get('/auth/google', googleStrategy);
app.get('/auth/google/callback', googleCallback, googleCallbackRedirect);




app.get('/', (req: Request, res: Response, next: NextFunction) => {
  res.sendFile(__dirname + '/index.html');
});


app.listen(3000, () => {
  console.log('server on!');
});

app.use('/api/comments', commentRouter);
app.use('/api/members', memberRouter);
//테이블 재생성방지를 위해 model, sql을 불러오는 함수는 모두 app.ts 삭제처리 하였습니다.