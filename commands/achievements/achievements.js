const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const User = require('../../models/achievements/user');
const allAchievements = require('../../data/achievements');

module.exports = {
    name: 'achievements',
    description: 'Bekijk je behaalde achievements',
    usage: '!achievements',
    category: 'Game',
    data: new SlashCommandBuilder()
        .setName('achievements')
        .setDescription('Bekijk je behaalde achievements'),

  async execute(interactionOrMessage) {
    // Check if it's an interaction (slash command) or message (prefix command)
    const isInteraction = interactionOrMessage.isCommand?.() || interactionOrMessage.commandName;
    const user = isInteraction ? interactionOrMessage.user : interactionOrMessage.author;
    const userId = user.id;

    let userDoc = await User.findOne({ userId });
    if (!userDoc) {
      userDoc = await User.create({ userId, achievements: [] });
    }

    const embed = new EmbedBuilder()
      .setTitle(`🏆 Achievements van ${user.username}`)
      .setColor(0x00AEFF);

    for (const ach of allAchievements) {
      const unlocked = userDoc.achievements.find((a) => a.id === ach.id);

      embed.addFields({
        name: unlocked ? `✅ ${ach.name}` : `🔒 ${ach.name}`,
        value: unlocked
          ? `✅ Behaald op <t:${Math.floor(new Date(unlocked.unlockedAt).getTime() / 1000)}:d>`
          : `🕹️ ${ach.description}`,
        inline: false,
      });
    }

    if (isInteraction) {
      await interactionOrMessage.reply({ embeds: [embed], ephemeral: true });
    } else {
      await interactionOrMessage.reply({ embeds: [embed] });
    }
  },

  async executeSlash(interaction) {
    await this.execute(interaction);
  },
};
