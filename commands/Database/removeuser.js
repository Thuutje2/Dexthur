// removeuser.js
const db = require('../../database');

module.exports = {
  name: 'removeuser',
  description: 'Remove yourself from the database.',
  category: 'Casino',
  async execute(message, args, userData) {
    try {
      // Remove user's todos first
      await db.query('DELETE FROM todo_list WHERE user_id = $1', [message.author.id]);

      // Then, check if the user exists in the database
      const userExists = await db.query('SELECT 1 FROM users WHERE user_id = $1', [message.author.id]);

      if (userExists.rows.length) {
        // If the user exists, remove them from the database
        await db.query('DELETE FROM users WHERE user_id = $1', [message.author.id]);
        message.reply('You have been removed from the database.');
      } else {
        // If the user doesn't exist, provide a message
        message.reply('You are not in the database.');
      }
    } catch (error) {
      console.error('Error removing user:', error);
      message.reply('An error occurred while removing you from the database.');
    }
  },
};

