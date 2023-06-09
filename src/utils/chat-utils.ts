//import express, { Request, Response, NextFunction } from 'express';
//import { RowDataPacket } from 'mysql2';
import con from '../../connection';

  // 메세지 db 저장 함수
  export const saveMessages = async (
    roomId: string,
    email: string,
    messages: string,
  ) => {
    try {
        /* 현재 시간 한국시간으로 변환 로직 구현해야 함!(for sendAt) */
      const sentAt = new Date();
      const saveMessagesQuery = `INSERT INTO chat_messages (room_id, sender_email, message, sentAt) VALUES (?, ?, ?, ?);`;
      const saveMessagesResult = await con
        .promise()
        .query(saveMessagesQuery, [roomId, email, messages, sentAt]);
      return saveMessagesResult;
    } catch (err) {
      console.error('saveMessages 실행 중 에러 발생:', err);
    }
  };
  
  // 모든 메세지 조회 함수
  export const getAllMessages = async (roomId: string) => {
    const getAllMessagesQuery = `SELECT message_id, room_id, sender_email, message, sentAt, name, generation FROM chat_messages LEFT JOIN members ON chat_messages.sender_email = members.email WHERE room_id = ? ORDER BY sentAt DESC;`;
    const getAllMessagesResult = await con
      .promise()
      .query(getAllMessagesQuery, [roomId]);

    return getAllMessagesResult[0];
  };
  