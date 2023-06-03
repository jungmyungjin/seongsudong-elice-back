import fs from 'fs';
import { executeQuery } from '../db/index';

const sqlFilePath = './src/db/comment.sql'; // SQL 파일의 경로

const commentsTableSchema = fs.readFileSync(sqlFilePath, 'utf-8');

export const createCommentsTable = async () => {
  try {
    await executeQuery(commentsTableSchema);
    console.log('Comments table created successfully');
  } catch (error) {
    console.error('Error creating Comments table:', error);
  }
};
