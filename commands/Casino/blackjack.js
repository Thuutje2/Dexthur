const { ActionRowBuilder, EmbedBuilder, ButtonBuilder } = require('@discordjs/builders');
const { query } = require('../../database');

module.exports = {
  name: 'blackjack',
  description: 'Play a game of blackjack.',
  aliases: ['bj'],
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

    // Check if the user has a valid balance to play blackjack
    if (currentBalance < bet) {
      return message.reply('You don\'t have enough coins to place that bet.');
    }

    // Set up the blackjack game
    const playerHand = [];
    const dealerHand = [];

    // Function to calculate the value of a hand
    const calculateHandValue = (hand) => {
      let value = 0;
      let hasAce = false;

      for (const card of hand) {
        const cardValue = card === 'A' ? 11 : isNaN(card) ? 10 : parseInt(card);
        value += cardValue;

        if (card === 'A') {
          hasAce = true;
        }
      }

      // Adjust the value if there's an Ace and the total value is greater than 21
      if (hasAce && value > 21) {
        value -= 10;
      }

      return value;
    };

    // Function to deal a random card
    const dealCard = () => {
      const cards = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
      return cards[Math.floor(Math.random() * cards.length)];
    };

    // Deal initial cards
    playerHand.push(dealCard(), dealCard());
    dealerHand.push(dealCard(), dealCard());

    // Set up buttons for the player's turn
    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('hit')
          .setLabel('Hit')
          .setStyle(1), // Numeric value for PRIMARY
        new ButtonBuilder()
          .setCustomId('stand')
          .setLabel('Stand')
          .setStyle(2) // Numeric value for SECONDARY
      );

    const initialEmbed = new EmbedBuilder()
      .setColor(0x0099ff) // Set color
      .setTitle('Blackjack')
      .addFields(
        { name: 'Your Hand', value: `${playerHand.join(', ')} (Value: ${calculateHandValue(playerHand)})` },
        { name: 'Dealer\'s Hand', value: `${dealerHand[0]} and ?` },
        { name: 'Balance', value: `Your Balance: ${currentBalance} coins` },
        { name: 'Current Bet', value: `Current Bet: ${bet} coins` }
      )
      .setDescription('Choose whether to hit or stand.');

    const initialMessage = await message.reply({ embeds: [initialEmbed], components: [row] });

    // Function to handle the player's turn
    const playerTurn = async () => {
      const filter = (interaction) => interaction.user.id === message.author.id;
      const collector = initialMessage.createMessageComponentCollector({ filter, time: 60000 });

      collector.on('collect', async (interaction) => {
        if (interaction.customId === 'hit') {
          // Deal a new card to the player
          playerHand.push(dealCard());

          // Check if the player busted
          if (calculateHandValue(playerHand) > 21) {
            collector.stop('bust');
          }

          // Update the embed with the new hand
          const updatedEmbed = new EmbedBuilder()
            .setColor(0x0099ff)
            .setTitle('Blackjack')
            .addFields(
              { name: 'Your Hand', value: `${playerHand.join(', ')} (Value: ${calculateHandValue(playerHand)})` },
              { name: 'Dealer\'s Hand', value: `${dealerHand[0]} and ?` },
              { name: 'Balance', value: `Your Balance: ${currentBalance} coins` },
              { name: 'Current Bet', value: `Current Bet: ${bet} coins` }
            )
            .setDescription('Choose whether to hit or stand.');

          await interaction.update({ embeds: [updatedEmbed], components: [row] });
        } else if (interaction.customId === 'stand') {
          collector.stop('stand');
        }
      });

      // ...

collector.on('end', async (collected, reason) => {
  if (reason === 'bust' || reason === 'stand') {
    // Player busted or stood, or the dealer wins
    const bustEmbed = new EmbedBuilder()
      .setColor(0xff0000)
      .setTitle('Blackjack - Bust')
      .addFields(
        { name: 'Your Hand', value: `${playerHand.join(', ')} (Value: ${calculateHandValue(playerHand)})` },
        { name: 'Dealer\'s Hand', value: `${dealerHand.join(', ')} (Value: ${calculateHandValue(dealerHand)})` },
      );

    // Deduct the bet from the balance if the dealer wins
    const updatedBalance = currentBalance - bet;

    if (reason === 'bust') {
      message.reply({ embeds: [bustEmbed], components: [] });
    } else if (reason === 'stand') {
      // Player stood, now it's the dealer's turn
      await dealerTurn(bet);
    }

    // Update the user's balance in the database
    await query('UPDATE users SET balance = $1 WHERE user_id = $2', [updatedBalance, message.author.id]);
  }
});

    };

    // Function to handle the dealer's turn
    const dealerTurn = async (bet) => {
      // Deal cards to the dealer until they reach a hand value of 17 or higher
      while (calculateHandValue(dealerHand) < 17) {
        dealerHand.push(dealCard());
      }

      // Determine the winner
      const playerValue = calculateHandValue(playerHand);
      const dealerValue = calculateHandValue(dealerHand);

      let resultMessage;
      let betMultiplier = 2; // Default multiplier for a win

      if (playerValue > 21 || (dealerValue <= 21 && dealerValue >= playerValue)) {
        // Dealer wins or player busts
        resultMessage = 'Dealer wins.';
        betMultiplier = 0; // Player loses the bet
      } else {
        // Player wins
        resultMessage = 'You win!';
      }

      // Update the embed with the final hands and result
      const resultEmbed = new EmbedBuilder()
        .setColor(0x0099ff)
        .setTitle('Blackjack - Results')
        .addFields(
          { name: 'Your Hand', value: `${playerHand.join(', ')} (Value: ${calculateHandValue(playerHand)})` },
          { name: 'Dealer\'s Hand', value: `${dealerHand.join(', ')} (Value: ${calculateHandValue(dealerHand)})` },
          { name: 'Result', value: resultMessage },
          { name: 'Balance', value: `Your Balance: ${currentBalance + bet * betMultiplier} coins` },
          { name: 'Current Bet', value: `Current Bet: ${bet} coins` }
        );

      message.reply({ embeds: [resultEmbed], components: [] });

      // Update the user's balance in the database
      await query('UPDATE users SET balance = $1 WHERE user_id = $2', [currentBalance + bet * betMultiplier, message.author.id]);
    };

    // Start the player's turn
    await playerTurn();
  },
};








