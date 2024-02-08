import { FirebaseApp } from 'firebase/app';

import { IAuthService } from './auth/auth.types';

export enum AppTypes {
  FirebaseApp = '__FirebaseApp',
  AuthService = '__AuthService',
}

export interface TypeMap {
  [AppTypes.FirebaseApp]: FirebaseApp;
  [AppTypes.AuthService]: IAuthService;
}
