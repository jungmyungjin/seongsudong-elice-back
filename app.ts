import mysql, { MysqlError } from 'mysql';
import express, { Request, Response, NextFunction } from 'express';

const app = express();

app.get('/', (req: Request, res: Response, next: NextFunction) => {
  res.send('welcome!');
});

app.listen('3000', () => {
  console.log('server on!');
});

const connection = mysql.createConnection({
  host: "34.135.60.118",
  user: "root",
  password: "elicefirefighter",
  database: "seongsudongelice",
});

connection.connect((err: MysqlError | null) => {
  if (err) throw err;
  console.log("Connected to Google MySQL database");
});