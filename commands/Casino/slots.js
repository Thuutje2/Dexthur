const { EmbedBuilder } = require('@discordjs/builders');
const { query } = require('../../database');

module.exports = {
  name: 'slots',
  description: 'Try your luck at the slot machine.',
  category: 'Casino',
  async execute(message, args) {
    let betAmount = parseInt(args[0]);

    // Check if betAmount is NaN or less than 1
    if (isNaN(betAmount) || betAmount <= 0) {
      return message.reply('Please enter a valid bet amount greater than or equal to 1.');
    }

    // Assuming you have a 'users' table with a 'balance' column in your database
    const userData = await query('SELECT balance FROM users WHERE user_id = $1', [message.author.id]);

    // Check if the query was successful and returned valid data
    if (!userData.rows || userData.rows.length === 0 || isNaN(userData.rows[0].balance)) {
      console.error('Invalid userData:', userData);
      return message.reply('Error retrieving user data or invalid user data.');
    }

    const userBalance = userData.rows[0].balance;

    if (userBalance < betAmount) {
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
      const newBalance = userBalance + winnings;
    
      // Update the user's data in the database
      await query('UPDATE users SET balance = $1 WHERE user_id = $2', [newBalance, message.author.id]);
    
      message.reply(`Congratulations! You won ${winnings} coins. Your new balance is ${newBalance} coins.`);
    } else {
      const newBalance = userBalance - betAmount;
    
      // Update the user's data in the database
      await query('UPDATE users SET balance = $1 WHERE user_id = $2', [newBalance, message.author.id]);
    
      message.reply(`Sorry, you lost ${betAmount} coins. Your new balance is ${newBalance} coins.`);
    }
  }
};

  

