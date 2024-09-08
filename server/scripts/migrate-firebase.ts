import mongoose, { Types } from 'mongoose';

import backupJsonFile from '../backup.json';
import '../src/dotenv';
import {
  DiscordOauthModel,
  PartyRankItemModel,
  PartyRankModel,
  PartyTagModel,
  UserModel,
  UserRankModel,
} from '../src/models';
import { CdnItemModel } from '../src/models/cdn.model';
import { IDiscordOauth, IPartyRankItem, IUser, IUserRank, UserRole } from '../src/types';

const backupJson = backupJsonFile as any;

mongoose.connect(process.env.MONGODB_URL);

const exportToMongoDb = async () => {
  const oldUsersIdMap = {};
  const oldPartiesRankIdMap = {};
  const oldItemsIdMap = {};

  const users = Object.values(backupJson.__collections__.users).map((item: any): IUser & { _id: Types.ObjectId } => {
    const newId = new Types.ObjectId();
    oldUsersIdMap[item.uid] = newId.toString();
    return {
      _id: newId,
      displayName: item.displayName,
      photoURL: item.photoURL,
      role: UserRole.Regular,
    };
  });

  await UserModel.collection.insertMany(users);

  const discordOauth = Object.values(backupJson.__collections__['discord-oauth']).map(
    (item: any): IDiscordOauth => ({
      uid: new Types.ObjectId(oldUsersIdMap[item.uid]),
      id: item.id,
      accessToken: item.accessToken,
      expiresAt: item.expiresAt,
      refreshToken: item.refreshToken,
    }),
  );

  await DiscordOauthModel.insertMany(discordOauth);

  const cdnAssets = Object.entries(backupJson.__collections__.cdn).map(
    ([key, { __collections__, ...values }]: any) => ({
      userId: new Types.ObjectId(oldUsersIdMap[key] as string),
      assets: values,
    }),
  );

  await CdnItemModel.insertMany(cdnAssets);

  const partyCollection = backupJson.__collections__.parties;
  for (let partyId in partyCollection) {
    const partyItem = partyCollection[partyId];
    if (!partyItem.id || !partyItem.status) continue;
    const newPartyRankId = new Types.ObjectId();
    oldPartiesRankIdMap[partyId] = newPartyRankId.toString();
    const allItems = Object.values(partyItem?.__collections__?.items || {});
    const participants = [...new Set(allItems.map((item: any) => item.authorId))];
    const isAnime = () => {
      const lowerName = (partyItem.name || '').toLowerCase();
      return (
        (lowerName.includes('аниме') && !lowerName.includes('исполнителей')) ||
        lowerName.includes('op') ||
        lowerName.includes('оп ед инс') ||
        lowerName.includes('op/ed/ins') ||
        lowerName.includes('op ed ins') ||
        lowerName.includes('адаптациям')
      );
    };
    const tags = isAnime() ? ['Anime'] : [];
    await PartyRankModel.collection.insertOne({
      _id: newPartyRankId,
      creatorId: new Types.ObjectId(oldUsersIdMap[partyItem.creatorId]),
      moderatorIds: Array.isArray(partyItem.moderators)
        ? partyItem.moderators.map((id) => new Types.ObjectId(oldUsersIdMap[id]))
        : [],
      memberIds: Array.isArray(partyItem.members)
        ? partyItem.members.map((id) => new Types.ObjectId(oldUsersIdMap[id]))
        : participants.map((id) => new Types.ObjectId(oldUsersIdMap[id])),
      createdDate: partyItem.createdDate,
      requiredQuantity: partyItem.requiredQuantity,
      name: partyItem.name,
      finishDate: partyItem.finishDate,
      deadlineDate: partyItem.deadlineDate,
      content: partyItem.content,
      finishedDate: partyItem.finishedDate,
      status: partyItem.status,
      showTable: partyItem.showTables ?? true,
      allowComments: partyItem.allowComments ?? false,
      tags,
      isPrivate: false,
    });

    const itemsToInsert = allItems.map((item: any): IPartyRankItem & { _id: Types.ObjectId } => {
      const newId = new Types.ObjectId();
      oldItemsIdMap[item.id] = newId.toString();
      const metadata = new Map();
      if (tags.includes('Anime')) {
        metadata.set('parentTags', 'Anime');
        if (item.name.includes('OP')) {
          metadata.set('musicType', 'op');
        } else if (item.name.includes('ED')) {
          metadata.set('musicType', 'ed');
        } else if (item.name.includes('INS')) {
          metadata.set('musicType', 'ins');
        } else {
          metadata.set('musicType', 'other');
        }
      }
      return {
        _id: newId,
        startTime: item.startTime ?? 0,
        type: item.type,
        name: item.name,
        value: item.value,
        authorId: new Types.ObjectId(oldUsersIdMap[item.authorId]),
        partyRankId: newPartyRankId,
        comments: Array.isArray(item.comments)
          ? item.comments.map((comment) => ({
              _id: new Types.ObjectId(),
              authorId: new Types.ObjectId(oldUsersIdMap[comment.authorId]),
              body: comment.body,
            }))
          : [],
        metadata,
      };
    });

    await PartyRankItemModel.collection.insertMany(itemsToInsert);

    const ranksToInsert = Object.entries(partyItem?.__collections__?.ranks || {}).map(
      ([key, { favoriteId, __collections__, ...ranks }]: any): IUserRank => ({
        userId: new Types.ObjectId(oldUsersIdMap[key]),
        partyRankId: newPartyRankId,
        favoriteId: new Types.ObjectId(oldItemsIdMap[favoriteId]),
        ranks: Object.entries(ranks).reduce(
          (acc, [key, value]) => ({ ...acc, [oldItemsIdMap[key]]: value }),
          {},
        ) as any,
      }),
    );

    await UserRankModel.insertMany(ranksToInsert);
  }
  await PartyTagModel.create({
    name: 'Anime',
    color: '#ff0000',
  });
  console.log('finished');
};

exportToMongoDb();
