import { Request, Response } from 'express';
import { RootFilterQuery, Types } from 'mongoose';

import { sendError } from '../core/response-helper';
import { AppEvents, appEventEmitter } from '../event-emitter';
import { PartyRankItemModel, PartyRankModel, UserModel, UserRankModel } from '../models';
import { DiscordIntegrationModel } from '../models/discord-integration.model';
import { IPartyRank, IPartyRankFilters, PartyRankStatus } from '../types';

export class AppPartiesController {
  static SUPPORTED_INCLUDE = ['members', 'creator', 'moderators'];

  constructor() {
    this.createPartyRank = this.createPartyRank.bind(this);
    this.getPartyRankById = this.getPartyRankById.bind(this);
    this.deletePartyRankById = this.deletePartyRankById.bind(this);
    this.searchPartyRanks = this.searchPartyRanks.bind(this);
    this.registerToPartyRank = this.registerToPartyRank.bind(this);
    this.unregisterFromPartyRank = this.unregisterFromPartyRank.bind(this);
    this.updatePartyRank = this.updatePartyRank.bind(this);
    this.kickUserFromPartyRank = this.kickUserFromPartyRank.bind(this);
    this.addUserToPartyRank = this.addUserToPartyRank.bind(this);
  }

  public async createPartyRank(req: Request, res: Response): Promise<void> {
    const { content, allowComments, tags, deadlineDate, finishDate, name, requiredQuantity, moderatorIds, isPrivate } =
      req.body;

    const partyRank = await PartyRankModel.create({
      createdDate: new Date(),
      creatorId: new Types.ObjectId(req.userId),
      memberIds: [],
      tags: tags ?? [],
      status: PartyRankStatus.Registration,
      finishedDate: null,
      showTable: false,
      allowComments: allowComments ?? true,
      moderatorIds: (moderatorIds || []).map((id: string) => new Types.ObjectId(id)),
      content,
      deadlineDate,
      finishDate,
      name,
      requiredQuantity,
      isPrivate,
    });

    if (!partyRank) {
      return sendError(res, 'Party Rank not found!', 404);
    }

    res.json({
      ok: true,
      data: partyRank,
    });
  }

  public async updatePartyRank(req: Request, res: Response): Promise<void> {
    const partyRankId = req.params.id;
    const {
      content,
      allowComments,
      moderatorIds,
      tags,
      deadlineDate,
      finishDate,
      name,
      requiredQuantity,
      showTable,
      status,
      memberIds,
      isPrivate,
    } = req.body;

    const partyRank = await PartyRankModel.findById(partyRankId);

    if (!partyRank) {
      return sendError(res, 'Party rank not found!', 404);
    }

    if (![...partyRank.moderatorIds, partyRank.creatorId].map((id) => id.toString()).includes(req.userId)) {
      return sendError(res, 'You are not allowed to edit this party rank', 404);
    }

    if (partyRank.status === status) {
      return sendError(res, 'You cannot update the status of a party rank with the same status.', 400);
    }

    const oldStatus = partyRank.status;

    for (let [key, value] of Object.entries({
      content,
      allowComments,
      tags,
      deadlineDate,
      finishDate,
      name,
      requiredQuantity,
      showTable,
      status,
      moderatorIds,
      memberIds,
      isPrivate,
    })) {
      if (value !== undefined) {
        let newValue = value;
        if (key === 'status' && status === PartyRankStatus.Finished) {
          partyRank.finishedDate = new Date();
        }
        if (['memberIds', 'moderatorIds'].includes(key)) {
          newValue = value.map((item) => new Types.ObjectId(item as string));
        }
        partyRank[key] = newValue;
      }
    }

    await partyRank.save();

    if (oldStatus !== status) {
      appEventEmitter.emit(AppEvents.PartyRankStatusUpdate, { oldStatus, partyRank: partyRank.toObject() });
    }

    res.json({
      ok: true,
      data: partyRank,
    });
  }

  public async addUserToPartyRank(req: Request, res: Response): Promise<void> {
    const partyRankId = req.params.id;
    const { userId } = req.body;

    const partyRank = await PartyRankModel.findById(partyRankId);
    const newUser = await UserModel.findById(userId);

    if (!partyRank) {
      return sendError(res, 'Party rank not found!', 404);
    }

    if (!newUser) {
      return sendError(res, 'User not found!', 404);
    }

    if (![...partyRank.moderatorIds, partyRank.creatorId].map((id) => id.toString()).includes(req.userId)) {
      return sendError(res, 'You are not allowed to edit this party rank', 404);
    }

    await partyRank.updateOne({
      $addToSet: { memberIds: userId },
    });

    res.json({
      ok: true,
      data: newUser,
    });
  }

  public async deletePartyRankById(req: Request, res: Response): Promise<void> {
    const partyRankId = req.params.id;

    const partyRank = await PartyRankModel.findById(partyRankId);

    if (!partyRank) {
      return sendError(res, 'Party Rank not found!', 404);
    }

    if (partyRank.creatorId.toString() !== req.userId) {
      return sendError(res, 'You are not allowed to delete this Party Rank!', 403);
    }

    await PartyRankItemModel.deleteMany({ partyRankId: partyRankId });
    await UserRankModel.deleteMany({ partyRankId: partyRankId });
    await DiscordIntegrationModel.deleteMany({ partyRankId: partyRankId });

    await partyRank.deleteOne();

    res.json({
      ok: true,
    });
  }

