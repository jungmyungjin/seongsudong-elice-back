import { Request } from 'express';

interface User {
  email: string;
  isAdmin: boolean;
}

// Request 객체 확장
export interface ExtendedRequest extends Request {
  user: User;
}
