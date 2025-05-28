const { EmbedBuilder } = require('@discordjs/builders');
const { query } = require('../../database');

module.exports = {
  name: 'guessLeaderboard',
  description: 'Show the leaderboard for the Disney character guessing game.',
  aliases: ['guesslb', 'glb'],
  async execute(message, args) {
    try {
      // Haal de top 10 van de leaderboard op uit de database
      const leaderboardResult = await query(
        'SELECT * FROM user_points ORDER BY points DESC, streak DESC LIMIT 10'
      );
      const leaderboard = leaderboardResult.rows;

      // Bouw een embed met de leaderboard
      const embed = new EmbedBuilder()
        .setTitle('Disney Character Guessing Game Leaderboard')
        .setDescription('Top 10')
        .setColor(0x0099ff)
        .setTimestamp();

      // Voeg de top 10 van de leaderboard toe aan de embed
      leaderboard.forEach((user, index) => {
        embed.addFields({
          name: `${index + 1}. ${user.username}`,
          value: `Points: ${user.points}, Correct guesses count: ${user.streak}`,
        });
      });

      // Stuur de embed naar de gebruiker
      message.channel.send({ embeds: [embed] });
    } catch (error) {
      console.error('Error occurred in guessLeaderboard command', error);
      message.reply(
        'An error occurred while fetching the leaderboard. Please try again later.'
      );
    }
  },
};
