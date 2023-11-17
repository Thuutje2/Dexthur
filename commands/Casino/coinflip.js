const db = require('../../database');

module.exports = {
  name: 'coinflip',
  description: 'Flip a coin and bet on the outcome.',
  aliases: ['cf'],
  usage: '!coinflip <bet> <heads/tails>',
  category: 'Casino',
  async execute(message, args) {
    const betAmount = parseInt(args[0]);
    const userChoice = args[1]?.toLowerCase();

    if (isNaN(betAmount) || betAmount <= 0 || !['heads', 'tails'].includes(userChoice)) {
      return message.reply('Please enter a valid bet amount and choose "heads" or "tails".');
    }

    try {
      // Haal de balans op van de gebruiker uit de database
      const userResult = await db.query('SELECT balance FROM users WHERE user_id = $1', [message.author.id]);
      const userBalance = userResult.rows[0].balance || 0;

      if (betAmount > userBalance) {
        return message.reply('Insufficient funds to place this bet.');
      }

      // Simuleer een muntworp (0 voor kop, 1 voor munt)
      const coinResult = Math.floor(Math.random() * 2);

      // Bepaal of de gebruiker heeft gewonnen op basis van de keuze en de muntworp
      const isWinner = (userChoice === 'heads' && coinResult === 0) || (userChoice === 'tails' && coinResult === 1);

      // Bereken de nieuwe balans op basis van de weddenschapsuitkomst
      const newBalance = isWinner ? userBalance + betAmount : userBalance - betAmount;

      // Werk de gebruikersbalans bij in de database
      await db.query('UPDATE users SET balance = $1 WHERE user_id = $2', [newBalance, message.author.id]);

      // Geef het resultaat van de muntworp weer
      message.reply(`Coin landed on ${coinResult === 0 ? 'Heads' : 'Tails'}. ${isWinner ? 'You won!' : 'You lost.'} Your new balance is ${newBalance} coins.`);
    } catch (error) {
      console.error('Error processing coin flip:', error);
      message.reply('An error occurred while processing the coin flip.');
    }
  },
};
