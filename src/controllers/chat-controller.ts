import { Request, Response, NextFunction } from 'express';
import { RowDataPacket } from 'mysql2/promise';

import con from '../../connection';

export const getChatRoomList = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const getChatRoomListQuery = `SELECT * FROM chat_messages LEFT JOIN chat_rooms ON chat_messages.room_id = chat_rooms.room_id ORDER BY created_at LIMIT 1;`;
  const getChatRoomListResult = await con.promise().query(getChatRoomListQuery);
  return res.status(200).json(getChatRoomListResult);
};
