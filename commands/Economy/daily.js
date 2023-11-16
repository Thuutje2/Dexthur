const { EmbedBuilder } = require('@discordjs/builders');
const { query } = require('../../database');

module.exports = {
  name: 'daily',
  description: 'Claim your daily reward.',
  category: 'Casino',
  cooldown: 24 * 60 * 60, // Cooldown in seconds (24 hours)

  async execute(message, args) {
    const currentTimestampInSeconds = Math.floor(Date.now() / 1000); // Convert to seconds

    // Fetch the last daily claim timestamp from the database
    const lastDailyTimestampResult = await query('SELECT EXTRACT(EPOCH FROM last_daily_claim AT TIME ZONE \'UTC\') AS last_daily_claim FROM users WHERE user_id = $1', [message.author.id]);
    const lastDailyTimestamp = (lastDailyTimestampResult.rows[0] && lastDailyTimestampResult.rows[0].last_daily_claim) || 0;

    // Calculate the time since the last claim
    const timeSinceLastClaim = currentTimestampInSeconds - lastDailyTimestamp;

    // Calculate the time until the next claim, considering the rollover into the next day
    let timeUntilNextClaim = this.cooldown - (timeSinceLastClaim % this.cooldown);
    
    const hours = Math.floor(timeUntilNextClaim / 3600);
    const minutes = Math.floor((timeUntilNextClaim % 3600) / 60);

    // Check if the user can claim the daily reward based on the cooldown
    if (timeSinceLastClaim < this.cooldown) {
      return message.reply(`You can claim your daily reward in ${hours} hours and ${minutes} minutes.`);
    }

    // Fetch the current balance from the database
    const currentBalanceResult = await query('SELECT balance FROM users WHERE user_id = $1', [message.author.id]);
    const currentBalance = (currentBalanceResult.rows[0] && currentBalanceResult.rows[0].balance) || 0;

    const dailyReward = 100;
    const newBalance = currentBalance + dailyReward;

    // Update the user's data in the database
    await query('UPDATE users SET balance = $1, last_daily_claim = CURRENT_TIMESTAMP AT TIME ZONE \'UTC\' WHERE user_id = $2', [newBalance, message.author.id]);

    // Use EmbedBuilder for the response
    const embed = new EmbedBuilder()
      .setColor(0x0099ff)
      .setTitle('Daily Reward')
      .setDescription(`You've claimed your daily reward of ${dailyReward} coins. Your new balance is ${newBalance} coins.`);

    message.reply({ embeds: [embed] });
  },
};































