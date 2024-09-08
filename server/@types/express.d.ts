declare namespace Express {
  import { UserRole } from '../src/types';

  export interface Request {
    userId?: string;
    userRole?: UserRole;
    files?: any;
  }
}
