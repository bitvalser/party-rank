import { DecodedIdToken } from 'firebase-admin/lib/auth/token-verifier';
import { IUser } from './user.interface';

declare global {
  namespace Express {
    interface Request {
      files?: any;
      firebaseToken?: DecodedIdToken;
    }
  }
}
