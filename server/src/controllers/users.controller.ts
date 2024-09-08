import { Request, Response } from 'express';
import { RootFilterQuery } from 'mongoose';

import { UserModel } from '../models';
import { IUser } from '../types';

export class AppUsersController {
  constructor() {
    this.getUserById = this.getUserById.bind(this);
    this.getMe = this.getMe.bind(this);
    this.searchUsers = this.searchUsers.bind(this);
  }

  public async getMe(req: Request, res: Response): Promise<void> {
    const user = await UserModel.findById(req.userId);

    res.json({
      ok: true,
      data: user,
    });
  }

  public async searchUsers(req: Request, res: Response): Promise<void> {
    const {
      limit = 100,
      offset = 0,
      includeCount = true,
      ids = [],
      filters,
    } = req.body as {
      limit: number;
      includeCount: boolean;
      ids: string[];
      offset: number;
      filters: Partial<{ name: string }>;
    };

    const searchFilters: RootFilterQuery<IUser> = {};

    if (filters.name) {
      searchFilters.displayName = { $regex: filters.name, $options: 'i' };
    }

    if (Array.isArray(ids) && ids.length > 0) {
      searchFilters._id = ids;
    }

    const users = await UserModel.find(searchFilters).skip(offset).limit(limit);
    let count;
    if (includeCount) {
      count = await UserModel.countDocuments(searchFilters);
    }

    res.json({
      ok: true,
      metadata: { count, limit, offset },
      data: users,
    });
  }

  public async getUserById(req: Request, res: Response): Promise<void> {
    const userId = req.params.id;

    const user = await UserModel.findById(userId);

    res.json({
      ok: true,
      data: user,
    });
  }
}
