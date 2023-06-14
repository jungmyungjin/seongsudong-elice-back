import { RowDataPacket } from 'mysql2';
import con from '../../connection';

// roomId 조회 함수
export const getRoomId = async (member_email: string) => {
  try {
    if (!member_email) {
      throw new Error('Member email is required.');
    }

    const getRoomIdQuery = `SELECT room_id FROM chat_rooms WHERE member_email = ?;`;
    const [getRoomIdResult] = await con
      .promise()
      .query(getRoomIdQuery, [member_email]);
    
    if (!getRoomIdResult || (getRoomIdResult  as RowDataPacket).length === 0) {
      return null;
    } else {
      const roomId = (getRoomIdResult as RowDataPacket)[0].room_id;
      return roomId;
    }
  } catch (error) {
    console.error('Error occurred while getting room ID:', error);
    throw new Error('Error occurred while getting room ID');
  }
}

// 모든 메세지 조회 함수
export const getAllMessages = async (roomId: number) => {
  try {
    if (!roomId) {
      throw new Error('Room ID is required.');
    }
  
    const getAllMessagesQuery = `
      SELECT message_id, room_id, sender_email, message, sentAt, name, generation 
      FROM chat_messages 
      LEFT JOIN members ON chat_messages.sender_email = members.email 
      WHERE room_id = ? 
      ORDER BY sentAt ASC;
    `;
    const getAllMessagesResult = await con
      .promise()
      .query(getAllMessagesQuery, [roomId]);
    return getAllMessagesResult[0];
  } catch (error) {
    console.error('Error occurred while getting All Messages:', error);
    throw new Error('Error occurred while getting All Messages');
  }
};

// member가 보낸 메세지 조회
export const getMembersMessages = async (member_email: string) => {
  try {
    if (!member_email) {
      throw new Error('Member email is required.');
    }

    const checkChatRoomQuery = `
      SELECT room_id, sender_email, message, sentAt 
      FROM chat_messages 
      WHERE sender_email = ? LIMIT 1;
    `;
    const [checkResult] = await con
      .promise()
      .query(checkChatRoomQuery, [member_email]);
    return checkResult;
  } catch (error) {
      console.error('Error occurred while getting member\'s messages:', error);
      throw new Error('Error occurred while getting member\'s messages');
  }
}

  // 채팅방 생성
export const createChatRoom = async (member_email: string) => {
  try {
    if (!member_email) {
      throw new Error('Member email is required.');
    }

    const createChatRoomQuery = `INSERT INTO chat_rooms (member_email) VALUES (?);`;
    const [createChatRoomResult] = await con
      .promise()
      .query(createChatRoomQuery, [member_email]);
    const newRoomId = (createChatRoomResult as RowDataPacket).insertId;
    return newRoomId;
  } catch (error) {
      console.error('Error occurred while creating chat room:', error);
      throw new Error('Error occurred while creating chat room.');
  }
}

// 메세지 db 저장 함수
export const saveMessages = async (
  roomId: string,
    email: string,
    message: string,
  ) => {
    try {
      if (!roomId || !email || !message) {
        throw new Error('Required fields are missing.');
      }

      // UTC 시간 -> KR 시간
      const date = new Date();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');
      
      const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
      const sentAt = formattedDate;

      const saveMessagesQuery = `
        INSERT INTO chat_messages (room_id, sender_email, message, sentAt) 
        VALUES (?, ?, ?, ?);
      `;
      const saveMessagesResult = await con
        .promise()
        .query(saveMessagesQuery, [roomId, email, message, sentAt]);
      return saveMessagesResult;
    } catch (error) {
      console.error('Error occurred while saving chat room:', error);
      throw new Error('Error occurred while saving chat room.');
    }
  };
  

// 최신 메세지 조회 함수
export const getLatestMessage = async (roomId: number) => {
  try {
    if (!roomId) {
      throw new Error('Room ID is required.');
    }

    const getLatestMessageQuery = `
      SELECT sender_email, name, generation, message, sentAt 
      FROM chat_messages 
      LEFT JOIN members ON chat_messages.sender_email = members.email 
      WHERE chat_messages.room_id = ? AND chat_messages.sentAt = (SELECT MAX(sentAt) FROM chat_messages WHERE   room_id = ?)
    `;
    const [getLatestMessageResult] = await con
      .promise()
      .query(getLatestMessageQuery, [roomId, roomId]);
    return getLatestMessageResult;
  } catch (error) {
    console.error('Error occurred while getting latest message:', error);
    throw new Error('Error occurred while getting latest message.');
  }
}

// 접속 데이터 조회
export const getConnectionData = async (member_email: string, admin_email: string) => {
  try {
    if (!member_email || !admin_email) {
      throw new Error('Member_email and admin_email are required.');
    }

    const getConnectionDataQuery = `
      SELECT member_email 
      FROM connection_status 
      WHERE member_email IN (?, ?);
    `;
    const [getConnectionDataResult] = await con
      .promise()
      .query(getConnectionDataQuery, [member_email, admin_email]);
    return getConnectionDataResult;
  } catch (error) {
    console.error('Error occurred while getting all connection data:', error);
    throw new Error('Error occurred while getting all connection data.');
  } 
}
