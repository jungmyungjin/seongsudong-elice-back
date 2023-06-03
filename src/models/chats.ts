import fs from 'fs';
import { executeQuery } from '../db/index';

const sqlFilePath = './src/db/chat.sql'; // SQL 파일의 경로

const chatsTableSchema = fs.readFileSync(sqlFilePath, 'utf-8');

export const createChatsTable = async () => {
  try {
    await executeQuery(chatsTableSchema);
    console.log('Chats table created successfully');
  } catch (error) {
    console.error('Error creating Chats table:', error);
  }
};
