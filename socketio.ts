import { RowDataPacket } from 'mysql2';
import { io } from './app';
import con from './connection';

io.on('connection', socket => {
  console.log('connected!');
});
