// module.exports = {
//     name: 'slots',
//     description: 'Try your luck at the slot machine.',
//     category: 'Casino',
//     execute(message, args, userData) {
//       const betAmount = parseInt(args[0]) || 1;
  
//       if (userData.balance < betAmount) {
//         return message.reply("You don't have enough coins to place that bet.");
//       }
  
//       const symbols = ['🍒', '🍊', '🍇', '💰', '🔔'];
//       const result = [];
      
//       for (let i = 0; i < 3; i++) {
//         const randomSymbol = symbols[Math.floor(Math.random() * symbols.length)];
//         result.push(randomSymbol);
//       }
  
//       message.reply(`Slot Machine: ${result.join(' | ')}`);
  
//       if (result[0] === result[1] && result[1] === result[2]) {
//         const winnings = betAmount * 2; // You can adjust the payout multiplier
//         userData.balance += winnings;
//         message.reply(`Congratulations! You won ${winnings} coins. Your new balance is ${userData.balance} coins.`);
//       } else {
//         userData.balance -= betAmount;
//         message.reply(`Sorry, you lost ${betAmount} coins. Your new balance is ${userData.balance} coins.`);
//       }
//     },
//   };
  
const { EmbedBuilder } = require('@discordjs/builders');
const { query } =  require('../../database');

module.exports = {
  name: 'slots',
  description: 'Try your luck at the slot machine.',
  category: 'Casino',
  async execute(message, args, userData) {
    const betAmount = parseInt(args[0]) || 1;

    if (userData.balance < betAmount) {
      return message.reply("You don't have enough coins to place that bet.");
    }

    const symbols = ['🍒', '🍊', '🍇', '💰', '🔔'];
    const result = [];

    for (let i = 0; i < 3; i++) {
      const randomSymbol = symbols[Math.floor(Math.random() * symbols.length)];
      result.push(randomSymbol);
    }

    message.reply(`Slot Machine: ${result.join(' | ')}`);

    if (result[0] === result[1] && result[1] === result[2]) {
      const winnings = betAmount * 2;
      const newBalance = userData.balance + winnings;

      // Update the user's data in the database
      await query('UPDATE users SET balance = $1 WHERE user_id = $2', [newBalance, message.author.id]);

      message.reply(`Congratulations! You won ${winnings} coins. Your new balance is ${newBalance} coins.`);
    } else {
      const newBalance = userData.balance - betAmount;

      // Update the user's data in the database
      await query('UPDATE users SET balance = $1 WHERE user_id = $2', [newBalance, message.author.id]);

      message.reply(`Sorry, you lost ${betAmount} coins. Your new balance is ${newBalance} coins.`);
    }
  },
};
