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
    const currentTimeInSeconds = Math.floor(Date.now() / 1000); // Convert to seconds
    const oneYearInSeconds = 365 * 24 * 60 * 60;

    if (currentTimeInSeconds - lastYearlyClaim < oneYearInSeconds) {
      return message.reply('You have already claimed your yearly reward this year.');
    }

    // Fetch the current balance from the database
    const currentBalance = (await query('SELECT balance FROM users WHERE user_id = $1', [message.author.id])).rows[0]?.balance || 0;

    // Grant the yearly reward and update the user's data in the database
    const newBalance = currentBalance + yearlyReward;
    const newLastYearlyClaim = currentTimeInSeconds;

    // Update the user's data in the database
    await query('UPDATE users SET balance = $1, last_yearly_claim = to_timestamp($2) WHERE user_id = $3', [newBalance, newLastYearlyClaim, message.author.id]);

    // Use EmbedBuilder for the response
    const embed = new EmbedBuilder()
      .setColor(0x0099ff)
      .setTitle('Yearly Reward')
      .setDescription(`Congratulations! You claimed your yearly reward of ${yearlyReward} coins. Your new balance is ${newBalance} coins.`);

    message.reply({ embeds: [embed] });
  },
};






  