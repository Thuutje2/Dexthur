const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const Flip7Game = require("../../models/flip7/flip7Game");
const generateDeck = require("../../utils/generateDeck");

module.exports = {
    name: 'flip7-start',
    description: 'Start the flip7 game',
    usage: '!flip7-start',
    category: 'Game',
    data: new SlashCommandBuilder()
        .setName('flip7-start')
        .setDescription('Start een nieuw Flip 7-spel tegen de AI'),

    async execute(interactionOrMessage) {
        // Handle both interaction and message contexts
        const isInteraction = interactionOrMessage.isCommand?.() || interactionOrMessage.commandName;
        const user = isInteraction ? interactionOrMessage.user : interactionOrMessage.author;
        const playerId = user.id;

        const existingGame = await Flip7Game.findOne({ playerId });
        if (existingGame) {
            const content = 'Je hebt al een lopend spel! Gebruik `!flip7-stop` om het te beëindigen.';
            
            if (isInteraction) {
                return interactionOrMessage.reply({
                    content,
                    ephemeral: true,
                });
            } else {
                return interactionOrMessage.reply(content);
            }
        }

        // Maak een nieuw spel aan
        const newGame = new Flip7Game({
            playerId,
            totalPoints: 0,
            roundPoints: 0,
            flippedNumbers: [],
            specialCards: { secondChance: false, freeze: false },
            deck: generateDeck(),
            currentTurn: 'player',
            aiState: {
                roundPoints: 0,
                flippedNumbers: [],
                specialCards: { secondChance: false },
            },
        });

        await newGame.save();

        // Verstuur embed met uitleg
        const embed = new EmbedBuilder()
            .setTitle('🃏 Flip 7 is begonnen!')
            .setDescription(
                `Je speelt tegen de AI.\n\n🎯 **Doel**: Scoor zoveel mogelijk punten door kaarten om te draaien zonder dubbele waardes.\n` +
                `❗ **Let op**: Als je een kaart omdraait die je al hebt gehad, verlies je de punten van deze ronde.\n\n` +
                `📍 Gebruik \`/flip7-flip\` om te starten met draaien.\n` +
                `🛑 Gebruik \`/flip7-stop\` om je beurt te beëindigen.\n` +
                `🏳️ Gebruik \`!ff\` of \`/flip7-forfeit\` om het hele spel op te geven.`
            )
            .setColor(0x2b88d8);

        if (isInteraction) {
            await interactionOrMessage.reply({ embeds: [embed] });
        } else {
            await interactionOrMessage.reply({ embeds: [embed] });
        }
    }
}