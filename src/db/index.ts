import dotenv from 'dotenv';
dotenv.config();
import mysql, { MysqlError, ConnectionConfig } from 'mysql';


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


export const executeQuery = (query: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    connection.query(query, (error: MysqlError | null, results: any) => {
      if (error) {
        reject(error);
      } else {
        resolve(results);
      }
    });
  });
};

  