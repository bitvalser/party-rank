import { Types } from 'mongoose';

export interface IDiscordIntegration {
  creatorId: Types.ObjectId;
  partyRankId: Types.ObjectId;
  discordUserId: string;
  guildId: string;
  channelId: string;
}
