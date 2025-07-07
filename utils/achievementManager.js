const User = require('../models/achievements/user');
const UserPoints = require('../models/disney/userPointsSchema');

async function unlockAchievement(userId, achievementId) {
  let user = await User.findOne({ userId });
  if (!user) {
    user = await User.create({ userId, achievements: [] });
  }

  // Check if achievement is already unlocked
  const alreadyUnlocked = user.achievements.find(a => a.id === achievementId);
  if (alreadyUnlocked) {
    return false; // Already unlocked
  }

  // Add the achievement
  user.achievements.push({
    id: achievementId,
    unlockedAt: new Date()
  });

  await user.save();
  return true; // Successfully unlocked
}

async function checkDBDLevelAchievements(userId, newLevel) {
  const achievementsToCheck = [
    { level: 1, id: 'dbdLevel1' },
    { level: 2, id: 'dbdLevel2' },
    { level: 3, id: 'dbdLevel3' },
    { level: 4, id: 'dbdLevel4' },
    { level: 5, id: 'dbdLevel5' },
    { level: 6, id: 'dbdLevel6' },
    { level: 7, id: 'dbdLevel7' },
    { level: 8, id: 'dbdLevel8' },
    { level: 9, id: 'dbdLevel9' },
    { level: 10, id: 'dbdLevel10' },
  ];

  const unlockedAchievements = [];

  for (const achievement of achievementsToCheck) {
    if (newLevel >= achievement.level) {
      const unlocked = await unlockAchievement(userId, achievement.id);
      if (unlocked) {
        unlockedAchievements.push(achievement.id);
      }
    }
  }

  return unlockedAchievements;
}

// Disney achievements - Fixed version
async function checkDisneyAchievements(userId, pointsOverride = null) {
  try {
    // Get points from UserPoints collection if not provided
    let points = pointsOverride;
    if (points === null) {
      const userPointsData = await UserPoints.findOne({ user_id: userId });
      points = userPointsData ? userPointsData.points : 0;
    }
    
    // Ensure the user exists in the achievements collection
    let user = await User.findOne({ userId });
    if (!user) {
      user = await User.create({ userId, achievements: [] });
    }
    
    const achievementsToCheck = [
      { points: 500, id: 'disneyLevel1' },
      { points: 1000, id: 'disneyLevel2' },
      { points: 1500, id: 'disneyLevel3' },
      { points: 2000, id: 'disneyLevel4' },
      { points: 2500, id: 'disneyLevel5' },
      { points: 5000, id: 'disneyLevel6' },
      { points: 10000, id: 'disneyLevel7' },
      { points: 15000, id: 'disneyLevel8' },
    ];

    const unlockedAchievements = [];

    for (const achievement of achievementsToCheck) {
      
      if (points >= achievement.points) {
        const unlocked = await unlockAchievement(userId, achievement.id);
        
        if (unlocked) {
          unlockedAchievements.push(achievement.id);
        }
      }
    }

    return unlockedAchievements;
  } catch (error) {
    console.error('Error in checkDisneyAchievements:', error);
    return [];
  }
}

module.exports = { unlockAchievement, checkDBDLevelAchievements, checkDisneyAchievements };