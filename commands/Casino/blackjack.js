const { ActionRowBuilder, ButtonBuilder } = require('discord.js');

module.exports = {
  name: 'blackjack',
  description: 'Play a game of blackjack.',
  category: 'Casino',
  async execute(message, args, userData) {
    const betAmount = parseInt(args[0]) || 1;
    if (userData.balance < betAmount) {
      return message.reply("You don't have enough coins to place that bet.");
    }

    const suits = ['Hearts', 'Diamonds', 'Clubs', 'Spades'];
    const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

    let deck = [];

    function drawCard() {
      const card = deck.pop();
      if (!card) {
        deck = shuffleDeck();
        return drawCard();
      }
      return card;
    }

    function shuffleDeck() {
      const shuffledDeck = [];
      for (const suit of suits) {
        for (const rank of ranks) {
          shuffledDeck.push(`${rank} of ${suit}`);
        }
      }
      for (let i = shuffledDeck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledDeck[i], shuffledDeck[j]] = [shuffledDeck[j], shuffledDeck[i]];
      }
      return shuffledDeck;
    }

    let playerHand = [drawCard(), drawCard()];
    let dealerHand = [drawCard(), drawCard()];

    const playerHandString = `**Your hand:** ${playerHand.join(', ')}`;
    const dealerHandString = `**Dealer's hand:** Face-up card: ${dealerHand[0]}, Hidden card`;
    await message.reply(`${playerHandString}\n${dealerHandString}`);


    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('hit')
          .setLabel('Hit')
          .setStyle(1), // PRIMARY-stijl
        new ButtonBuilder()
          .setCustomId('stand')
          .setLabel('Stand')
          .setStyle(2) // SECONDARY-stijl
      );

    try {
      const reply = await message.reply({ content: 'Do you want to hit or stand?', components: [row] });

      const filter = (interaction) => interaction.customId === 'hit' || interaction.customId === 'stand';
      const collector = reply.createMessageComponentCollector({ filter, time: 15000 });

      collector.on('collect', async (interaction) => {
        if (interaction.customId === 'hit') {
          await handleHit(reply);
        } else if (interaction.customId === 'stand') {
          await handleStand(reply);
          collector.stop(); // Stop de collector na de 'stand'-actie
        }
      });

      collector.on('end', (collected) => {
        if (collected.size === 0) {
          message.channel.send('Time is up. The game has ended.');
        }
      });
    } catch (error) {
      console.error('Error sending message with buttons:', error);
    }

    // Functie om de waarde van een hand te berekenen
    function calculateHandValue(hand) {
      let value = 0;
      let hasAce = false;

      for (const card of hand) {
        const rank = card.split(' ')[0];

        if (rank === 'A') {
          hasAce = true;
          value += 11;
        } else if (['K', 'Q', 'J'].includes(rank)) {
          value += 10;
        } else {
          value += parseInt(rank);
        }
      }

      if (hasAce && value > 21) {
        value -= 10;
      }

      return value;
    }

    // Logica voor de 'hit' knop
    async function handleHit(reply) {
      const newCard = drawCard();
      playerHand.push(newCard);
      const playerHandString = playerHand.join(', ');

      reply.channel.send(`You drew a new card: ${newCard}\nYour hand: ${playerHandString}`);

      if (calculateHandValue(playerHand) > 21) {
        reply.channel.send('Bust! Your hand value is over 21. You lose.');
        return;
      }

      const row = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('hit')
            .setLabel('Hit')
            .setStyle(1),
          new ButtonBuilder()
            .setCustomId('stand')
            .setLabel('Stand')
            .setStyle(2)
        );

      reply.edit({ content: 'Do you want to hit or stand?', components: [row] });
    }

    // Logica voor de 'stand' knop
    async function handleStand(reply) {
      while (calculateHandValue(dealerHand) < 17) {
        const newCard = drawCard();
        dealerHand.push(newCard);
      }

      const playerHandString = playerHand.join(', ');
      const dealerHandString = dealerHand.join(', ');

      reply.channel.send(`Your hand: ${playerHandString}\nDealer's hand: ${dealerHandString}`);

      const winner = determineWinner(playerHand, dealerHand);

      if (winner === 'player') {
        const winnings = betAmount * 2;
        userData.balance += winnings;
        message.channel.send(`Congratulations! You win ${winnings} coins!`);
      } else if (winner === 'dealer') {
        userData.balance -= betAmount; // Verlies de inzet
        message.channel.send(`Sorry, you lose ${betAmount} coins. Better luck next time.`);
      } else {
        userData.balance += betAmount; // Teruggave van de inzet bij een gelijkspel
        message.channel.send(`It's a tie! The game is a draw. Your ${betAmount} coins are returned.`);
      }

      reply.edit({ components: [] }); // Verwijder de knoppen na het einde van het spel
    }

    // Functie om de winnaar van het spel te bepalen
    function determineWinner(playerHand, dealerHand) {
      const playerValue = calculateHandValue(playerHand);
      const dealerValue = calculateHandValue(dealerHand);

      if (playerValue > 21) {
        return 'dealer';
      } else if (dealerValue > 21) {
        return 'player';
      } else if (playerValue > dealerValue) {
        return 'player';
      } else if (dealerValue > playerValue) {
        return 'dealer';
      } else {
        return 'tie';
      }
    }
  },
};




