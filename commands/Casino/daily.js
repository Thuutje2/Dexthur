// daily.js
const { EmbedBuilder } = require('@discordjs/builders');
const { query } = require('../../database');

module.exports = {
  name: 'daily',
  description: 'Claim your daily reward.',
  category: 'Casino',
  cooldown: 24 * 60 * 60, // Cooldown in seconds (24 hours)

  async execute(message, args, userData) {
    const currentTimestampInSeconds = Math.floor(Date.now() / 1000); // Convert to seconds
    const lastDailyTimestamp = userData.lastDaily || 0;

    // Check if the user can claim the daily reward based on the cooldown
    if (currentTimestampInSeconds - lastDailyTimestamp < this.cooldown) {
      const timeUntilNextClaim = lastDailyTimestamp + this.cooldown - currentTimestampInSeconds;
      const hours = Math.max(0, Math.floor(timeUntilNextClaim / 3600)); // Convert to hours
      const minutes = Math.max(0, Math.floor((timeUntilNextClaim % 3600) / 60)); // Convert to minutes

      return message.reply(`You can claim your daily reward in ${hours} hours and ${minutes} minutes.`);
    }

    // Fetch the current balance from the database
    const currentBalance = (await query('SELECT balance FROM users WHERE user_id = $1', [message.author.id])).rows[0]?.balance || 0;

    const dailyReward = 100;
    const newBalance = currentBalance + dailyReward;

    // Update the user's data in the database
    await query('UPDATE users SET balance = $1, last_daily_claim = to_timestamp($2) WHERE user_id = $3', [newBalance, currentTimestampInSeconds, message.author.id]);

    // Use EmbedBuilder for the response
    const embed = new EmbedBuilder()
      .setColor(0x0099ff)
      .setTitle('Daily Reward')
      .setDescription(`You've claimed your daily reward of ${dailyReward} coins. Your new balance is ${newBalance} coins.`);

    message.reply({ embeds: [embed] });
  },
};






















