import { FirebaseApp, initializeApp } from 'firebase/app';
import { Container, interfaces } from 'inversify';
import { createContext } from 'react';

import { FIREBASE_CONFIG } from './core/configs/firebase';
import { TYPES } from './core/services/types';

const InversifyContext = createContext<interfaces.Container>(null);
const appContainer = new Container({ defaultScope: 'Singleton' });

appContainer.bind<FirebaseApp>(TYPES.FirebaseApp).toConstantValue(initializeApp(FIREBASE_CONFIG));

export { appContainer, InversifyContext };
