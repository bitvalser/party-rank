import { NextFunction, Request, Response } from 'express';

export const ensureRole =
  (role: string[] = null): any =>
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (Array.isArray(role) && !role.includes(req.userRole)) {
      res.sendStatus(403);
    } else {
      next();
    }
  };
