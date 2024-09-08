import { Response } from 'express';

export const sendError = (res: Response, message: string, errorCode: number = 400, stack: string = null): void => {
  res.status(errorCode);
  res.json({
    ok: false,
    message: message || 'Unknown error!',
    stack,
  });
};