  public async getPartyRankById(req: Request, res: Response): Promise<void> {
    const partyRankId = req.params.id;
    const { include = [] } = req.query as { include: string[] };

    const unsupportedInclude = include.find((field) => !AppPartiesController.SUPPORTED_INCLUDE.includes(field));
    if (unsupportedInclude) {
      return sendError(res, `"${unsupportedInclude}" is not supported include fore get party rank!`, 400);
    }

    const partyRank = await PartyRankModel.findById(partyRankId);

    if (!partyRank) {
      return sendError(res, 'Party Rank not found!', 404);
    }

    if (
      partyRank.status === PartyRankStatus.Finished ||
      [...partyRank.moderatorIds, partyRank.creatorId].map((id) => id.toString()).includes(req.userId)
    ) {
      include.push(...['members', 'creator', 'moderators']);
    }

    await partyRank.populate([...new Set(include)]);

    res.json({
      ok: true,
      data: partyRank,
    });
  }

  public async searchPartyRanks(req: Request, res: Response): Promise<void> {
    const {
      limit = 100,
      offset = 0,
      filters,
    } = req.body as { limit: number; offset: number; filters: IPartyRankFilters };
    const { include = [] } = req.query as { include: string[] };

    const unsupportedInclude = include.find((field) => !AppPartiesController.SUPPORTED_INCLUDE.includes(field));
    if (unsupportedInclude) {
      return sendError(res, `"${unsupportedInclude}" is not supported include fore get party rank!`, 400);
    }

    const searchFilters: RootFilterQuery<IPartyRank> = { isPrivate: false };

    if (filters.name) {
      searchFilters.name = { $regex: filters.name, $options: 'i' };
    }

    if (filters.creatorId) {
      searchFilters.creatorId = filters.creatorId;
    }

    if (filters.isParticipant) {
      searchFilters.memberIds = req.userId;
    }

    if (Array.isArray(filters.tags) && filters.tags.length > 0) {
      searchFilters.tags = { $in: filters.tags };
    }

    if (filters.active) {
      searchFilters.status = { $in: [PartyRankStatus.Registration, PartyRankStatus.Ongoing, PartyRankStatus.Rating] };
    }

    if (filters.myPartyRanks) {
      delete searchFilters.creatorId;
      delete searchFilters.isPrivate;
      searchFilters.$or = [
        {
          creatorId: req.userId,
        },
        {
          memberIds: req.userId,
        },
      ];
    }

    const parties = await PartyRankModel.find(searchFilters)
      .sort({ createdDate: -1 })
      .populate(include)
      .skip(offset)
      .limit(limit);
    const count = await PartyRankModel.countDocuments(searchFilters);

    res.json({
      ok: true,
      metadata: { count, limit, offset },
      data: parties,
    });
  }

  public async registerToPartyRank(req: Request, res: Response): Promise<void> {
    const partyRankId = req.params.id;
    const partyRank = await PartyRankModel.findById(partyRankId);
    if (partyRank.status !== PartyRankStatus.Registration) {
      return sendError(res, 'Registration phase is over', 400);
    }
    await partyRank.updateOne({
      $addToSet: { memberIds: req.userId },
    });
    res.json({
      ok: true,
    });
  }

  public async unregisterFromPartyRank(req: Request, res: Response): Promise<void> {
    const partyRankId = req.params.id;

    const partyRank = await PartyRankModel.findById(partyRankId);

    if (!partyRank) {
      return sendError(res, 'Party Rank not found!', 404);
    }

    if (partyRank.status === PartyRankStatus.Finished) {
      return sendError(res, "You can't leave already finished party rank!", 403);
    }

    await PartyRankItemModel.deleteMany({ partyRankId: partyRankId, authorId: req.userId });
    await UserRankModel.deleteMany({ partyRankId: partyRankId, userId: req.userId });
    await PartyRankModel.findByIdAndUpdate(partyRankId, {
      $pull: { memberIds: req.userId },
    });

    res.json({
      ok: true,
    });
  }

  public async kickUserFromPartyRank(req: Request, res: Response): Promise<void> {
    const partyRankId = req.params.id;
    const { userId } = req.body;

    const partyRank = await PartyRankModel.findById(partyRankId);

    if (!partyRank) {
      return sendError(res, 'Party Rank not found!', 404);
    }

    if (!userId) {
      return sendError(res, 'Provide user id!', 404);
    }

    const userToKick = await UserModel.findById(userId);

    if (!userToKick) {
      return sendError(res, 'User not found!', 404);
    }

    if (![...partyRank.moderatorIds, partyRank.creatorId].map((id) => id.toString()).includes(req.userId)) {
      return sendError(res, 'You are not allowed to kick user from this party rank!', 403);
    }

    await PartyRankItemModel.deleteMany({ partyRankId: partyRankId, authorId: userId });
    await UserRankModel.deleteMany({ partyRankId: partyRankId, userId });

    await partyRank.updateOne({
      $pull: { memberIds: userId },
    });

    appEventEmitter.emit(AppEvents.PartyRankKickUser, {
      partyRank: partyRank.toObject(),
      userToKick: userToKick.toObject(),
    });

    res.json({
      ok: true,
    });
  }
}
