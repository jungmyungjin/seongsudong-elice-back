import { Request, Response, NextFunction } from 'express';
import { RowDataPacket } from 'mysql2/promise';

import con from '../../connection';

export const getChatRoomList = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const getChatRoomListQuery = `SELECT chat_rooms.room_id, members.email, members.name, members.generation, chat_messages.message, chat_messages.sentAt
  FROM chat_rooms
  JOIN members ON chat_rooms.member_email = members.email
  JOIN (
      SELECT room_id, MAX(sentAt) AS latest_message_date
      FROM chat_messages
      GROUP BY room_id
  ) AS latest_messages ON chat_rooms.room_id = latest_messages.room_id
  JOIN chat_messages ON latest_messages.room_id = chat_messages.room_id AND latest_messages.latest_message_date = chat_messages.sentAt ORDER BY chat_messages.sentAt DESC;
  `;
  const getChatRoomListResult = await con.promise().query(getChatRoomListQuery);

  return res.status(200).json(getChatRoomListResult[0]);
};
