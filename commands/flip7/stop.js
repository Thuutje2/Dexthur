const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const Flip7Game = require("../../models/flip7/flip7Game");

module.exports = {
    name: 'flip7-stop',
    description: 'Stop the round',
    usage: '!flip7-stop',
    category: 'Game',
    data: new SlashCommandBuilder()
        .setName('flip7-stop')
        .setDescription('Stop je beurt en verzamel je punten bij Flip 7'),

  async execute(interactionOrMessage) {
    const isInteraction = interactionOrMessage.isCommand?.() || interactionOrMessage.commandName;
    const user = isInteraction ? interactionOrMessage.user : interactionOrMessage.author;
    const playerId = user.id;
    const game = await Flip7Game.findOne({ playerId });

    if (!game) {
      return interactionOrMessage.reply({
        content: 'Je hebt geen actief Flip 7-spel. Start er een met `/flip7-start`.',
        ephemeral: true,
      });
    }

    if (game.currentTurn !== 'player') {
      return interactionOrMessage.reply({
        content: 'Het is nu niet jouw beurt!',
        ephemeral: true,
      });
    }

    const earned = game.roundPoints;
    game.totalPoints += earned;
    game.roundPoints = 0;
    game.flippedNumbers = [];
    game.specialCards.secondChance = false;
    game.specialCards.freeze = false;
    game.currentTurn = 'ai'; // beurt gaat naar AI

    await game.save();

    const embed = new EmbedBuilder()
      .setTitle('🛑 Beurt gestopt')
      .setDescription(
        `Je hebt je beurt gestopt en **${earned} punten** toegevoegd aan je totaal.\n` +
        `🎯 Totale score: **${game.totalPoints}**\n\nDe beurt gaat nu naar de AI.`
      )
      .setColor(0x00b050);

    if (isInteraction) {
            await interactionOrMessage.reply({ embeds: [embed] });
        } else {
            await interactionOrMessage.reply({ embeds: [embed] });
        }

    // 👉 Hier kun je AI-logica aanroepen als je dat al hebt:
    // await playAiTurn(game);
  },
};
