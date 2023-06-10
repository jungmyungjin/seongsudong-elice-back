import dotenv from 'dotenv';
dotenv.config();

import commentRouter from './src/routes/comment-routes';
import memberRouter from './src/routes/member-routes';
//import authRouter from './src/routes/auth-routes'
import adminRouter from './src/routes/admin-routes';
import postRouter from './src/routes/post-routes';
import reservationRouter from './src/routes/reservaton-routes';
import chatRouter from './src/routes/chat-routes';

import express from 'express';
import session from 'express-session';
import { RowDataPacket } from 'mysql2';
import passport from 'passport';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import { OAuth2Client } from 'google-auth-library';

import {
  googleCallback
} from './src/controllers/member2_controller';
import { saveMessages, getAllMessages, getRoomId, getLatestMessage } from './src/utils/chat-utils';
import con from './connection';
import { googleLogin } from './src/controllers/member2_controller';

const app = express();

const server = http.createServer(app);

// socket.io 서버 생성 및 옵션 설정
export const io = new Server(server, {
  cors: {
    origin: true, // 허용할 도메인
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  },
});

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
    preflightContinue: true
  }),
);

// Express 애플리케이션에 세션 미들웨어 추가
app.use(session(sessionConfig));

app.use(passport.initialize());
app.use(passport.session());

// app.get('/', (req: Request, res: Response, next: NextFunction) => {
//   res.sendFile(__dirname + '/index.html');
// });

app.use('/uploads', express.static('uploads'));

app.listen(3000, () => {
  console.log('server on!');
});

// socket.io 서버
server.listen(3002, () => {
  console.log(`Socket server on!!`);
});

//app.post('/auth/google', googleStrategy);
app.post('/auth/google', googleLogin);
app.get('/auth/google/callback', googleCallback);


app.use('/api/members', memberRouter);
app.use('/api/admin', adminRouter);
app.use('/api/comments', commentRouter);
app.use('/api/posts', postRouter);
app.use('/api/reservations', reservationRouter);
//app.use('/', authRouter);
app.use('/api/chat', chatRouter);


// socket.io 연결
io.on('connect', socket => {
  console.log('connected!!!');

  // 채팅방 생성 이벤트
  socket.on('createChatRoom', async (email: string, message: string) => {
    // email에 해당하는 메세지 찾기
    const checkChatRoomQuery = `SELECT room_id, sender_email, message, sentAt FROM chat_messages WHERE sender_email = ? LIMIT 1;`;
    const [checkResult] = await con.promise().query(checkChatRoomQuery, [email]);
    console.log(checkResult as RowDataPacket)

    let roomId;
  
    if ((checkResult as RowDataPacket).length > 0) {
      // 첫 메세지가 아닐 경우, 결과에서 roomId 가져오기
      roomId = (checkResult as RowDataPacket)[0].room_id;
      console.log("It's not a first msg. Got roomId!");
    } else {
      // 첫 메세지일 경우, 채팅방 생성
      const createChatRoomQuery = `INSERT INTO chat_rooms (member_email) VALUES (?);`;
      const [result] = await con.promise().query(createChatRoomQuery, [email]);
      const newRoomId = (result as RowDataPacket).insertId;
      roomId = newRoomId;
      console.log('ChatRoom created!') 
    }

    // ROOM 입장
    socket.join(roomId);
    console.log(`Entered in ${roomId}!`);

    // 해당 ROOM으로 메세지 전송
    io.to(roomId).emit('')

    // 메세지 db 저장
    await saveMessages(roomId, email, message);
    console.log('Messages saved!');

    // 해당 ROOM의 모든 메세지 전달
    io.to(roomId).emit('AllMessages', getAllMessages(roomId));
    console.log('Messages sent!');
  });

  // 메세지 받고 주기 이벤트
  socket.on('message', async (email: string, message: string) => {
    // roomId 찾아오기
    const roomId = await getRoomId(email);

     // 메세지 db 저장
     await saveMessages(roomId, email, message);
     console.log('Messages saved!', message);

     // 최신 메세지 전송
    io.to(roomId).emit('message', await getLatestMessage(roomId))
    console.log('sent message!');

    io.to(roomId).emit('isUserOnline', ) //접속데이터리스트
  })
});
