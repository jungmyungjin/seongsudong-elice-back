import fs from 'fs';
import { executeQuery } from '../db/index';

const sqlFilePath = './src/db/member.sql'; // SQL 파일의 경로

const membersTableSchema = fs.readFileSync(sqlFilePath, 'utf-8');

export const createMembersTable = async () => {
  try {
    await executeQuery(membersTableSchema);
    console.log('Members table created successfully');
  } catch (error) {
    console.error('Error creating members table:', error);
  }
};

