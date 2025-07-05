const { UserPoints, UserFavorites } = require('../../models/index');

module.exports = {
  name: 'disneyFavoriteSerieOrMovie',
  description: 'Set your favorite Disney series or film.',
  args: true,
  usage: '<series_or_film>',
  aliases: ['dfsm', 'favoriteSerieOrMovie'],
  async execute(message, args) {
    if (args.length < 1) {
      return message.reply(
        `Usage: !series <series_or_film>. Please provide the name of your favorite Disney series or film.`
      );
    }

    const profile = await UserPoints.findOne({ user_id: message.author.id });

    if (!profile) {
      return message.reply(
        'You have not played the Disney Character Guessing Game yet. Please play the game first before setting your favorite serie or film.'
      );
    }

    // Combine all arguments into a single string for series/film
    const seriesOrFilm = args.join(' ');

    try {
      // Update only the favorite series/film in the database
      await UserFavorites.findOneAndUpdate(
        { user_id: message.author.id },
        { favorite_series_film: seriesOrFilm },
        { upsert: true }
      );

      message.reply('Your favorite series or film has been updated!');
    } catch (error) {
      console.error('Error occurred in series command', error);
      message.reply(
        'An error occurred while updating your favorite series or film. Please try again later.'
      );
    }
  },
};
