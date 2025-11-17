const UserXP = require('../models/levels/UserXp');

// Returns random XP between min and max (inclusive)
function getRandomXP(min = 5, max = 15) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// XP needed to level up for given level (quadratic growth)
function xpNeededForLevel(level) {
  return Math.floor(100 * level ** 1.5);
}

// Handles XP gain and leveling
async function handleXP(userId, guildId, cooldownTime = 60000) {
  // 1 minute
  try {
    // Find or create user data
    let userData = await UserXP.findOne({ userId, guildId });
    if (!userData) {
      userData = new UserXP({
        userId,
        guildId,
        xp: 0,
        level: 1,
        lastMessageTimestamp: new Date(0), // Set to past date to allow immediate XP
      });
    }

    const now = Date.now();
    const lastMessageTime = userData.lastMessageTimestamp
      ? userData.lastMessageTimestamp.getTime()
      : 0;

    // Check cooldown
    if (now - lastMessageTime < cooldownTime) {
      return { userData, leveledUp: false, xpGain: 0 };
    }

    // Give random XP
    const xpGain = getRandomXP();
    userData.xp += xpGain;

    let leveledUp = false;
    let xpForNextLevel = xpNeededForLevel(userData.level);

    // Level up check
    while (userData.xp >= xpForNextLevel) {
      userData.level += 1;
      userData.xp -= xpForNextLevel;
      xpForNextLevel = xpNeededForLevel(userData.level);
      leveledUp = true;
    }

    // Update timestamp
    userData.lastMessageTimestamp = new Date();
    await userData.save();

    return { userData, leveledUp, xpGain };
  } catch (error) {
    throw error;
  }
}

module.exports = {
  getRandomXP,
  xpNeededForLevel,
  handleXP,
};
