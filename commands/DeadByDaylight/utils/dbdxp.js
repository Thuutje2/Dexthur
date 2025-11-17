const GuildSettings = require('../../../models/setup/GuildSettings');

module.exports = {
  xpPerCorrectAnswer: 20,
  xpToLevel: (xp) => Math.floor(xp / 100), // 100 XP = level 1

  async getLevelRoles(guildId) {
    try {
      const settings = await GuildSettings.findOne({ guildId });
      return settings?.levelRoles || [];
    } catch (error) {
      console.error('Error fetching level roles:', error);
      return [];
    }
  },
};
