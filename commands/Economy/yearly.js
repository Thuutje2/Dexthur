// yearly.js
const { EmbedBuilder } = require('@discordjs/builders');
const { query } = require('../../database');

module.exports = {
  name: 'yearly',
  description: 'Claim your yearly reward.',
  category: 'Casino',
  cooldown: 365 * 24 * 60 * 60, // Cooldown in seconds (365 days)

  async execute(message, args) {
    await claimReward(message, 'yearly', 365);
  },
};

async function claimReward(message, intervalType, cooldownDays) {
  const currentTimestampInSeconds = Math.floor(Date.now() / 1000); // Convert to seconds

  // Fetch the last claim timestamp from the database based on the interval type (monthly or yearly)
  const lastClaimTimestampResult = await query(`SELECT EXTRACT(EPOCH FROM last_${intervalType}_claim AT TIME ZONE 'UTC') AS last_claim FROM users WHERE user_id = $1`, [message.author.id]);
  const lastClaimTimestamp = (lastClaimTimestampResult.rows[0] && lastClaimTimestampResult.rows[0].last_claim) || 0;

  // Calculate the time since the last claim
  const timeSinceLastClaim = currentTimestampInSeconds - lastClaimTimestamp;

  // Calculate the time until the next claim, considering the rollover into the next interval
  let timeUntilNextClaim = cooldownDays * 24 * 60 * 60 - (timeSinceLastClaim % (cooldownDays * 24 * 60 * 60));

  const days = Math.floor(timeUntilNextClaim / (24 * 60 * 60));
  const hours = Math.floor((timeUntilNextClaim % (24 * 60 * 60)) / 3600);
  const minutes = Math.floor((timeUntilNextClaim % 3600) / 60);

  // Check if the user can claim the reward based on the cooldown
  if (timeSinceLastClaim < cooldownDays * 24 * 60 * 60) {
    return message.reply(`You can claim your ${intervalType} reward in ${days} days, ${hours} hours, and ${minutes} minutes.`);
  }

  // Fetch the current balance from the database
  const currentBalanceResult = await query('SELECT balance FROM users WHERE user_id = $1', [message.author.id]);
  const currentBalance = (currentBalanceResult.rows[0] && currentBalanceResult.rows[0].balance) || 0;

  // Define the reward amount based on the interval type
  const rewardAmount = intervalType === 'monthly' ? 500 : 5000;

  const newBalance = currentBalance + rewardAmount;

  // Update the user's data in the database
  await query(`UPDATE users SET balance = $1, last_${intervalType}_claim = CURRENT_TIMESTAMP AT TIME ZONE 'UTC' WHERE user_id = $2`, [newBalance, message.author.id]);

  // Use EmbedBuilder for the response
  const embed = new EmbedBuilder()
    .setColor(0x0099ff)
    .setTitle(`${intervalType.charAt(0).toUpperCase() + intervalType.slice(1)} Reward`)
    .setDescription(`You've claimed your ${intervalType} reward of ${rewardAmount} coins. Your new balance is ${newBalance} coins.`);

  message.reply({ embeds: [embed] });
}







  