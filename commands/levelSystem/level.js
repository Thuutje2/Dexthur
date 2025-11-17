const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const UserXP = require('../../models/levels/UserXp');
const { xpNeededForLevel } = require('../../utils/xpLevelSystemUtils');

module.exports = {
  name: 'level',
  description: 'Check your level',
  usage: '!level [@user]',
  category: 'Leveling',
  data: new SlashCommandBuilder()
    .setName('level')
    .setDescription("Check your level or another user's level")
    .addUserOption((opt) =>
      opt.setName('user').setDescription('User to check').setRequired(false)
    ),

  async execute(message, args) {
    const targetUser = message.mentions.users.first() || message.author;
    await this.showLevel(message, targetUser, false);
  },

  async executeSlash(interaction) {
    const targetUser = interaction.options.getUser('user') || interaction.user;
    await this.showLevel(interaction, targetUser, true);
  },

  // Helpers
  async getUserData(userId, guildId) {
    try {
      let userData = await UserXP.findOne({ userId, guildId });
      if (!userData) {
        userData = new UserXP({ userId, guildId, xp: 0, level: 1 });
        await userData.save();
      }
      return userData;
    } catch (error) {
      console.error('Error fetching user data:', error);
      return { xp: 0, level: 1 };
    }
  },

  async getUserRank(userId, guildId) {
    try {
      const users = await UserXP.find({ guildId }).sort({ level: -1, xp: -1 });
      const idx = users.findIndex((u) => u.userId === userId);
      return idx === -1 ? 'N/A' : idx + 1;
    } catch (error) {
      console.error('Error fetching rank:', error);
      return 'N/A';
    }
  },

  createProgressBar(progress, length = 20) {
    const clamped = Math.max(0, Math.min(1, progress));
    const filled = Math.round(clamped * length);
    const empty = length - filled;
    const bar = '🟩'.repeat(filled) + '⬜'.repeat(empty);
    const percent = Math.round(clamped * 100);
    return { bar, percent };
  },

  async showLevel(context, user, isSlash = false) {
    try {
      if (isSlash && context.deferred !== true && context.replied !== true) {
        await context.deferReply();
      }

      const guildId = isSlash ? context.guildId : context.guild.id;

      const userData = await this.getUserData(user.id, guildId);
      const rank = await this.getUserRank(user.id, guildId);

      const xpForNext = xpNeededForLevel(userData.level);
      const progress = xpForNext > 0 ? userData.xp / xpForNext : 0;
      const { bar, percent } = this.createProgressBar(progress, 20);

      const embed = new EmbedBuilder()
        .setAuthor({
          name: `${user.tag}`,
          iconURL: user.displayAvatarURL({ dynamic: true }),
        })
        .setTitle('📊 Level card')
        .setColor(0x2b88d8)
        .addFields(
          { name: 'Level', value: `**${userData.level}**`, inline: true },
          { name: 'Rank', value: `#${rank}`, inline: true },
          { name: '\u200B', value: '\u200B', inline: true },
          {
            name: 'XP',
            value: `**${userData.xp} / ${xpForNext}**`,
            inline: false,
          },
          { name: 'Progress', value: `${bar}  ${percent}%`, inline: false }
        )
        .setFooter({ text: `User ID: ${user.id}` });

      if (isSlash) {
        await context.editReply({ embeds: [embed] });
      } else {
        await context.reply({ embeds: [embed] });
      }
    } catch (error) {
      console.error('Error in showLevel:', error);
      const errMsg = 'Error generating level info!';
      if (isSlash) {
        try {
          if (context.deferred || context.replied)
            await context.editReply({ content: errMsg });
          else await context.reply({ content: errMsg, ephemeral: true });
        } catch {
          /* ignore */
        }
      } else {
        try {
          await context.reply(errMsg);
        } catch {
          /* ignore */
        }
      }
    }
  },
};
