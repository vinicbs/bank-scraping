import { Request } from 'express';
import User from '../users/users.interface';

interface RequestWithUser extends Request {
  user: User;
}

export default RequestWithUser;
