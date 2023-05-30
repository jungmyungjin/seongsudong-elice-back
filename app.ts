import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response, NextFunction } from 'express';

import commentRouter from './src/routes/comment-routes';

const app = express();
app.use(express.json());

app.get('/', (req: Request, res: Response, next: NextFunction) => {
  res.send('welcome!');
});

app.listen(5000, () => {
  console.log('server on!');
});

app.use('/api/comments', commentRouter);
