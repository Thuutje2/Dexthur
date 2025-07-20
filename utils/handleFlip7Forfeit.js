const Flip7Game = require("../models/flip7/flip7Game");
const { EmbedBuilder } = require('discord.js');

async function handleFlip7Forfeit(message) {
    if (message.content.toLowerCase() === '!ff' || message.content.toLowerCase() === '!flip7-forfeit') {
        const playerId = message.author.id;
        const game = await Flip7Game.findOne({ playerId });
        
        if (!game) {
            return message.reply('Je hebt geen actief Flip 7-spel om op te geven.');
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

        await message.reply({ embeds: [embed] });
        return true;
    }
    return false;
}

module.exports = { handleFlip7Forfeit };