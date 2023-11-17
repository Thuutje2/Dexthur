const { ActionRowBuilder, ButtonBuilder, EmbedBuilder } = require('@discordjs/builders');
const { query } = require('../../database');

module.exports = {
  name: 'roulette',
  description: 'Play a game of roulette.',
  aliases: ['rl'],
  category: 'Casino',

  async execute(message, args) {
    // Check if the user provided a valid bet
    const bet = parseInt(args[0]);

    if (isNaN(bet) || bet <= 0) {
      return message.reply('Please provide a valid bet amount greater than 0.');
    }

    // Fetch the current balance from the database
    const currentBalanceResult = await query('SELECT balance FROM users WHERE user_id = $1', [message.author.id]);
    const currentBalance = (currentBalanceResult.rows[0] && currentBalanceResult.rows[0].balance) || 0;

    // Check if the user has a valid balance to play roulette
    if (currentBalance < bet) {
      return message.reply('You don\'t have enough coins to place that bet.');
    }

    // Set up buttons for the player's turn
    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('red')
          .setLabel('Red')
          .setStyle(1), // Numeric value for PRIMARY
        new ButtonBuilder()
          .setCustomId('black')
          .setLabel('Black')
          .setStyle(2) // Numeric value for SECONDARY
      );

    const initialEmbed = new EmbedBuilder()
      .setColor(0x0099ff) // Set color
      .setTitle('Roulette')
      .addFields(
        { name: 'Bet', value: `${bet} coins on Red or Black` },
        { name: 'Balance', value: `Your Balance: ${currentBalance} coins` }
      )
      .setDescription('Choose whether to bet on Red or Black.');

    const initialMessage = await message.reply({ embeds: [initialEmbed], components: [row] });

    // Function to handle the player's turn
    const playerTurn = async () => {
      const filter = (interaction) => interaction.user.id === message.author.id;
      const collector = initialMessage.createMessageComponentCollector({ filter, time: 60000 });

      collector.on('collect', async (interaction) => {
        const result = Math.random() < 0.5 ? 'red' : 'black';

        // Check if the player guessed correctly
        if ((interaction.customId === 'red' && result === 'red') ||
            (interaction.customId === 'black' && result === 'black')) {
          // Player wins
          const winAmount = bet * 2; // Double the bet
          const updatedBalance = currentBalance + winAmount;

          const winEmbed = new EmbedBuilder()
            .setColor(0x00ff00) // Green for win
            .setTitle('Roulette - Win')
            .addFields(
              { name: 'Result', value: `The result is ${result}. You win ${winAmount} coins!` },
              { name: 'Balance', value: `Your updated balance: ${updatedBalance} coins` }
            );

          message.reply({ embeds: [winEmbed], components: [] });

          // Update the user's balance in the database
          await query('UPDATE users SET balance = $1 WHERE user_id = $2', [updatedBalance, message.author.id]);
        } else {
          // Player loses
          const updatedBalance = currentBalance - bet;

          const loseEmbed = new EmbedBuilder()
            .setColor(0xff0000) // Red for loss
            .setTitle('Roulette - Loss')
            .addFields(
              { name: 'Result', value: `The result is ${result}. You lose ${bet} coins.` },
              { name: 'Balance', value: `Your updated balance: ${updatedBalance} coins` }
            );

          message.reply({ embeds: [loseEmbed], components: [] });

          // Update the user's balance in the database
          await query('UPDATE users SET balance = $1 WHERE user_id = $2', [updatedBalance, message.author.id]);
        }

        collector.stop('result');
      });

      collector.on('end', async (collected, reason) => {
        if (reason === 'result') {
          // End of the game
          // You can perform additional cleanup or logging here
        }
      });
    };

    // Start the player's turn
    await playerTurn();
  },
};

