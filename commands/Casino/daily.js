// const { EmbedBuilder } = require('@discordjs/builders');
// const { query } = require('../../database');

// module.exports = {
//   name: 'daily',
//   description: 'Claim your daily reward.',
//   category: 'Casino',
//   cooldown: 86400, // Cooldown in seconds (24 hours)

//   async execute(message, args, userData) {
//     const currentTimestamp = Date.now();
//     const dailyCooldownEnd = userData.daily_cooldown_end || 0;
//     const lastDailyTimestamp = userData.lastDaily || 0;

//     const dailyReward = 100;
//     const newBalance = (userData.balance || 0) + dailyReward;

//     // Als de gebruiker al eerder `!daily` heeft gebruikt, toon dan een timer tot de volgende dagelijkse beloning
//     if (lastDailyTimestamp > 0) {
//       const timeUntilNextDaily = lastDailyTimestamp + this.cooldown * 1000 - currentTimestamp;
//       const nextHours = Math.max(0, Math.floor(timeUntilNextDaily / 3600000));
//       const nextMinutes = Math.max(0, Math.floor((timeUntilNextDaily % 3600000) / 60000));

//       return message.reply(`Over ${nextHours} hours and ${nextMinutes} minutes you can do daily again.`);
//     }

//     // Als de gebruiker de dagelijkse beloning al heeft geclaimd
//     if (currentTimestamp < dailyCooldownEnd) {
//       const timeUntilNextClaim = dailyCooldownEnd - currentTimestamp;
//       const hours = Math.max(0, Math.floor(timeUntilNextClaim / 3600000)); // Omrekenen naar uren
//       const minutes = Math.max(0, Math.floor((timeUntilNextClaim % 3600000) / 60000)); // Omrekenen naar minuten

//       return message.reply(`You can claim your daily reward in ${hours} hours and ${minutes} minutes.`);
//     }

//     // Update de gebruikersgegevens en stel de laatst geclaimde timestamp en de dagelijkse cooldown in de database in
//     const newLastDaily = new Date(currentTimestamp).toISOString(); // Convert to a PostgreSQL timestamp
//     const newDailyCooldownEnd = Math.floor((currentTimestamp + this.cooldown * 1000) / 1000); // Converteer naar seconden
//     await query('UPDATE users SET balance = $1, last_daily_claim = $2, daily_cooldown_end = to_timestamp($3) WHERE user_id = $4', [newBalance, newLastDaily, newDailyCooldownEnd / 1000, message.author.id]);


//     const embed = new EmbedBuilder()
//       .setColor(0x0099ff)
//       .setTitle('Daily Reward')
//       .setDescription(`You've claimed your daily reward of ${dailyReward} coins. Your new balance is ${newBalance} coins.`);

//     message.reply({ embeds: [embed] });
//   },
// };

const { EmbedBuilder } = require('@discordjs/builders');

// Houdt de cooldown eindtijd bij voor elke gebruiker
const cooldowns = new Map();

module.exports = {
  name: 'daily',
  description: 'Claim your daily reward.',
  category: 'Casino',
  cooldown: 86400, // Cooldown in seconds (24 hours)

  async execute(message, args, userData) {
    const currentTimestamp = Date.now();
    const lastDailyTimestamp = userData.lastDaily || 0;

    const dailyReward = 100;
    const newBalance = (userData.balance || 0) + dailyReward;

    // Controleren of de gebruiker nog in cooldown is
    if (cooldowns.has(message.author.id)) {
      const remainingCooldown = cooldowns.get(message.author.id) - currentTimestamp;
      const remainingHours = Math.floor(remainingCooldown / 3600000);
      const remainingMinutes = Math.floor((remainingCooldown % 3600000) / 60000);

      return message.reply(`Over ${remainingHours} hours and ${remainingMinutes} minutes you can do daily again.`);
    }

    // Als de gebruiker al eerder `!daily` heeft gebruikt, toon dan een timer tot de volgende dagelijkse beloning
    if (lastDailyTimestamp > 0) {
      // Stel de cooldown in voor de gebruiker
      cooldowns.set(message.author.id, currentTimestamp + this.cooldown * 1000);

      // Bereken de nieuwe balans en update deze in de database
      const newBalance = (userData.balance || 0) + dailyReward;
      await query('UPDATE users SET balance = $1, last_daily_claim = to_timestamp($2), daily_cooldown_end = to_timestamp($3) WHERE user_id = $4', [newBalance, currentTimestamp / 1000, (currentTimestamp + this.cooldown * 1000) / 1000, message.author.id]);

      const embed = new EmbedBuilder()
        .setColor(0x0099ff)
        .setTitle('Daily Reward')
        .setDescription(`You've claimed your daily reward of ${dailyReward} coins. Your new balance is ${newBalance} coins.`);

      message.reply({ embeds: [embed] });

      // Wacht tot de cooldown is verstreken en verwijder de gebruiker uit de cooldowns map
      setTimeout(() => {
        cooldowns.delete(message.author.id);
      }, this.cooldown * 1000);

    } 
  },
};




















