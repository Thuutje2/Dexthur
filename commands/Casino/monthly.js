// monthly.js
const { EmbedBuilder } = require('@discordjs/builders');
const { query } = require('../../database');

module.exports = {
  name: 'monthly',
  description: 'Claim your monthly reward.',
  category: 'Casino',
  async execute(message, args, userData) {
    const monthlyReward = 500;

    // Check if the user has already claimed the monthly reward this month
    const lastMonthlyClaim = userData.lastMonthlyClaim || 0;
    const currentTime = new Date().getTime();
    const oneMonthInMillis = 30 * 24 * 60 * 60 * 1000;

    if (currentTime - lastMonthlyClaim < oneMonthInMillis) {
      return message.reply('You have already claimed your monthly reward this month.');
    }

    // Grant the monthly reward and update the user's data in the database
    const newBalance = (userData.balance || 0) + monthlyReward;
    const newLastMonthlyClaim = currentTime;

    // Update the user's data in the database
    await query('UPDATE users SET balance = $1, last_monthly_claim = $2 WHERE user_id = $3', [newBalance, newLastMonthlyClaim, message.author.id]);

    // Use EmbedBuilder for the response
    const embed = new EmbedBuilder()
      .setColor(0x0099ff)
      .setTitle('Monthly Reward')
      .setDescription(`Congratulations! You claimed your monthly reward of ${monthlyReward} coins. Your new balance is ${newBalance} coins.`);

    message.reply({ embeds: [embed] });
  },
};

