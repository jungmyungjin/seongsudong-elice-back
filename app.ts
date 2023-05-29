import express, { Request, Response, NextFunction } from 'express';
import mysql, { MysqlError, ConnectionConfig } from 'mysql';
import dotenv from 'dotenv';

dotenv.config(); // dotenv 패키지를 사용하여 환경 변수 로드

const app = express();

app.get('/', (req: Request, res: Response, next: NextFunction) => {
  res.send('welcome!');
});

app.listen('3000', () => {
  console.log('server on!');
});

const connectionConfig: ConnectionConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
};

const connection = mysql.createConnection(connectionConfig);

connection.connect((err: MysqlError | null) => {
  if (err) throw err;
  console.log("Connected to Google MySQL database");
});
