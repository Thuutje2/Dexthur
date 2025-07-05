const { EmbedBuilder } = require('@discordjs/builders');
const { UserPoints } = require('../../models/index');

module.exports = {
  name: 'guessLeaderboard',
  description: 'Show the leaderboard for the Disney character guessing game.',
  aliases: ['guesslb', 'glb'],
  async execute(message, args) {
    try {
      // Get the top 10 from the leaderboard from the database
      const leaderboard = await UserPoints.find({})
        .sort({ points: -1, streak: -1 })
        .limit(10)
        .select('username points streak');

      // Build an embed with the leaderboard
      const embed = new EmbedBuilder()
        .setTitle('Disney Character Guessing Game Leaderboard')
        .setDescription('Top 10')
        .setColor(0x0099ff)
        .setTimestamp();

      // Add the top 10 of the leaderboard to the embed
      leaderboard.forEach((user, index) => {
        embed.addFields({
          name: `${index + 1}. ${user.username}`,
          value: `Points: ${user.points}, Correct guesses count: ${user.streak}`,
        });
      });

      // Send the embed to the user
      message.channel.send({ embeds: [embed] });
    } catch (error) {
      console.error('Error occurred in guessLeaderboard command', error);
      message.reply(
        'An error occurred while fetching the leaderboard. Please try again later.'
      );
    }
  },
};
