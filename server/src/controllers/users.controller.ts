import { Request, Response } from 'express';
import { RootFilterQuery } from 'mongoose';

import { sendError } from '../core/response-helper';
import { DiscordOauthModel, PartyRankModel, UserModel, UserRankModel } from '../models';
import { IUser } from '../types';

export class AppUsersController {
  constructor() {
    this.getUserById = this.getUserById.bind(this);
    this.getMe = this.getMe.bind(this);
    this.getProfileById = this.getProfileById.bind(this);
    this.searchUsers = this.searchUsers.bind(this);
  }

  public async getMe(req: Request, res: Response): Promise<void> {
    const user = await UserModel.findById(req.userId);

    res.json({
      ok: true,
      data: user,
    });
  }

  public async getProfileById(req: Request, res: Response): Promise<void> {
    const userId = req.params.id;
    const user = await UserModel.findById(userId);

    if (!user) {
      return sendError(res, 'User profile not found!', 404);
    }

    const userRanks = await UserRankModel.find({ userId: userId });
    const discordOauth = await DiscordOauthModel.findOne({ uid: userId });
    const parties = await PartyRankModel.find({
      $or: [
        {
          creatorId: userId,
        },
        {
          memberIds: userId,
        },
      ],
    });

    res.json({
      ok: true,
      data: {
        profile: {
          ...user.toObject(),
          discordId: discordOauth?.id,
        },
        allRanks: userRanks.flatMap((rank) => Array.from(rank.ranks.values()).map((item) => item.value)),
        ranksByPartyId: userRanks.reduce(
          (acc, rank) => ({
            ...acc,
            [rank.partyRankId.toString()]: Array.from(rank.ranks.values()).map((item) => item.value),
          }),
          {},
        ),
        parties,
      },
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
