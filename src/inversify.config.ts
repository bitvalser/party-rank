import { AxiosInstance } from 'axios';
import { i18n as Ii18n } from 'i18next';
import { Container, interfaces } from 'inversify';
import { createContext } from 'react';

import { axiosInstance } from './axios-instance';
import { RankItem } from './core/interfaces/rank-item.interface';
import { AuthService } from './core/services/auth/auth.service';
import { IAuthService } from './core/services/auth/auth.types';
import { PartyRanks } from './core/services/party-ranks/party-ranks.service';
import { IPartyRanks } from './core/services/party-ranks/party-ranks.types';
import { RankItemCommentsManager } from './core/services/rank-item-comments/rank-item-comments.service';
import { IRankItemCommentsManager } from './core/services/rank-item-comments/rank-item-comments.types';
import { SettingsService } from './core/services/settings/settings.service';
import { ISettingsService } from './core/services/settings/settings.types';
import { TagsService } from './core/services/tags/tags.service';
import { ITagsService } from './core/services/tags/tags.types';
import { AppTypes } from './core/services/types';
import { UploadService } from './core/services/upload/upload.service';
import { IUploadService } from './core/services/upload/upload.types';
import { UsersService } from './core/services/users/users.service';
import { IUsersService } from './core/services/users/users.types';
import i18n from './locales/i18n';

const InversifyContext = createContext<interfaces.Container>(null);
const appContainer = new Container({ defaultScope: 'Singleton' });

appContainer.bind<AxiosInstance>(AppTypes.Axios).toConstantValue(axiosInstance);
appContainer.bind<string>(AppTypes.ServerBaseUrl).toConstantValue(process.env.SERVER_BASE_URL);
appContainer.bind<Ii18n>(AppTypes.TranslationInstance).toConstantValue(i18n);
appContainer.bind<IAuthService>(AppTypes.AuthService).to(AuthService);
appContainer.bind<IUsersService>(AppTypes.UsersService).to(UsersService);
appContainer.bind<ITagsService>(AppTypes.TagsService).to(TagsService);
appContainer.bind<IPartyRanks>(AppTypes.PartyRanks).to(PartyRanks);
appContainer
  .bind<interfaces.Factory<IRankItemCommentsManager>>(AppTypes.RankItemCommentsManagerFactory)
  .toFactory<
    IRankItemCommentsManager,
    [RankItem[]]
  >((context) => (rankItems) => new RankItemCommentsManager(context.container.get<AxiosInstance>(AppTypes.Axios), context.container.get<IAuthService>(AppTypes.AuthService), rankItems));
appContainer.bind<ISettingsService>(AppTypes.SettingsService).to(SettingsService);
appContainer.bind<IUploadService>(AppTypes.UploadService).to(UploadService);

const axios = appContainer.get<AxiosInstance>(AppTypes.Axios);
const authService = appContainer.get<IAuthService>(AppTypes.AuthService);

axios.interceptors.request.use((config) => {
  const token = authService.getAuthToken();
  config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export { appContainer, InversifyContext };
