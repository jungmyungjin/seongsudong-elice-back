import fs from 'fs';
import { executeQuery } from '../db/index';

const sqlFilePath = './src/db/seat.sql'; // SQL 파일의 경로

const seatTableSchema = fs.readFileSync(sqlFilePath, 'utf-8');

export const createSeatsTable = async () => {
  try {
    await executeQuery(seatTableSchema);
    console.log('Seats table created successfully');
  } catch (error) {
    console.error('Error creating reservation table:', error);
  }
};
