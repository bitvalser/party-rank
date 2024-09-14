import { Request, Response } from 'express';
import { RootFilterQuery, Types } from 'mongoose';

import { sendError } from '../core/response-helper';
import { AppEvents, appEventEmitter } from '../event-emitter';
import { PartyRankItemModel, PartyRankModel } from '../models';
import { IPartyRank, IPartyRankItem, PartyRankStatus } from '../types';

export class AppPartyItemsController {
  constructor() {
    this.addItemToPartyRank = this.addItemToPartyRank.bind(this);
    this.deleteItemFromPartyRank = this.deleteItemFromPartyRank.bind(this);
    this.getItemsByPartyRankId = this.getItemsByPartyRankId.bind(this);
    this.updateItemToPartyRank = this.updateItemToPartyRank.bind(this);
    this.addPartyItemComment = this.addPartyItemComment.bind(this);
    this.deletePartyItemComment = this.deletePartyItemComment.bind(this);
    this.searchItems = this.searchItems.bind(this);
  }

  static canModifyPartyItem(partyRank: IPartyRank, userId: string): boolean {
    if (!partyRank) {
      return false;
    }
    if (partyRank.status === PartyRankStatus.Finished) return false;
    if ([...partyRank.moderatorIds, partyRank.creatorId].map((id) => id.toString()).includes(userId)) {
      return true;
    }
    if (
      partyRank.memberIds.map((id) => id.toString()).includes(userId) &&
      partyRank.status === PartyRankStatus.Ongoing
    ) {
      return true;
    }
    return false;
  }

  public async addItemToPartyRank(req: Request, res: Response): Promise<void> {
    const partyRankId = req.params.partyRankId;
    const { type, name, value, startTime, authorId, metadata = {} } = req.body;

    const partyRank = await PartyRankModel.findById(partyRankId);

    if (!partyRank) {
      return sendError(res, 'Party Rank was not found!', 404);
    }

    if (!AppPartyItemsController.canModifyPartyItem(partyRank, req.userId)) {
      return sendError(res, 'You are not allowed to modify this party item!', 403);
    }

    const newItem = await PartyRankItemModel.create({
      partyRankId: new Types.ObjectId(partyRankId),
      authorId: authorId ? new Types.ObjectId(authorId as string) : new Types.ObjectId(req.userId),
      type,
      name,
      value,
      startTime,
      comments: [],
      metadata: {
        ...metadata,
        parentTags: (partyRank.tags || []).join(','),
      },
    });

    await newItem.populate('author');

    appEventEmitter.emit(AppEvents.AddNewEntry, { partyRank: partyRank.toObject(), item: newItem.toObject() });

    res.json({
      ok: true,
      data: newItem,
    });
  }

  public async updateItemToPartyRank(req: Request, res: Response): Promise<void> {
    const itemId = req.params.itemId;
    const { type, name, value, startTime, metadata = {} } = req.body;

    const partyItem = await PartyRankItemModel.findById(itemId);

    if (!partyItem) {
      return sendError(res, 'Party Item was not found!', 404);
    }

    const partyRank = await PartyRankModel.findById(partyItem.partyRankId);

    if (!AppPartyItemsController.canModifyPartyItem(partyRank, req.userId)) {
      return sendError(res, 'You are not allowed to modify this party item!', 403);
    }

    for (let [key, newValue] of Object.entries({
      type,
      name,
      value,
      startTime,
    })) {
      if (newValue !== undefined) {
        partyItem[key] = newValue;
      }
    }

    for (let [key, newValue] of Object.entries(metadata)) {
      partyItem.metadata.set(key, newValue as string);
    }

    await partyItem.save();

    res.json({
      ok: true,
      data: partyItem,
    });
  }

  public async deleteItemFromPartyRank(req: Request, res: Response): Promise<void> {
    const itemId = req.params.itemId;

    const partyItem = await PartyRankItemModel.findById(itemId);

    if (!partyItem) {
      return sendError(res, 'Party Item was not found!', 404);
    }

    const partyRank = await PartyRankModel.findById(partyItem.partyRankId);

    if (!AppPartyItemsController.canModifyPartyItem(partyRank, req.userId)) {
      return sendError(res, 'You are not allowed to modify this party item!', 403);
    }

    if (
      ![...partyRank.moderatorIds, partyRank.creatorId, partyItem.authorId]
        .map((id) => id.toString())
        .includes(req.userId)
    ) {
      return sendError(res, 'You are not allowed to delete this item', 403);
    }

    await partyItem.deleteOne();

    appEventEmitter.emit(AppEvents.RemoveEntry, { partyRank: partyRank.toObject(), item: partyItem.toObject() });

    res.json({
      ok: true,
    });
  }

  public async getItemsByPartyRankId(req: Request, res: Response): Promise<void> {
    const partyRankId = req.params.partyRankId;

    const items = await PartyRankItemModel.find({ partyRankId: partyRankId }).populate('author');

    res.json({
      ok: true,
      data: items ?? [],
    });
  }

  public async addPartyItemComment(req: Request, res: Response): Promise<void> {
    const itemId = req.params.itemId;
    const { body } = req.body;

    const item = await PartyRankItemModel.findById(itemId);
    item.comments.push({
      authorId: new Types.ObjectId(req.userId),
      body,
    });
    await item.save();

    res.json({
      ok: true,
      data: item.comments.at(-1),
    });
  }

  public async deletePartyItemComment(req: Request, res: Response): Promise<void> {
    const itemId = req.params.itemId;
    const commentId = req.params.commentId;

    const item = await PartyRankItemModel.findById(itemId);
    item.comments.id(commentId).deleteOne();

    await item.save();

    res.json({
      ok: true,
    });
  }

  public async searchItems(req: Request, res: Response): Promise<void> {
    const {
      limit = 100,
      offset = 0,
      includeCount = true,
      filters,
    } = req.body as {
      limit: number;
      includeCount: boolean;
      offset: number;
      filters: Partial<{ name: string; tags: string[] }>;
    };

    const searchFilters: RootFilterQuery<IPartyRankItem> = {};

    if (filters.name) {
      searchFilters.name = { $regex: filters.name, $options: 'i' };
    }

    if (Array.isArray(filters.tags) && filters.tags.length > 0) {
      searchFilters['metadata.parentTags'] = { $regex: filters.tags.join(), $options: 'i' };
    }

    const users = await PartyRankItemModel.find(searchFilters).skip(offset).limit(limit);
    let count;
    if (includeCount) {
      count = await PartyRankItemModel.countDocuments(searchFilters);
    }

    res.json({
      ok: true,
      metadata: { count, limit, offset },
      data: users,
    });
  }
}
