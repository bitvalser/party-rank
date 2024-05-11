import { FirebaseApp, initializeApp } from 'firebase/app';
import { i18n as Ii18n } from 'i18next';
import { Container, interfaces } from 'inversify';
import { createContext } from 'react';

import { FIREBASE_CONFIG } from './core/configs/firebase';
import { AuthService } from './core/services/auth/auth.service';
import { IAuthService } from './core/services/auth/auth.types';
import { PartyRanks } from './core/services/party-ranks/party-ranks.service';
import { IPartyRanks } from './core/services/party-ranks/party-ranks.types';
import { SettingsService } from './core/services/settings/settings.service';
import { ISettingsService } from './core/services/settings/settings.types';
import { AppTypes } from './core/services/types';
import { UploadService } from './core/services/upload/upload.service';
import { IUploadService } from './core/services/upload/upload.types';
import i18n from './locales/i18n';

const InversifyContext = createContext<interfaces.Container>(null);
const appContainer = new Container({ defaultScope: 'Singleton' });

appContainer.bind<FirebaseApp>(AppTypes.FirebaseApp).toConstantValue(initializeApp(FIREBASE_CONFIG));
appContainer.bind<string>(AppTypes.ServerBaseUrl).toConstantValue(process.env.SERVER_BASE_URL);
appContainer.bind<Ii18n>(AppTypes.TranslationInstance).toConstantValue(i18n);
appContainer.bind<IAuthService>(AppTypes.AuthService).to(AuthService);
appContainer.bind<IPartyRanks>(AppTypes.PartyRanks).to(PartyRanks);
appContainer.bind<ISettingsService>(AppTypes.SettingsService).to(SettingsService);
appContainer.bind<IUploadService>(AppTypes.UploadService).to(UploadService);

export { appContainer, InversifyContext };
