import { AxiosInstance } from 'axios';
import { i18n } from 'i18next';
import { interfaces } from 'inversify';

import { RankItem } from '../interfaces/rank-item.interface';
import { IAuthService } from './auth/auth.types';
import { IPartyRanks } from './party-ranks/party-ranks.types';
import { IRankItemCommentsManager } from './rank-item-comments/rank-item-comments.types';
import { ISettingsService } from './settings/settings.types';
import { ITagsService } from './tags/tags.types';
import { IUploadService } from './upload/upload.types';
import { IUsersService } from './users/users.types';

export enum AppTypes {
  Axios = '__Axios',
  ServerBaseUrl = '__ServerBaseUrl',
  AuthService = '__AuthService',
  UsersService = '__UsersService',
  TagsService = '__TagsService',
  PartyRanks = '__PartyRanks',
  SettingsService = '__SettingsService',
  UploadService = '__UploadService',
  TranslationInstance = '__TranslationInstance',
  RankItemCommentsManagerFactory = '__RankItemCommentsManagerFactory',
}

export interface TypeMap {
  [AppTypes.Axios]: AxiosInstance;
  [AppTypes.AuthService]: IAuthService;
  [AppTypes.UsersService]: IUsersService;
  [AppTypes.TagsService]: ITagsService;
  [AppTypes.PartyRanks]: IPartyRanks;
  [AppTypes.SettingsService]: ISettingsService;
  [AppTypes.UploadService]: IUploadService;
  [AppTypes.RankItemCommentsManagerFactory]: interfaces.SimpleFactory<IRankItemCommentsManager, [RankItem[]]>;
  [AppTypes.TranslationInstance]: i18n;
}
