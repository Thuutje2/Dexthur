// module.exports = {
//     name: 'balance',
//     description: 'Check your balance.',
//     category: 'Casino',
//     execute(message, args, userData) {
//       const userBalance = userData.balance || 0;
//       message.reply(`Your current balance is ${userBalance} coins.`);
//     },
//   };

const db = require('../../database');

module.exports = {
  name: 'balance',
  description: 'Check your balance.',
  category: 'Casino',
  async execute(message, args, userData) {
    try {
      const result = await db.query('SELECT balance FROM users WHERE user_id = $1', [message.author.id]);
      const userBalance = result.rows[0].balance || 0;
      message.reply(`Your current balance is ${userBalance} coins.`);
    } catch (error) {
      console.error('Error fetching balance:', error);
      message.reply('An error occurred while fetching your balance.');
    }
  },
};

  