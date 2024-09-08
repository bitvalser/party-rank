import { NextFunction, Request, Response } from 'express';
import * as JWT from 'jsonwebtoken';

export const ensureToken = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(' ')[1];
    JWT.verify(token, process.env.JWT_SECRET, (err, data: JWT.JwtPayload) => {
      if (err) {
        res.sendStatus(401);
      } else {
        req.userId = data.userId;
        req.userRole = data.role;
        next();
      }
    });
  } else {
    res.sendStatus(401);
  }
};
