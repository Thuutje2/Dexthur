const User = require('../models/dbd/dbdUser');
const { xpPerCorrectAnswer, xpToLevel, getLevelRoles } = require('../commands/DeadByDaylight/utils/dbdxp');
const { checkDBDLevelAchievements } = require('./achievementManager');
const allAchievements = require('../data/achievements');
const GuildSettings = require('../models/setup/GuildSettings');

async function addXp(message, userId) {
  let user = await User.findOne({ userId });
  if (!user) {
    user = new User({ userId });
  }

  user.xp += xpPerCorrectAnswer;
  const newLevel = xpToLevel(user.xp);

  if (newLevel > user.level) {
    user.level = newLevel;

    // Get guild settings for achievement channel
    const guildSettings = await GuildSettings.findOne({ guildId: message.guild.id });
    const achievementChannelId = guildSettings?.achievementChannelId;
    
    // Determine where to send messages
    const achievementChannel = achievementChannelId ? 
      message.guild.channels.cache.get(achievementChannelId) : null;
    const targetChannel = achievementChannel || message.channel;

    // Check for DBD level achievements
    const unlockedAchievements = await checkDBDLevelAchievements(userId, newLevel);
    
    // Send achievement notifications
    if (unlockedAchievements.length > 0) {
      for (const achievementId of unlockedAchievements) {
        const achievement = allAchievements.find(a => a.id === achievementId);
        if (achievement) {
          targetChannel.send(`🏆 <@${userId}> has unlocked the achievement: **${achievement.name}**!`);
        }
      }
    }

    // Get level roles from database
    const levelRoles = await getLevelRoles(message.guild.id);
    const roleInfo = levelRoles.find((r) => r.level === newLevel);
    
    if (roleInfo) {
      const role = message.guild.roles.cache.get(roleInfo.roleId);
      if (role) {
        const member = await message.guild.members.fetch(userId);
        await member.roles.add(role);
        targetChannel.send(`🎉 <@${userId}> has reached **Level ${newLevel}** and received the role **${role.name}**!`);
      }
    }
  }

  await user.save();
}

module.exports = { addXp };