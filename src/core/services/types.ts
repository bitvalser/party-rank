import { FirebaseApp } from 'firebase/app';
import { Firestore } from 'firebase/firestore';
import { i18n } from 'i18next';
import { interfaces } from 'inversify';

import { RankItem } from '../interfaces/rank-item.interface';
import { IAuthService } from './auth/auth.types';
import { IPartyRanks } from './party-ranks/party-ranks.types';
import { IRankItemCommentsManager } from './rank-item-comments/rank-item-comments.types';
import { ISettingsService } from './settings/settings.types';
import { IUploadService } from './upload/upload.types';

export enum AppTypes {
  FirebaseApp = '__FirebaseApp',
  Firestore = '__Firestore',
  ServerBaseUrl = '__ServerBaseUrl',
  AuthService = '__AuthService',
  PartyRanks = '__PartyRanks',
  SettingsService = '__SettingsService',
  UploadService = '__UploadService',
  TranslationInstance = '__TranslationInstance',
  RankItemCommentsManagerFactory = '__RankItemCommentsManagerFactory',
}

export interface TypeMap {
  [AppTypes.FirebaseApp]: FirebaseApp;
  [AppTypes.Firestore]: Firestore;
  [AppTypes.AuthService]: IAuthService;
  [AppTypes.PartyRanks]: IPartyRanks;
  [AppTypes.SettingsService]: ISettingsService;
  [AppTypes.UploadService]: IUploadService;
  [AppTypes.RankItemCommentsManagerFactory]: interfaces.SimpleFactory<IRankItemCommentsManager, [RankItem[]]>;
  [AppTypes.TranslationInstance]: i18n;
}
