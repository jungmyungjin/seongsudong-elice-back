import fs from 'fs';
import { executeQuery } from '../db/index';

const sqlFilePath = './src/db/chat_room.sql'; // SQL 파일의 경로

const chatRoomTableSchema = fs.readFileSync(sqlFilePath, 'utf-8');

export const createChatRoomTable = async () => {
  try {
    await executeQuery(chatRoomTableSchema);
    console.log('Chat Room table created successfully');
  } catch (error) {
    console.error('Error creating Chat Room table:', error);
  }
};