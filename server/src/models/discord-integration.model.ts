import { Schema, model } from 'mongoose';

import { IDiscordIntegration } from '../types/discord-integration.type';

export const discordIntegrationScheme = new Schema<IDiscordIntegration>(
  {
    partyRankId: { ref: 'PartyRank', type: 'ObjectId', index: true },
    creatorId: { ref: 'User', type: 'ObjectId' },
    discordUserId: String,
    channelId: String,
    guildId: String,
  },
  { collection: 'discordIntegrations' },
);

discordIntegrationScheme.index({ partyRankId: 1, creatorId: 1 }, { unique: true });

export const DiscordIntegrationModel = model('DiscordIntegration', discordIntegrationScheme);
