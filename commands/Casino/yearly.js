// yearly.js
const { EmbedBuilder } = require('@discordjs/builders');
const { query } = require('../../database');

module.exports = {
  name: 'yearly',
  description: 'Claim your yearly reward.',
  category: 'Casino',
  async execute(message, args, userData) {
    const yearlyReward = 2000;

    // Check if the user has already claimed the yearly reward this year
    const lastYearlyClaim = userData.lastYearlyClaim || 0;
    const currentTime = new Date().getTime();
    const oneYearInMillis = 365 * 24 * 60 * 60 * 1000;

    if (currentTime - lastYearlyClaim < oneYearInMillis) {
      return message.reply('You have already claimed your yearly reward this year.');
    }

    // Grant the yearly reward and update the user's data in the database
    const newBalance = (userData.balance || 0) + yearlyReward;
    const newLastYearlyClaim = currentTime;

    // Update the user's data in the database
    await query('UPDATE users SET balance = $1, last_yearly_claim = $2 WHERE user_id = $3', [newBalance, newLastYearlyClaim, message.author.id]);

    // Use EmbedBuilder for the response
    const embed = new EmbedBuilder()
      .setColor(0x0099ff)
      .setTitle('Yearly Reward')
      .setDescription(`Congratulations! You claimed your yearly reward of ${yearlyReward} coins. Your new balance is ${newBalance} coins.`);

    message.reply({ embeds: [embed] });
  },
};


  