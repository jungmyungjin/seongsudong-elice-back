import express from 'express';
import session from 'express-session';
import { RowDataPacket } from 'mysql2';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';

import commentRouter from './src/routes/comment-routes';
import memberRouter from './src/routes/member-routes';
import adminRouter from './src/routes/admin-routes';
import postRouter from './src/routes/post-routes';
import reservationRouter from './src/routes/reservaton-routes';
import chatRouter from './src/routes/chat-routes';
import accessRouter from './src/routes/access-routes';

import {
  getRoomId,
  getAllMessages,
  getMembersMessages,
  createChatRoom,
  saveMessages,
  getLatestMessage,
  getAllConnectionData,
} from './src/utils/chat-utils';

dotenv.config();

const cookieParser = require('cookie-parser');

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
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
  }),
);

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

app.use('/uploads', express.static('uploads'));

app.listen(process.env.PORT || 8080, () => {
  console.log('server on!');
});

// socket.io 서버
server.listen(3002, () => {
  console.log(`Socket server on!!`);
});

app.use('/api/members', memberRouter);
app.use('/api/admin', adminRouter);
app.use('/api/comments', commentRouter);
app.use('/api/posts', postRouter);
app.use('/api/reservations', reservationRouter);
app.use('/api/chat', chatRouter);
app.use('/api/access', accessRouter);

/* socket.io 연결 */
io.on('connect', socket => {
  console.log('connected!!!');

  //let currentRoomId: any;

  /* 채팅방 입장: 해당 채팅방의 모든 메세지 가져오기 */
  socket.on('enterChatRoom', async (member_email: string) => {
    try {
      console.log(member_email);
      if (!member_email) {
        throw new Error('Required fields are missing.');
      }

      // roomId 찾아오기
      const roomId = await getRoomId(member_email);
      console.log('foundRoomId:', roomId);

      if (!roomId) {
        console.log('Room not found. Returning empty array.');
        /* if (!방) {'메세지 없다'} -> null 전송 */
        socket.emit('AllMessages', null);
        return;
      }

      // 사용자가 기존의 채팅방에 있었다면 나가기
      //if (currentRoomId) {
      //   socket.leave(currentRoomId);
      //   console.log(`Left room ${currentRoomId}`);
      //}

      // 새로운 채팅방 참여
      socket.join(roomId);
      //currentRoomId = roomId;
      console.log(`Entered room ${roomId}!`);

      const room = io.sockets.adapter.rooms.get(roomId);

      // Check if the room exists
      if (room) {
        // Convert the Set of sockets to an array of socket IDs
        const clients = Array.from(room);

        // Iterate over the clients and access their socket IDs
        clients.forEach(clientId => {
          console.log(`(E)Client ${clientId} is in the room ${roomId}`);
        });
      } else {
        console.log(`(E)Room ${roomId} does not exist`);
      }

      // 해당 방의 모든 메세지 가져오기
      const allMessages = await getAllMessages(roomId);

      /* 가져온 메세지를 클라이언트로 전송 */
      socket.emit('AllMessages', allMessages);
    } catch (error) {
      console.error('채팅방 입장 중 에러 발생', error);
      socket.emit('enterChatRoomError', '채팅방 입장 중 에러 발생');
    }
  });

  /* 메세지 받고 주기: 첫 메세지일 경우 채팅방 생성 */
  socket.on(
    'message',
    async (member_email: string, sender_email: string, message: string) => {
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
        socket.emit('message', latestMessage);

        /* 접속 유저 리스트 전송 */
        const connectionData = await getAllConnectionData();
        socket.emit('isOnline', connectionData);
      } catch (error) {
        console.error('메세지 처리 중 오류 발생', error);
        socket.emit('messageError', '메세지 처리 중 오류 발생');
      }
    },
  );
});
