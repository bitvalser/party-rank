import { FirebaseApp } from 'firebase/app';

import { IAuthService } from './auth/auth.types';
import { IPartyRanks } from './party-ranks/party-ranks.types';

export enum AppTypes {
  FirebaseApp = '__FirebaseApp',
  AuthService = '__AuthService',
  PartyRanks = '__PartyRanks',
}

export interface TypeMap {
  [AppTypes.FirebaseApp]: FirebaseApp;
  [AppTypes.AuthService]: IAuthService;
  [AppTypes.PartyRanks]: IPartyRanks;
}
