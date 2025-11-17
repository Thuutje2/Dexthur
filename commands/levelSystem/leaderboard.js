const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const UserXP = require('../../models/levels/UserXp');

module.exports = {
  name: 'leaderboard',
  description: "Display the server's XP leaderboard",
  usage: '!leaderboard',
  category: 'Leveling',
  data: new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription("Show the server's XP leaderboard")
    .addIntegerOption(option =>
      option.setName('page')
        .setDescription('Page number to view')
        .setRequired(false)),

  async execute(message, args) {
    const page = args[0] ? parseInt(args[0], 10) : 1;
    await this.showLeaderboard(message, page, false);
  },

  async executeSlash(interaction) {
    const page = interaction.options.getInteger('page') || 1;
    await this.showLeaderboard(interaction, page, true);
  },

  async showLeaderboard(context, page = 1, isSlash = false) {
    try {
      if (isSlash && context.deferred !== true && context.replied !== true) {
        await context.deferReply();
      }

      const usersPerPage = 10;
      const skip = (page - 1) * usersPerPage;
      const guildId = isSlash ? context.guildId : context.guild.id;
      const guild = isSlash ? context.guild : context.guild;

      const totalUsers = await UserXP.countDocuments({ guildId });
      const totalPages = Math.max(1, Math.ceil(totalUsers / usersPerPage));
      const pageClamped = Math.min(Math.max(1, page), totalPages);

      const users = await UserXP.find({ guildId })
        .sort({ level: -1, xp: -1 })
        .skip((pageClamped - 1) * usersPerPage)
        .limit(usersPerPage);

      if (!users.length) {
        const response = 'No users found in the leaderboard!';
        if (isSlash) return await context.editReply({ content: response });
        return await context.channel.send(response);
      }

      const embed = new EmbedBuilder()
        .setTitle("🏆 Dexthur's Leaderboard")
        .setColor(0x357CA5)
        .setFooter({ text: `Page ${pageClamped} of ${totalPages}` });

      // Build fields: one field per user (max 25 fields allowed; we're using 10)
      for (let i = 0; i < users.length; i++) {
        const userDoc = users[i];
        const position = (pageClamped - 1) * usersPerPage + i + 1;
        let displayName = `Unknown User (${userDoc.userId})`;
        try {
          const member = await guild.members.fetch(userDoc.userId).catch(() => null);
          if (member) displayName = member.user.tag;
        } catch {
          // ignore fetch errors
        }

        const value = `Level: **${userDoc.level}** • XP: **${userDoc.xp}**`;
        embed.addFields({ name: `#${position} — ${displayName}`, value, inline: false });
      }

      // Summary in description
      embed.setDescription(`Showing top ${usersPerPage} — total users: **${totalUsers}**`);

      if (isSlash) {
        await context.editReply({ embeds: [embed] });
      } else {
        await context.channel.send({ embeds: [embed] });
      }
    } catch (error) {
      console.error('Error generating leaderboard:', error);
      const errorMsg = 'There was an error generating the leaderboard!';
      if (isSlash) {
        if (context.deferred || context.replied) {
          await context.editReply({ content: errorMsg });
        } else {
          await context.reply({ content: errorMsg, ephemeral: true });
        }
      } else {
        await context.channel.send(errorMsg);
      }
    }
  },
};