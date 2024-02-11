import { FirebaseApp, initializeApp } from 'firebase/app';
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

const InversifyContext = createContext<interfaces.Container>(null);
const appContainer = new Container({ defaultScope: 'Singleton' });

appContainer.bind<FirebaseApp>(AppTypes.FirebaseApp).toConstantValue(initializeApp(FIREBASE_CONFIG));
appContainer.bind<IAuthService>(AppTypes.AuthService).to(AuthService);
appContainer.bind<IPartyRanks>(AppTypes.PartyRanks).to(PartyRanks);
appContainer.bind<ISettingsService>(AppTypes.SettingsService).to(SettingsService);

export { appContainer, InversifyContext };
