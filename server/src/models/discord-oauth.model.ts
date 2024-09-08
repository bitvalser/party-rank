import { Schema, model } from 'mongoose';

import { IDiscordOauth } from '../types/discord-oauth.type';

export const discordOauthScheme = new Schema<IDiscordOauth>(
  {
    accessToken: String,
    expiresAt: String,
    id: { type: String, index: true, unique: true },
    refreshToken: String,
    uid: { type: 'ObjectId', ref: 'User', index: true, unique: true },
  },
  { collection: 'discordOauth' },
);

export const DiscordOauthModel = model('DiscordOauth', discordOauthScheme);
