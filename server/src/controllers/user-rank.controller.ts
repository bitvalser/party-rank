import { Request, Response } from 'express';
import { Types } from 'mongoose';

import { sendError } from '../core/response-helper';
import { PartyRankModel, UserRankModel } from '../models';
import { IUserRank } from '../types';

export class AppUserRankController {
  constructor() {
    this.setUserRank = this.setUserRank.bind(this);
    this.getMyRank = this.getMyRank.bind(this);
    this.deleteUserRank = this.deleteUserRank.bind(this);
    this.getUserRanks = this.getUserRanks.bind(this);
  }

  public async getMyRank(req: Request, res: Response): Promise<void> {
    const partyRankId = req.params.partyRankId;
    const myRank = await UserRankModel.findOne({ partyRankId: partyRankId, userId: req.userId });

    res.json({
      ok: true,
      data: myRank ?? { ranks: {} },
    });
  }

  public async getUserRanks(req: Request, res: Response): Promise<void> {
    const SUPPORTED_INCLUDE = ['author'];
    const { include = [] } = req.query as { include: string[] };
    const partyRankId = req.params.partyRankId;

    const unsupportedInclude = include.find((field) => !SUPPORTED_INCLUDE.includes(field));
    if (unsupportedInclude) {
      return sendError(res, `"${unsupportedInclude}" is not supported include fore get user ranks!`, 400);
    }

    const getRanksQuery = UserRankModel.find({ partyRankId: partyRankId });

    (include || []).forEach((includeField) => {
      getRanksQuery.populate(includeField);
    });

    const userRanks = await getRanksQuery;

    res.json({
      ok: true,
      data: userRanks,
    });
  }

  public async deleteUserRank(req: Request, res: Response): Promise<void> {
    const partyRankId = req.params.partyRankId;
    const userId = req.params.userId;

    const partyRank = await PartyRankModel.findById(partyRankId);

    if (!partyRank) {
      return sendError(res, 'Party Rank was not found!', 404);
    }

    if (
      req.userId !== userId ||
      ![...partyRank.moderatorIds, partyRank.creatorId].map((id) => id.toString()).includes(req.userId)
    ) {
      return sendError(res, 'You are not allowed to delete this user rank!', 403);
    }

    await UserRankModel.deleteOne({ partyRankId: partyRankId, userId });

    res.json({
      ok: true,
    });
  }

  public async setUserRank(req: Request, res: Response): Promise<void> {
    const partyRankId = req.params.partyRankId;
    const { favoriteId, ranks } = req.body as Pick<IUserRank, 'favoriteId' | 'ranks'>;

    let userRank = await UserRankModel.findOne({ partyRankId: partyRankId, userId: req.userId });

    if (!userRank) {
      userRank = await UserRankModel.create({
        partyRankId: partyRankId,
        userId: req.userId,
        favoriteId: null,
        ranks: new Map(),
      });
    }

    if (favoriteId) {
      userRank.favoriteId = new Types.ObjectId(favoriteId);
    }

    for (let [itemId, value] of Object.entries(ranks || {})) {
      if (value === null) {
        userRank.ranks.delete(itemId);
      } else {
        userRank.ranks.set(itemId, value);
      }
    }

    await userRank.save();

    res.json({
      ok: true,
    });
  }
}
