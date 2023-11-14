const { EmbedBuilder } = require('@discordjs/builders');

module.exports = {
  name: 'daily',
  description: 'Claim your daily reward.',
  category: 'Casino', // You can adjust the category
  cooldown: 86400, // 24 hours cooldown in seconds
  execute(message, args, userData) {
    // Check if the user has already claimed their daily reward
    const lastDailyTimestamp = userData.lastDaily || 0;
    const currentTime = Math.floor(Date.now() / 1000);

    if (currentTime < lastDailyTimestamp + this.cooldown) {
      const remainingTime = lastDailyTimestamp + this.cooldown - currentTime;
      const hours = Math.floor(remainingTime / 3600);
      const minutes = Math.floor((remainingTime % 3600) / 60);

      return message.reply(`You've already claimed your daily reward. Please wait ${hours} hours and ${minutes} minutes.`);
    }

    // Perform actions for claiming the daily reward (adjust as needed)
    const dailyReward = 100; // Adjust the daily reward amount

    // Update user data and set the last claimed timestamp
    userData.balance = (userData.balance || 0) + dailyReward;
    userData.lastDaily = currentTime;

    const embed = new EmbedBuilder()
      .setColor(0x0099ff)
      .setTitle('Daily Reward')
      .setDescription(`You've claimed your daily reward of ${dailyReward} coins. Your new balance is ${userData.balance} coins.`);

    message.reply({ embeds: [embed] });
  },
};
