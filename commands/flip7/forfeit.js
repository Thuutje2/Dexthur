const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const Flip7Game = require("../../models/flip7/flip7Game");

module.exports = {
    name: 'flip7-forfeit',
    description: 'Forfeit your entire Flip 7 game',
    usage: '!flip7-forfeit or !ff',
    category: 'Game',
    data: new SlashCommandBuilder()
        .setName('flip7-forfeit')
        .setDescription('Geef je hele Flip 7-spel op en verwijder het'),

    async execute(interactionOrMessage) {
        const isInteraction = interactionOrMessage.isCommand?.() || interactionOrMessage.commandName;
        const user = isInteraction ? interactionOrMessage.user : interactionOrMessage.author;
        const playerId = user.id;

        const game = await Flip7Game.findOne({ playerId });
        if (!game) {
            const content = 'Je hebt geen actief Flip 7-spel om op te geven.';
            if (isInteraction) {
                return interactionOrMessage.reply({
                    content,
                    ephemeral: true,
                });
            } else {
                return interactionOrMessage.reply(content);
            }
        }

        // Save final score for the embed
        const finalScore = game.totalPoints;
        const roundScore = game.roundPoints;

        // Delete the game
        await Flip7Game.deleteOne({ playerId });

        const embed = new EmbedBuilder()
            .setTitle('🏳️ Flip 7 Spel Opgegeven')
            .setDescription(
                `Je hebt je Flip 7-spel opgegeven.\n\n` +
                `📊 **Eindresultaten:**\n` +
                `🎯 Totale score: **${finalScore}** punten\n` +
                `🔄 Huidige ronde: **${roundScore}** punten\n\n` +
                `Start een nieuw spel met \`/flip7-start\` wanneer je klaar bent!`
            )
            .setColor(0xff6b6b)
            .setFooter({ text: 'Bedankt voor het spelen!' });

        if (isInteraction) {
            await interactionOrMessage.reply({ embeds: [embed] });
        } else {
            await interactionOrMessage.reply({ embeds: [embed] });
        }
    },
};