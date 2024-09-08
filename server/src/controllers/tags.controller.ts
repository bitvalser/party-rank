import { Request, Response } from 'express';

import { PartyTagModel } from '../models/party-tag.model';

export class AppTagsController {
  constructor() {
    this.getAll = this.getAll.bind(this);
  }

  public async getAll(req: Request, res: Response): Promise<void> {
    const tags = await PartyTagModel.find();

    res.json({
      ok: true,
      data: tags,
    });
  }
}
