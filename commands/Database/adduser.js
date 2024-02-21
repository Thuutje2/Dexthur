// adduser.js
const db = require('../../database');

module.exports = {
  name: 'adduser',
  description: 'Add yourself to the database.',
  category: 'Casino',
  async execute(message, args, userData) {
    try {
      // Check if the user already exists in the database
      const userExists = await db.query('SELECT 1 FROM users WHERE user_id = $1', [message.author.id]);

      if (!userExists.rows.length) {
        // If the user doesn't exist, insert them into the database with default values
        await db.query(
          'INSERT INTO users (user_id, username, discriminator, balance, last_daily_claim, last_monthly_claim, last_yearly_claim) VALUES ($1, $2, $3, $4, null, null, null)',
          [message.author.id, message.author.username, message.author.discriminator, 0]
        );
        message.reply('You have been added to the database.');
      } else {
        // If the user already exists, provide a message
        message.reply('You are already in the database.');
      }
    } catch (error) {
      console.error('Error adding user:', error);
      message.reply('An error occurred while adding you to the database.');
    }
  },
};



