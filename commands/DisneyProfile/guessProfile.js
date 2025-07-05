const { EmbedBuilder } = require('@discordjs/builders');
const { UserPoints, UserFavorites } = require('../../models/index');
const { getCooldownTime } = require('../../cooldown');

module.exports = {
  name: 'guessProfile',
  description:
    'Show the profile of the user for the Disney character guessing game.',
  aliases: ['guessp', 'gp'],
  async execute(message, args) {
    try {
      let targetUser = message.mentions.users.first() || message.author;

      // Get the user's profile data from the user_points collection
      const profile = await UserPoints.findOne({ user_id: targetUser.id });

      // If the profile doesn't exist, give a message and stop the execution of the command
      if (!profile) {
        return message.reply(
          'This user has not played the Disney Character Guessing Game yet.'
        );
      }

      // Get the user's favorite data
      const favorites =
        (await UserFavorites.findOne({ user_id: targetUser.id })) || {};

      // Convert last guess dates to Date objects
      const lastCorrectGuessDate = new Date(profile.last_correct_guess_date);
      const lastFailedGuessDate = new Date(profile.last_failed_guess_date);

      // Determine which cooldown we should use
      const now = new Date();
      const lastRelevantGuessDate =
        lastFailedGuessDate > lastCorrectGuessDate
          ? lastFailedGuessDate
          : lastCorrectGuessDate;

      // Get the cooldown information
      const cooldown = getCooldownTime(lastRelevantGuessDate);

      // Build an embed with the profile data
      const embed = new EmbedBuilder()
        .setTitle(targetUser.username + `'s Profile`)
        .setColor(0x0099ff)
        .setTimestamp()
        .setThumbnail(targetUser.displayAvatarURL())
        .addFields(
          {
            name: '⏳ Next Guess Available In',
            value: `${cooldown.remainingMinutes} minutes`,
          },
          {
            name: '📈 Total Points',
            value: `${profile.points.toString()} points`,
          },
          {
            name: '🔥 Correct guesses streak:',
            value: `${profile.streak.toString()} `,
          },
          {
            name: '🩷 Favorite Character',
            value: favorites.favorite_character_name || 'Not set',
          },
          {
            name: '🩷 Favorite Serie or Film',
            value: favorites.favorite_series_film || 'Not set',
          }
        );

      // Send the embed to the user
      message.channel.send({ embeds: [embed] });
    } catch (error) {
      console.error('Error occurred in guessProfile command', error);
      message.reply(
        'An error occurred while fetching the profile. Please try again later.'
      );
    }
  },
};
