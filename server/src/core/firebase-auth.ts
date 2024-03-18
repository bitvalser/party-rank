import { NextFunction, Request, Response } from 'express';
import * as admin from 'firebase-admin';

import { sendError } from './response-helper';

export const firebaseAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const decodedToken = await admin.app().auth().verifyIdToken(req.headers.authorization);
    req.firebaseToken = decodedToken;
    next();
  } catch (e) {
    sendError(res, 'Unauthorized!', 401);
  }
};
