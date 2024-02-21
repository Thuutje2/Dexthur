const { query } = require('../../database');

module.exports = {
  name: 'addidea',
  description: 'Add a new idea to the list.',
  category: 'Admin',
  async execute(message, args) {
    try {
      // Controleer of de gebruiker een admin is
      if (!message.member.permissions.has('ADMINISTRATOR')) {
        return message.reply('You do not have the necessary permissions to add ideas.');
      }

      const ideaText = args.join(' ');

      if (!ideaText) {
        return message.reply('Please provide a description for the idea.');
      }

      // Haal het server-ID op
      const serverId = message.guild.id;

      // Voeg het nieuwe idee toe aan de database met het server-ID
      await query('INSERT INTO ideas (server_id, idea_text) VALUES ($1, $2)', [serverId, ideaText]);

      message.reply(`Idea added for this server: "${ideaText}"`);
    } catch (error) {
      console.error('Error adding idea:', error);
      message.reply('An error occurred while adding the idea.');
    }
  },
};

