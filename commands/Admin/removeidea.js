const { query } = require('../../database');

module.exports = {
  name: 'removeidea',
  description: 'Remove an idea from the list.',
  category: 'Admin',
  async execute(message, args) {
    try {
      // Controleer of de gebruiker een admin is
      if (!message.member.permissions.has('ADMINISTRATOR')) {
        return message.reply('You do not have the necessary permissions to remove ideas.');
      }

      const ideaIndex = parseInt(args[0]) - 1;

      if (isNaN(ideaIndex)) {
        return message.reply('Please provide a valid idea number to remove.');
      }

      // Haal alle ideeën op uit de database
      const result = await query('SELECT * FROM ideas');
      const ideasList = result.rows;

      if (ideaIndex < 0 || ideaIndex >= ideasList.length) {
        return message.reply('Invalid idea number. Check the ideas list using `!idealist`.');
      }

      // Verwijder het idee uit de database
      await query('DELETE FROM ideas WHERE idea_id = $1', [ideasList[ideaIndex].idea_id]);

      message.reply(`Idea #${ideaIndex + 1} removed: "${ideasList[ideaIndex].idea_text}"`);
    } catch (error) {
      console.error('Error removing idea:', error);
      message.reply('An error occurred while removing the idea.');
    }
  },
};
