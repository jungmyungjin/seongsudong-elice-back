import dotenv from 'dotenv';
dotenv.config();

import commentRouter from './src/routes/comment-routes';
import memberRouter from './src/routes/member-routes';
//import authRouter from './src/routes/auth-routes'
import adminRouter from './src/routes/admin-routes';
import postRouter from './src/routes/post-routes';
import reservationRouter from './src/routes/reservaton-routes';
import chatRouter from './src/routes/chat-routes';
import accessRouter from './src/routes/access-routes';

import express from 'express';
import session from 'express-session';
import { RowDataPacket } from 'mysql2';
import passport from 'passport';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import { OAuth2Client } from 'google-auth-library';

// import {
//   googleCallback,
//   googleCallbackRedirect,
//   googleStrategy,
// } from './src/controllers/members-controllers';
import { getRoomId, getAllMessages, getMembersMessages, createChatRoom, saveMessages, getLatestMessage, getConnectionData } from './src/utils/chat-utils';
import con from './connection';
// import { googleCallback, googleLogin } from './src/controllers/member2_controller';
const cookieParser = require('cookie-parser');

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    // origin: true,
    origin: 'http://localhost:3000',
    credentials: true,
    allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept'],
    exposedHeaders: ['set-cookie'],
  }),
);
app.use(
  session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    // cookie: {
    //   secure: false, // HTTPS가 아닌 경우 false로 설정
    //   maxAge: 1000 * 60 * 60, // 세션 유효 기간 (예: 1시간)
    // },
  }),
);

const server = http.createServer(app);

// app.use(function (req, res, next) {
//   // res.header('Access-Control-Allow-Origin', req.headers.origin);
//   res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
//   res.header(
//     'Access-Control-Allow-Headers',
//     'Origin, X-Requested-With, Content-Type, Accept',
//   );
//   res.header('Access-Control-Allow-Credentials', 'true');
//   next();
// });

// socket.io 서버 생성 및 옵션 설정
export const io = new Server(server, {
  cors: {
    origin: true, // 허용할 도메인
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  },
});

// cors
// app.use(
//   cors({
//     origin: true,
//     methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
//     allowedHeaders: ['Content-Type', 'Authorization'],
//     credentials: true,
//     maxAge: 86400,
//     optionsSuccessStatus: 200,
//     preflightContinue: true,
//   }),
// );

// app.use(passport.initialize());
// app.use(passport.session());

// app.get('/', (req: Request, res: Response, next: NextFunction) => {
//   res.sendFile(__dirname + '/index.html');
// });

app.use('/uploads', express.static('uploads'));

app.listen(8000, () => {
  console.log('server on!');
});

// socket.io 서버
server.listen(3002, () => {
  console.log(`Socket server on!!`);
});

//app.post('/auth/google', googleStrategy);
// app.post('/auth/google', googleLogin);
// app.get('/auth/google/callback', googleCallback);

app.use('/api/members', memberRouter);
app.use('/api/admin', adminRouter);
app.use('/api/comments', commentRouter);
app.use('/api/posts', postRouter);
app.use('/api/reservations', reservationRouter);
//app.use('/', authRouter);
app.use('/api/chat', chatRouter);
app.use('/api/access', accessRouter);


/* socket.io 연결 */
io.on('connect', socket => {
  console.log('connected!!!');

  // let currentRoomId: any;

  /* 채팅방 입장: 해당 채팅방의 모든 메세지 가져오기 */
  socket.on('enterChatRoom', async (member_email: string) => {
    try {

      if (!member_email) {
        throw new Error('Required fields are missing.');
      }

      // roomId 찾아오기
      const roomId = await getRoomId(member_email);
      console.log(roomId);
  
      // if (currentRoomId) {
      //   socket.leave(currentRoomId);
      //   console.log(`Left room ${currentRoomId}`);
      // }
  
      if (roomId) {
        console.log("It's not the first message. Got roomId!");
      } else {
        console.log('Room not found. Returning empty array.');
        /* if (!방) {'메세지 없다'} -> null 전송 */
        socket.emit('AllMessages', null);
        return;
      }
  
      // 해당 방의 모든 메세지 가져오기
      const allMessages = await getAllMessages(roomId);
      console.log(allMessages);
  
      /* 가져온 메세지를 클라이언트로 전송 */
      socket.emit('AllMessages', allMessages);
    } catch (error) {
      console.error('채팅방 입장 중 에러 발생', error);
      socket.emit('enterChatRoomError', '채팅방 입장 중 에러 발생');
    }
  });


  /* 메세지 받고 주기: 첫 메세지일 경우 채팅방 생성 */
  socket.on('message', async (member_email: string, sender_email: string, message: string) => {
    // 소켓이 room 안에 있는지 확인
    // if (!currentRoomId) {
    //   console.log("Socket is not in any room. Cannot send message.");
    //   return;
    // }
    try {
      if (!member_email || !sender_email || !message) {
        throw new Error('Required fields are missing.');
      }

      let roomId;
  
      // 보낸 메세지 가져오기
      const membersMessages = await getMembersMessages(member_email);
    
      if ((membersMessages as RowDataPacket).length > 0) {
        roomId = (membersMessages as RowDataPacket)[0].room_id;
        console.log("It's not the first msg. Got roomId!");
      } else {
        // 보낸 메세지가 없으면, 채팅방 생성 및 roomId 업데이트
        const newRoomId = await createChatRoom(member_email);
        roomId = newRoomId;
        console.log('ChatRoom created!', roomId);
  
        /* socket ROOM 입장 */
        socket.join(roomId);
        // currentRoomId = roomId;
        console.log(`Entered in ${roomId}!`);
      }
    
      // 메세지 db 저장
      await saveMessages(roomId, sender_email, message);
      console.log('Messages saved!', message);
  
      /* 최신 메세지 전송 */
      const latestMessage = await getLatestMessage(roomId);
      console.log('latestMessage',latestMessage)
      io.emit('message', latestMessage);

    } catch (error) {
      console.error('메세지 처리 중 오류 발생', error);
      socket.emit('messageError', '메세지 처리 중 오류 발생');
    }
  });

  /* 접속 유저 리스트 전송 */
  socket.on('isOnlineStatus', async (member_email, admin_email) => {
    try {
      if (!member_email || !admin_email) {
        throw new Error('Required fields are missing.');
      }
  
      const connectionData = await getConnectionData(member_email, admin_email);
      io.emit('onlineStatus', connectionData);
    } catch (error) {
      console.error('접속 데이터 전송 중 오류 발생', error);
      socket.emit('isOnlineStatusError', '접속 데이터 전송 중 오류 발생');
    }
  })
});
