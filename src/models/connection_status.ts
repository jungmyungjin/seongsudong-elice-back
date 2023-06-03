import fs from 'fs';
import { executeQuery } from '../db/index';

const sqlFilePath = './src/db/connection_status.sql'; // SQL 파일의 경로

const connectionStatusTableSchema = fs.readFileSync(sqlFilePath, 'utf-8');

export const createConnectionStatusTable = async () => {
  try {
    await executeQuery(connectionStatusTableSchema);
    console.log('Connection Status table created successfully');
  } catch (error) {
    console.error('Error creating Connection Status table:', error);
  }
};
