const axios = require('axios');
const { EmbedBuilder } = require('discord.js'); // Zorg ervoor dat je EmbedBuilder correct importeert

module.exports = {
    name: 'playerstats',
    description: 'Get player stats for a specific Steam user.',
    async execute(message, args) {
        // Controleer of Steam ID is opgegeven
        if (args.length < 1) {
            return message.reply('Please provide a Steam ID in the format `76561198316241956`.');
        }

        const steamId = args[0]; // Het eerste argument moet de Steam ID zijn
        const apiUrl = `https://dbd.tricky.lol/api/playerstats?steamid=${steamId}`;

        try {
            const response = await axios.get(apiUrl);
            const playerStats = response.data;

            // Controleer of de spelersstatistieken geldig zijn
            if (!playerStats) {
                return message.reply('No player stats found. Please check the Steam ID or privacy settings.');
            }

            // Maak een embedbericht voor de spelersstatistieken
            const embed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle(`Player Stats for Steam ID: ${steamId}`)
                .addFields(
                    { name: 'Bloodpoints', value: playerStats.bloodpoints?.toString() || 'N/A', inline: true },
                    { name: 'Survivor Rank', value: playerStats.survivor_rank?.toString() || 'N/A', inline: true },
                    { name: 'Successful Escapes', value: playerStats.escaped?.toString() || 'N/A', inline: true },
                    { name: 'Generators Repaired', value: playerStats.gensrepaired?.toString() || 'N/A', inline: true },
                    { name: 'Skill Checks', value: playerStats.skillchecks?.toString() || 'N/A', inline: true }
                    // Voeg meer velden toe indien nodig
                )
                .setTimestamp();

            // Stuur het embedbericht naar het kanaal
            await message.channel.send({ embeds: [embed] });
        } catch (error) {
            console.error('Error fetching player stats:', error);
            await message.reply('Could not retrieve player stats. Please check the Steam ID or privacy settings.');
        }
    },
};


