import { RowDataPacket } from 'mysql2';
import { io } from './app';
import con from './connection';

// 메세지 유무 확인 함수
const checkFirstMessage = async (
  checkResult: RowDataPacket[],
  email: string,
) => {
  let roomId;

  if ((checkResult as RowDataPacket).length > 0) {
    // 첫 메세지가 아닐 경우, 결과에서 roomId 가져오기
    roomId = (checkResult[0] as RowDataPacket).room_id;
  } else {
    // 첫 메세지일 경우, 채팅방 생성
    const createChatRoomQuery = `INSERT INTO chat_rooms (member_email) VALUES (?);`;
    const [result] = await con.promise().query(createChatRoomQuery, [email]);
    const newRoomId = (result as RowDataPacket).insertId;
    roomId = newRoomId;
  }

  return roomId;
};

// 메세지 db 저장 함수
const saveMessages = async (
  roomId: string,
  email: string,
  messages: string,
) => {
  try {
    const saveMessagesQuery = `INSERT INTO room_messages (roomId, sender_email, message) VALUES (?, ?, ?);`;
    const saveMessagesResult = await con
      .promise()
      .query(saveMessagesQuery, [roomId, email, messages]);
    return saveMessagesResult;
  } catch (err) {
    console.error('saveMessages 실행 중 에러 발생:', err);
  }
};

// 모든 메세지 조회 함수
const getAllMessages = async (roomId: string) => {
  const getAllMessagesQuery = `SELECT * FROM chat_messages LEFT JOIN members ON chat_messages.sender_email = members.email WHERE room_id = ? ORDER BY created_at DESC;`;
  const getAllMessagesResult = await con
    .promise()
    .query(getAllMessagesQuery, [roomId]);

  return getAllMessagesResult;
};

// 연결
io.on('connection', socket => {
  console.log('connected!');

  // 첫 메세지 여부 판단
  /* 이렇게 코드를 짜니 checkChatRoom이라는 이벤트명이 맞지 않는 것 같네요...*/
  socket.on('checkChatRoom', async (email, messages) => {
    // email에 해당하는 메세지 찾기
    const checkChatRoomQuery = `SELECT * FROM chat_messages WHERE member_email = ? LIMIT 1;`;
    const checkResult = await con.promise().query(checkChatRoomQuery, [email]);

    const roomId = await checkFirstMessage(
      checkResult as RowDataPacket[],
      email,
    );

    // 메세지 db 저장
    saveMessages(roomId, email, messages);
    console.log('saved!');

    // 해당 채팅방의 모든 메세지 전달
    /* 메세지 업데이트하는 이벤트명 고민하다가 일단 messages로 해두었는데, 추천 부탁드립니다...! */
    socket.emit('messages', getAllMessages(roomId));
    console.log('sent!');
  });
});
