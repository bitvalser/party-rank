import * as Discord from 'discord.js';
import * as admin from 'firebase-admin';

export class DiscordIntegration {
  private parties: Record<
    string,
    {
      unsubscribe: () => void;
      status: string;
      members: string[];
      partyId: string;
      roleId: string;
    }
  > = {};
  public constructor(private client: Discord.Client) {
    client.once('ready', () => {
      this.init();
    });
  }

  private registerNewPartyListener(partyItem): void {
    try {
      const unsubscribeMain = admin
        .firestore()
        .collection('parties')
        .doc(partyItem.id)
        .onSnapshot((snapshot) => {
          if (snapshot.exists && this.parties[partyItem.id]) {
            const internalItem = this.parties[partyItem.id];
            const newPartyItem = snapshot.data();
            if (internalItem.status !== newPartyItem.status) {
              this.parties[partyItem.id].status = newPartyItem.status;
              switch (newPartyItem.status) {
                case 'finished': {
                  internalItem.unsubscribe();
                  this.client.channels.fetch(partyItem.discord.channelId).then((channel) => {
                    if (channel.isTextBased()) {
                      channel.send({
                        content: `**Пати ранг окончен!**\nРезультаты -> ${process.env.APP_URL}/party-rank/${partyItem.id}`,
                      });
                    }
                  });
                  break;
                }
                case 'rating': {
                  this.client.channels.fetch(partyItem.discord.channelId).then((channel) => {
                    if (channel.isTextBased()) {
                      channel.send({
                        content: `**Оценивание начато!**\nНачать оценивание -> ${process.env.APP_URL}/party-rank/${partyItem.id}`,
                      });
                    }
                  });
                  break;
                }
                case 'ongoing': {
                  this.client.channels.fetch(partyItem.discord.channelId).then((channel) => {
                    if (channel.isTextBased()) {
                      channel.send({
                        content: `**Регистрация окончена!**\nДобавить кандидатов -> ${process.env.APP_URL}/party-rank/${partyItem.id}`,
                      });
                    }
                  });
                  break;
                }
              }
            }
            if (partyItem.status === 'registration' && Array.isArray(newPartyItem.members)) {
              const diffMembers = internalItem.members
                .filter((x) => !newPartyItem.members.includes(x))
                .concat(newPartyItem.members.filter((x) => !internalItem.members.includes(x)));
              if (diffMembers.length > 0) {
                admin
                  .firestore()
                  .collection('discord-oauth')
                  .where('uid', 'in', diffMembers)
                  .get()
                  .then((result) =>
                    result.docs.map((doc) => doc.data()).reduce((acc, val) => ({ ...acc, [val.uid]: val.id }), {}),
                  )
                  .then((discordUsersBy) => {
                    this.client.guilds.fetch(partyItem.discord.guildId).then((guild) => {
                      Promise.all([
                        guild.channels.fetch(partyItem.discord.channelId),
                        guild.roles.fetch(partyItem.discord.roleId),
                      ]).then(([channel, role]) => {
                        if (channel.isTextBased()) {
                          diffMembers.forEach((member) => {
                            const shouldAdd = internalItem.members.includes(member);
                            if (discordUsersBy[member]) {
                              guild.members.fetch(discordUsersBy[member]).then((guildMember) => {
                                if (shouldAdd) {
                                  guildMember.roles.remove(role);
                                } else {
                                  guildMember.roles.add(role);
                                }
                              });
                            }
                          });
                          this.parties[partyItem.id].members = [...newPartyItem.members];
                        }
                      });
                    });
                  });
              }
            }
          }
        });
      const unsubscribeItems = admin
        .firestore()
        .collection('parties')
        .doc(partyItem.id)
        .collection('items')
        .onSnapshot((snapshot) => {
          snapshot.docChanges().forEach((docChange) => {
            if (docChange.type === 'added') {
              const newItem = docChange.doc.data();
              this.client.channels.fetch(partyItem.discord.channelId).then((channel) => {
                if (channel.isTextBased()) {
                  channel.send({
                    content: `**Добавлен новый кандидат!**\n${newItem.name}\n${newItem.value}`,
                  });
                }
              });
            }
          });
        });

      this.parties[partyItem.id] = {
        partyId: partyItem.id,
        status: partyItem.status,
        members: partyItem.members ?? [],
        roleId: partyItem.discord.roleId,
        unsubscribe: () => {
          unsubscribeMain();
          unsubscribeItems();
        },
      };
    } catch (error) {
      console.error(error);
      if (this.parties[partyItem.id]?.unsubscribe) {
        this.parties[partyItem.id].unsubscribe();
      }
    }
  }

  private async startPartyIntegration(newParty) {
    const creator = await admin
      .firestore()
      .collection('discord-oauth')
      .where('uid', '==', newParty.creatorId)
      .get()
      .then((result) => result.docs[0]?.data?.());
    const guild = await this.client.guilds.fetch(newParty.discord.guildId);
    await guild.roles.fetch();
    const role = await guild.roles.create({
      name: 'ПатиРангер',
    });
    const channel = await guild.channels.create({
      name: newParty.name,
      type: Discord.ChannelType.GuildText,
      parent: newParty.discord.parentChannel,
      permissionOverwrites: [
        {
          id: guild.roles.everyone,
          deny: [Discord.PermissionsBitField.Flags.ViewChannel],
        },
        {
          id: role.id,
          allow: [Discord.PermissionsBitField.Flags.ViewChannel],
        },
        {
          id: this.client.user.id,
          allow: [Discord.PermissionsBitField.Flags.ViewChannel],
        },
      ],
    });
    await guild.members.fetch(creator.id).then((member) => member.roles.add(role));
    await admin
      .firestore()
      .collection('parties')
      .doc(newParty.id)
      .set({ discord: { channelId: channel.id, roleId: role.id } }, { merge: true });
    newParty.discord.channelId = channel.id;
    newParty.discord.roleId = role.id;
    this.registerNewPartyListener(newParty);
  }

  public init() {
    try {
      admin
        .firestore()
        .collection('parties')
        .onSnapshot((snapshot) => {
          snapshot.docChanges().forEach(async (docChange) => {
            if (docChange.type === 'added') {
              const newParty = docChange.doc.data();
              if (newParty?.discord?.integrationEnabled) {
                this.startPartyIntegration(newParty);
              }
            }
          });
        });
      admin
        .firestore()
        .collection('parties')
        .where('status', 'not-in', ['finished', 'rating'])
        .get()
        .then((result) => {
          result.docs.forEach((doc) => {
            const partyItem = doc.data();
            if (partyItem?.id && partyItem.discord?.integrationEnabled) {
              if (partyItem.discord.channelId) {
                this.registerNewPartyListener(partyItem);
              } else {
                this.startPartyIntegration(partyItem);
              }
            }
          });
        });
    } catch (error) {
      console.error(error);
    }
  }
}
