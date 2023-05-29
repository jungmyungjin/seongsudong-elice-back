import fs from 'fs';
import { executeQuery } from '../db/index';

const sqlFilePath = './src/db/reservation.sql'; // SQL 파일의 경로

const reservationTableSchema = fs.readFileSync(sqlFilePath, 'utf-8');

export const createReservationTable = async () => {
  try {
    await executeQuery(reservationTableSchema);
    console.log('Reservation table created successfully');
  } catch (error) {
    console.error('Error creating reservation table:', error);
  }
};
