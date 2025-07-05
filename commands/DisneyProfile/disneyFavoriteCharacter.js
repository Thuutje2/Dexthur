const { UserPoints, UserFavorites } = require('../../models/index');

module.exports = {
  name: 'disneyFavoriteCharacter',
  description: 'Set your favorite Disney character.',
  args: true,
  usage: '<character_name>',
  aliases: ['dfc', 'favoriteCharacter'],
  async execute(message, args) {
    if (args.length < 1) {
      return message.reply(
        `Usage: !character <character_name>. Please provide the name of your favorite Disney character.`
      );
    }

    const profile = await UserPoints.findOne({ user_id: message.author.id });

    if (!profile) {
      return message.reply(
        'You have not played the Disney Character Guessing Game yet. Please play the game first before setting your favorite character.'
      );
    }

    // Combine all arguments into a single string for character name
    const characterName = args.join(' ');

    try {
      // Update only the favorite character in the database
      await UserFavorites.findOneAndUpdate(
        { user_id: message.author.id },
        { favorite_character_name: characterName },
        { upsert: true }
      );

      message.reply('Your favorite character has been updated!');
    } catch (error) {
      console.error('Error occurred in character command', error);
      message.reply(
        'An error occurred while updating your favorite character. Please try again later.'
      );
    }
  },
};
