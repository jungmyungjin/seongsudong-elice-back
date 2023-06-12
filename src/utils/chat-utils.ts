import { RowDataPacket } from 'mysql2';
import con from '../../connection';

  // 메세지 db 저장 함수
  export const saveMessages = async (
    roomId: string,
    email: string,
    message: string,
  ) => {
    try {
      // UTC 시간 -> KR 시간
      const utcTime = new Date();
      const koreanTime = new Date(utcTime + "Z");
      koreanTime.setHours(koreanTime.getHours() + 9);
      const formattedTime = `${koreanTime.toISOString().slice(0, 19).replace("T", " ")}`;
      const sentAt = formattedTime;

      const message = '되나?';

      const saveMessagesQuery = `
        INSERT INTO chat_messages (room_id, sender_email, message, sentAt) 
        VALUES (?, ?, ?, ?);
      `;
      const saveMessagesResult = await con
        .promise()
        .query(saveMessagesQuery, [roomId, email, message, sentAt]);
      return saveMessagesResult;
    } catch (err) {
      console.error('saveMessages 실행 중 에러 발생:', err);
    }
  };
  
  // 모든 메세지 조회 함수
  export const getAllMessages = async (roomId: number) => {
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
  };

  // roomId 조회 함수
  export const getRoomId = async (memberEmail: string) => {
    const getRoomIdQuery = `SELECT room_id FROM chat_rooms WHERE member_email = ?;`;
    const [getRoomIdResult] = await con.promise().query(getRoomIdQuery, [memberEmail]);
    const roomId = (getRoomIdResult as RowDataPacket)[0].room_id;
    return roomId;
  }
  
  // 최신 메세지 조회 함수
  export const getLatestMessage = async (roomId: number) => {
    const getLatestMessageQuery = `
      SELECT sender_email, name, generation, message, sentAt 
      FROM chat_messages 
      LEFT JOIN members ON chat_messages.sender_email = members.email 
      WHERE chat_messages.room_id = ? AND chat_messages.sentAt = (SELECT MAX(sentAt) FROM chat_messages WHERE   room_id = ?)
    `;
    const [getLatestMessageResult] = await con.promise().query(getLatestMessageQuery, [roomId, roomId]);
    console.log(getLatestMessageResult)
    return getLatestMessageResult;
  }

  // 접속 데이터 조회
  export const getAllConnectionData = async () => {
    const getAllConnectionDataQuery = `SELECT member_email FROM connection_status;`;
    const [getAllConnectionDataResult] = await con.promise().query(getAllConnectionDataQuery);
    console.log(getAllConnectionDataResult);
    return getAllConnectionDataResult;
  }