import { FirebaseApp } from 'firebase/app';

import { IAuthService } from './auth/auth.types';
import { IPartyRanks } from './party-ranks/party-ranks.types';
import { ISettingsService } from './settings/settings.types';

export enum AppTypes {
  FirebaseApp = '__FirebaseApp',
  AuthService = '__AuthService',
  PartyRanks = '__PartyRanks',
  SettingsService = '__SettingsService',
}

export interface TypeMap {
  [AppTypes.FirebaseApp]: FirebaseApp;
  [AppTypes.AuthService]: IAuthService;
  [AppTypes.PartyRanks]: IPartyRanks;
  [AppTypes.SettingsService]: ISettingsService;
}
