/* eslint-disable no-console */
import { Channel, EmbedBuilder, Events, REST, Routes, SlashCommandBuilder } from 'discord.js';

import app from './app';
import { AppEvents, appEventEmitter } from './event-emitter';
import { DiscordOauthModel, PartyRankModel } from './models';
import { DiscordIntegrationModel } from './models/discord-integration.model';
import { IPartyRank, IPartyRankItem, IUser, PartyRankStatus } from './types';

enum BotCommands {
  SyncPartyRank = 'sync-party-rank',
  UnlinkPartyRank = 'unlink-party-rank',
}

const commands = {
  [BotCommands.SyncPartyRank]: new SlashCommandBuilder()
    .setName(BotCommands.SyncPartyRank)
    .setDescription('Synchronize your discord channel with party rank updates')
    .addStringOption((option) =>
      option.setName('party_rank_id').setDescription('Your party rank id').setRequired(true),
    ),
  [BotCommands.UnlinkPartyRank]: new SlashCommandBuilder()
    .setName(BotCommands.UnlinkPartyRank)
    .setDescription('Unlink your discord channel from party rank updates')
    .addStringOption((option) =>
      option.setName('party_rank_id').setDescription('Your party rank id').setRequired(true),
    ),
};

const rest = new REST().setToken(process.env.DISCORD_BOT_TOKEN);

(async () => {
  try {
    const commandsArray = Object.values(commands).map((item) => item.toJSON());
    console.log(`Started refreshing ${commandsArray.length} application (/) commands.`);

    const data = (await rest.put(Routes.applicationCommands(process.env.DISCORD_CLIENT_ID), {
      body: commandsArray,
    })) as unknown[];

    console.log(`Successfully reloaded ${data.length} application (/) commands.`);
  } catch (error) {
    console.error(error);
  }
})();

app.botClient.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = commands[interaction.commandName];
  const userId = interaction.user.id;

  if (!command) {
    console.error(`No command matching ${interaction.commandName} was found.`);
    return;
  }

  try {
    switch (interaction.commandName) {
      case BotCommands.SyncPartyRank: {
        const partyRankId = interaction.options.getString('party_rank_id');
        const discordIntegration = await DiscordIntegrationModel.findOne({ partyRankId, discordUserId: userId });
        if (discordIntegration) {
          await interaction.reply({ content: 'You have already linked this party rank!', ephemeral: true });
          return;
        }
        const partyRank = await PartyRankModel.findById(partyRankId);
        if (!partyRank) {
          await interaction.reply({ content: 'Party rank with provided id was not found!', ephemeral: true });
          return;
        }
        const discordOauth = await DiscordOauthModel.findOne({ id: userId });
        if (!discordOauth) {
          await interaction.reply({ content: 'You are not authorized in part rank application!', ephemeral: true });
          return;
        }
        if (!partyRank.creatorId.equals(discordOauth.uid)) {
          await interaction.reply({
            content: 'Only creator of this party rank can link party rank!',
            ephemeral: true,
          });
          return;
        }
        if (!interaction.channelId || !interaction.channel.isTextBased() || !interaction.inGuild()) {
          await interaction.reply({
            content: 'You can link only text based guild channel!',
            ephemeral: true,
          });
          return;
        }
        const newDiscordIntegration = await DiscordIntegrationModel.create({
          channelId: interaction.channelId,
          guildId: interaction.guildId,
          creatorId: discordOauth.uid,
          discordUserId: userId,
          partyRankId,
        });
        await partyRank.updateOne({ discordIntegrationId: newDiscordIntegration._id });
        await interaction.reply({
          content: 'Successfully linked! This channel will receive all party rank updates now!',
        });
        break;
      }
      case BotCommands.UnlinkPartyRank: {
        const partyRankId = interaction.options.getString('party_rank_id');
        const discordIntegration = await DiscordIntegrationModel.findOne({ partyRankId, discordUserId: userId });
        if (!discordIntegration) {
          await interaction.reply({
            content: 'Discord integration for this party rank was not found!',
            ephemeral: true,
          });
          return;
        }
        const partyRank = await PartyRankModel.findById(partyRankId);
        if (!partyRank) {
          await interaction.reply({ content: 'Party rank with provided id was not found!', ephemeral: true });
          return;
        }
        await partyRank.updateOne({ discordIntegrationId: null });
        await discordIntegration.deleteOne();
        await interaction.reply({
          content: 'Successfully unlinked! This channel will NOT receive party rank updates anymore!',
        });
        break;
      }
    }
  } catch (error) {
    console.error(error);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
    } else {
      await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
  }
});

