const User = require('../models/disney/userPointsSchema');
const { checkDisneyAchievements } = require('./achievementManager');
const allAchievements = require('../data/achievements');
const GuildSettings = require('../models/setup/GuildSettings');

async function addPoints(userId, points) {
  let user = await User.findOne({ userId });
  if (!user) {
    user = new User({ userId, points: 0 });
  }

  user.points += points;
  const newPoints = user.points;

  if (newPoints > user.points) {
    user.points = newPoints;
    // Get guild settings for achievement channel
    const guildSettings = await GuildSettings.findOne({ guildId: user.guildId });
    const achievementChannelId = guildSettings?.achievementChannelId;

    // Determine where to send messages
    const achievementChannel = achievementChannelId ? 
      user.guild.channels.cache.get(achievementChannelId) : null;
    const targetChannel = achievementChannel || user.guild.channels.cache.get(user.defaultChannelId);

    // Check for Disney achievements
    const unlockedAchievements = await checkDisneyAchievements(userId, newPoints);

    // Send achievement notifications
    if (unlockedAchievements.length > 0) {
      for (const achievementId of unlockedAchievements) {
        const achievement = allAchievements.find(a => a.id === achievementId);
        if (achievement) {
          targetChannel.send(`🏆 <@${userId}> has unlocked the achievement: **${achievement.name}**!`);
        }
      }
    }
  }



}

module.exports = { addPoints };