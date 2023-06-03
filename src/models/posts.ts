import fs from 'fs';
import { executeQuery } from '../db/index';

const sqlFilePath = './src/db/post.sql'; // SQL 파일의 경로

const postsTableSchema = fs.readFileSync(sqlFilePath, 'utf-8');

export const createPostsTable = async () => {
  try {
    await executeQuery(postsTableSchema);
    console.log('Posts table created successfully');
  } catch (error) {
    console.error('Error creating Posts table:', error);
  }
};