const getChannelById = async (channelId: string): Promise<Channel> => {
  const fromCache = app.botClient.channels.cache.get(channelId);
  if (!fromCache) {
    return await app.botClient.channels.fetch(channelId);
  }
  return fromCache;
};

appEventEmitter.on(AppEvents.AddNewEntry, async (data: { partyRank: IPartyRank; item: IPartyRankItem }) => {
  const { item, partyRank } = data;
  try {
    if (partyRank.discordIntegrationId) {
      const discordIntegration = await DiscordIntegrationModel.findById(partyRank.discordIntegrationId);
      if (!discordIntegration) return;
      const channel = await getChannelById(discordIntegration.channelId);
      if (channel.isTextBased() && channel.isSendable()) {
        channel.send({
          embeds: [
            new EmbedBuilder()
              .setColor('Green')
              .setAuthor({ name: partyRank.name })
              .setTitle(item.name)
              .setURL(item.value)
              .setDescription('A new entry has been added!'),
          ],
        });
      }
    }
  } catch (error) {
    console.error(error);
  }
});

appEventEmitter.on(AppEvents.RemoveEntry, async (data: { partyRank: IPartyRank; item: IPartyRankItem }) => {
  const { item, partyRank } = data;
  try {
    if (partyRank.discordIntegrationId) {
      const discordIntegration = await DiscordIntegrationModel.findById(partyRank.discordIntegrationId);
      if (!discordIntegration) return;
      const channel = await getChannelById(discordIntegration.channelId);
      if (channel.isTextBased() && channel.isSendable()) {
        channel.send({
          embeds: [
            new EmbedBuilder()
              .setColor('Red')
              .setAuthor({ name: partyRank.name })
              .setTitle(item.name)
              .setDescription('Entry has been removed!'),
          ],
        });
      }
    }
  } catch (error) {
    console.error(error);
  }
});

appEventEmitter.on(
  AppEvents.PartyRankStatusUpdate,
  async (data: { partyRank: IPartyRank; oldStatus: PartyRankStatus }) => {
    const { partyRank } = data;
    try {
      if (partyRank.discordIntegrationId) {
        const discordIntegration = await DiscordIntegrationModel.findById(partyRank.discordIntegrationId);
        if (!discordIntegration) return;
        const channel = await getChannelById(discordIntegration.channelId);
        if (channel.isTextBased() && channel.isSendable()) {
          const STATUS = {
            [PartyRankStatus.Ongoing]: {
              text: 'Reception of entries is open!',
              color: '#90caf9',
            },
            [PartyRankStatus.Rating]: {
              text: 'Rating of entries has been started!',
              color: '#ce93d8',
            },
            [PartyRankStatus.Finished]: {
              text: 'Party Rank finished!',
              color: '#66bb6a',
            },
          };
          const statusData = STATUS[partyRank.status];
          if (statusData) {
            await channel.send({
              embeds: [
                new EmbedBuilder()
                  .setColor(statusData.color)
                  .setAuthor({ name: partyRank.name })
                  .setTitle(statusData.text)
                  .setURL(`${process.env.APP_URL}/parties/${discordIntegration.partyRankId}`),
              ],
            });
          }
        }
      }
    } catch (error) {
      console.error(error);
    }
  },
);

appEventEmitter.on(AppEvents.PartyRankKickUser, async (data: { partyRank: IPartyRank; userToKick: IUser }) => {
  const { userToKick, partyRank } = data;
  try {
    if (partyRank.discordIntegrationId) {
      const discordIntegration = await DiscordIntegrationModel.findById(partyRank.discordIntegrationId);
      if (!discordIntegration) return;
      const channel = await getChannelById(discordIntegration.channelId);
      if (channel.isTextBased() && channel.isSendable()) {
        channel.send({
          embeds: [
            new EmbedBuilder()
              .setColor('Red')
              .setAuthor({ name: partyRank.name })
              .setTitle(userToKick.displayName)
              .setDescription('Users has been kicked by moderator!'),
          ],
        });
      }
    }
  } catch (error) {
    console.error(error);
  }
});
