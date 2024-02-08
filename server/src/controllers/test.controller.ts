import { Request, Response } from 'express';

export class AppTestController {
  constructor() {
    this.testConnection = this.testConnection.bind(this);
  }

  public testConnection(req: Request, res: Response): void {
    res.json({
      ok: true,
    });
  }
}
