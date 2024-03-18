import { FirebaseApp } from 'firebase/app';

import { IAuthService } from './auth/auth.types';
import { IPartyRanks } from './party-ranks/party-ranks.types';
import { ISettingsService } from './settings/settings.types';
import { IUploadService } from './upload/upload.types';

export enum AppTypes {
  FirebaseApp = '__FirebaseApp',
  ServerBaseUrl = '__ServerBaseUrl',
  AuthService = '__AuthService',
  PartyRanks = '__PartyRanks',
  SettingsService = '__SettingsService',
  UploadService = '__UploadService',
}

export interface TypeMap {
  [AppTypes.FirebaseApp]: FirebaseApp;
  [AppTypes.AuthService]: IAuthService;
  [AppTypes.PartyRanks]: IPartyRanks;
  [AppTypes.SettingsService]: ISettingsService;
  [AppTypes.UploadService]: IUploadService;
}
