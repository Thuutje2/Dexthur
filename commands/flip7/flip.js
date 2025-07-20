const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const Flip7Game = require("../../models/flip7/flip7Game");

module.exports = {
    name: 'flip7-flip',
    description: 'Flip a card in the Flip 7 game',
    usage: '!flip7-flip',
    category: 'Game',
    data: new SlashCommandBuilder()
        .setName('flip7-flip')
        .setDescription('Draai een kaart om in je Flip 7 spel'),

    async execute(interactionOrMessage){
        const isInteraction = interactionOrMessage.isCommand?.() || interactionOrMessage.commandName;
        const user = isInteraction ? interactionOrMessage.user : interactionOrMessage.author;
        const playerId = user.id;

        const game = await Flip7Game.findOne({ playerId });
        if (!game) {
            const content = 'Je hebt geen lopend spel. Start er een met `/flip7-start`.';
            if (isInteraction) {
                return interactionOrMessage.reply({
                    content,
                    ephemeral: true,
                });
            } else {
                return interactionOrMessage.reply(content);
            }
        }

        if (game.currentTurn !== 'player') {
            const content = 'Het is nu niet jouw beurt!';
            if (isInteraction) {
                return interactionOrMessage.reply({
                    content,
                    ephemeral: true,
                });
            } else {
                return interactionOrMessage.reply(content);
            }
        }

        if (game.deck.length === 0) {
            const content = 'Het deck is leeg! Start een nieuw spel met `/flip7-start`.';
            if (isInteraction) {
                return interactionOrMessage.reply({
                    content,
                    ephemeral: true,
                });
            } else {
                return interactionOrMessage.reply(content);
            }
        }

        const card = game.deck.shift(); // trek bovenste kaart

        let resultText = '';
        let busted = false;
        let flip7Achieved = false;

        if (card.type === 'number') {
            const alreadyFlipped = game.flippedNumbers.includes(card.value);

            if (alreadyFlipped) {
                if (game.specialCards.secondChance) {
                    game.specialCards.secondChance = false;
                    resultText += `⚠️ Je draaide **${card.value}**, maar gebruikte je Tweede Kans om door te mogen!`;
                } else {
                    busted = true;
                    resultText += `💥 Oeps! Je draaide **${card.value}** opnieuw. Je verliest alle punten van deze ronde.`;
                    game.roundPoints = 0;
                    game.flippedNumbers = [];
                    game.currentTurn = 'ai'; // wissel beurt
                }
            } else {
                game.flippedNumbers.push(card.value);
                game.roundPoints += 10;
                resultText += `✅ Je draaide **${card.value}**. +10 punten!`;
                if (game.flippedNumbers.length === 7) {
                    flip7Achieved = true;
                    game.roundPoints += 50;
                    resultText += ` 🎉 Flip 7 behaald! +50 bonuspunten!`;
                    game.totalPoints += game.roundPoints;
                    game.roundPoints = 0;
                    game.flippedNumbers = [];
                    game.currentTurn = 'ai';
                }
            }
        } else {
            // special cards
            if (card.type === 'secondChance') {
                game.specialCards.secondChance = true;
                resultText += `🛡️ Je vond een **Tweede Kans** kaart! Je bent 1x beschermd tegen een fout.`;
            } else if (card.type === 'freeze') {
                game.aiState.frozen = true;
                resultText += `❄️ Je vond een **Freeze** kaart! De AI wordt volgende ronde bevroren.`;
            } else if (card.type === 'flipThree') {
                resultText += `🔁 Je vond een **Flip Three** kaart! Je moet nu nog 2 kaarten omdraaien.`;
                // Hier kan je uitbreiden met auto-flip logica als je dat wil
            } else if (card.type === 'bonus') {
                game.roundPoints += 20;
                resultText += `💎 Je vond een **Bonuskaart**! +20 punten!`;
            }
        }

        await game.save();

        const embed = new EmbedBuilder()
            .setTitle('🎴 Kaart omgedraaid!')
            .setDescription(resultText)
            .addFields(
                { name: 'Huidige rondepunten', value: `${game.roundPoints}`, inline: true },
                { name: 'Totale score', value: `${game.totalPoints}`, inline: true },
                { name: 'Gedraaide kaarten', value: game.flippedNumbers.join(', ') || 'Geen', inline: false }
            )
            .setColor(busted ? 0xff0000 : 0x00bfff);

        if (isInteraction) {
            await interactionOrMessage.reply({ embeds: [embed] });
        } else {
            await interactionOrMessage.reply({ embeds: [embed] });
        }

        // Hier kan je AI-actie automatisch triggeren als game.currentTurn nu "ai" is
        // bijvoorbeeld met een aparte functie `playAiTurn(game)`
    },
}