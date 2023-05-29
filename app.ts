import express, { Request, Response, NextFunction } from 'express';
import mysql, { MysqlError, ConnectionConfig } from 'mysql';
import dotenv from 'dotenv';
dotenv.config(); // dotenv 패키지를 사용하여 환경 변수 로드

import { createMembersTable } from './src/models/members';

const app = express();

app.get('/', (req: Request, res: Response, next: NextFunction) => {
  res.send('welcome!');
});

app.listen('3000', () => {
  console.log('server on!');
});



createMembersTable(); // createMembersTable 함수 호출



