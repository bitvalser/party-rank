import { Request, Response } from 'express';
import mongoose from 'mongoose';

export class AppTestController {
  constructor() {
    this.testConnection = this.testConnection.bind(this);
    this.testDBConnection = this.testDBConnection.bind(this);
  }

  public testConnection(req: Request, res: Response): void {
    res.json({
      ok: true,
    });
  }

  public testDBConnection(req: Request, res: Response): void {
    res.json({
      ok: mongoose.connection.readyState === 2,
    });
  }
}
