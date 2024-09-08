import { Types } from 'mongoose';

export interface IDiscordOauth {
  accessToken: string;
  expiresAt: string;
  id: string;
  refreshToken: string;
  uid: Types.ObjectId;
}
