const axios = require('axios');
const { EmbedBuilder } = require('@discordjs/builders');

module.exports = {
    name: 'killers',
    description: 'Toont een lijst van alle killers in Dead By Daylight',
    async execute(message) {
        try {
            // Maak een verzoek naar de API
            const response = await axios.get('https://dbd.tricky.lol/api/characters');
            const characters = response.data;

            // Filter alleen de killers
            const killers = Object.values(characters).filter(char => char.role === 'killer');

            // Verdeel de killers in pagina's van 10
            const pageSize = 10; // Aantal killers per pagina
            const totalKillers = killers.length;
            const pages = [];

            for (let i = 0; i < killers.length; i += pageSize) {
                // Zet de killers tussen backticks om inline code te gebruiken
                const currentPageKillers = killers.slice(i, i + pageSize).map(killer => `\`${killer.name}\``).join('\n');

                const embed = new EmbedBuilder()
                    .setTitle('🔪 Dead By Daylight Killers 🔪')
                    .setDescription(`Total killers: ${totalKillers}\n` +
                        'Here are the Dead By Daylight killers:')
                    .setColor(0xFF0000)
                    .addFields({
                        name: `Killers (Page ${Math.floor(i / pageSize) + 1} of ${Math.ceil(totalKillers / pageSize)})`,
                        value: currentPageKillers || 'Geen killers gevonden',
                    });

                pages.push(embed);
            }

            let currentPage = 0;
            const embedMessage = await message.reply({ embeds: [pages[currentPage]] });

            // Als er meer dan één pagina is, voeg navigatie-reacties toe
            if (pages.length > 1) {
                await embedMessage.react('⬅️');
                await embedMessage.react('➡️');

                const filter = (reaction, user) => {
                    return ['⬅️', '➡️'].includes(reaction.emoji.name) && !user.bot;
                };

                const collector = embedMessage.createReactionCollector({ filter, time: 60000 });

                collector.on('collect', (reaction, user) => {
                    if (reaction.emoji.name === '➡️') {
                        if (currentPage < pages.length - 1) {
                            currentPage++;
                            embedMessage.edit({ embeds: [pages[currentPage]] });
                        }
                    } else if (reaction.emoji.name === '⬅️') {
                        if (currentPage > 0) {
                            currentPage--;
                            embedMessage.edit({ embeds: [pages[currentPage]] });
                        }
                    }
                    reaction.users.remove(user.id); // Verwijder de reactie van de gebruiker om meerdere klikken mogelijk te maken
                });

                collector.on('end', () => {
                    embedMessage.reactions.removeAll(); // Verwijder de reacties na de tijdslimiet
                });
            }

        } catch (error) {
            console.error(`Error executing command "killers": ${error.message}` + '\n' + error.stack);
            message.reply('Er ging iets mis bij het ophalen van de killer gegevens.');
        }
    }
};


