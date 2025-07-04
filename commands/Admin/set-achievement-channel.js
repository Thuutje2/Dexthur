const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const GuildSettings = require('../../models/setup/GuildSettings');

module.exports = {
  name: 'set-achievement-channel',
  description: 'Set the channel for achievement notifications',
  usage: '!set-achievement-channel #channel',
  category: 'Admin',
  data: new SlashCommandBuilder()
    .setName('set-achievement-channel')
    .setDescription('Set the channel for achievement notifications')
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('The channel where achievement notifications will be sent')
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  async execute(interactionOrMessage) {
    const isInteraction = interactionOrMessage.isCommand?.() || interactionOrMessage.commandName;
    const guild = interactionOrMessage.guild;
    const member = isInteraction ? interactionOrMessage.member : interactionOrMessage.member;

    // Check permissions
    if (!member.permissions.has(PermissionFlagsBits.ManageChannels)) {
      const errorMsg = '❌ You need the "Manage Channels" permission to use this command!';
      if (isInteraction) {
        return await interactionOrMessage.reply({ content: errorMsg, ephemeral: true });
      } else {
        return await interactionOrMessage.reply(errorMsg);
      }
    }

    let channel;
    if (isInteraction) {
      channel = interactionOrMessage.options.getChannel('channel');
    } else {
      // For prefix commands, get channel from mentions or ID
      const channelMention = interactionOrMessage.content.split(' ')[1];
      if (!channelMention) {
        return await interactionOrMessage.reply('❌ Please provide a channel! Usage: `!set-achievement-channel #channel`');
      }
      
      const channelId = channelMention.replace(/[<#>]/g, '');
      channel = guild.channels.cache.get(channelId);
    }

    if (!channel || channel.type !== 0) { // 0 = GUILD_TEXT
      const errorMsg = '❌ Please provide a valid text channel!';
      if (isInteraction) {
        return await interactionOrMessage.reply({ content: errorMsg, ephemeral: true });
      } else {
        return await interactionOrMessage.reply(errorMsg);
      }
    }

    try {
      await GuildSettings.findOneAndUpdate(
        { guildId: guild.id },
        { achievementChannelId: channel.id },
        { upsert: true, new: true }
      );

      const successMsg = `✅ Achievement notifications will now be sent to ${channel}!`;
      if (isInteraction) {
        await interactionOrMessage.reply({ content: successMsg, ephemeral: true });
      } else {
        await interactionOrMessage.reply(successMsg);
      }
    } catch (error) {
      console.error('Error setting achievement channel:', error);
      const errorMsg = '❌ Failed to set achievement channel. Please try again.';
      if (isInteraction) {
        await interactionOrMessage.reply({ content: errorMsg, ephemeral: true });
      } else {
        await interactionOrMessage.reply(errorMsg);
      }
    }
  },

  async executeSlash(interaction) {
    await this.execute(interaction);
  },
};