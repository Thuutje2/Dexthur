const axios = require('axios');
const { EmbedBuilder } = require('@discordjs/builders');

module.exports = {
    name: 'survivors',
    description: 'Toont een lijst van alle survivors in Dead By Daylight',
    async execute(message) {
        try {
            // Maak een verzoek naar de API
            const response = await axios.get('https://dbd.tricky.lol/api/characters');
            const characters = response.data;

            // Filter alleen de survivors
            const survivors = Object.values(characters).filter(char => char.role === 'survivor');

            // Verdeel de survivors in pagina's van 10
            const pageSize = 10; // Aantal survivors per pagina
            const totalSurvivors = survivors.length;
            const pages = [];

            for (let i = 0; i < survivors.length; i += pageSize) {
                // Zet de survivors tussen backticks om inline code te gebruiken
                const currentPageSurvivors = survivors.slice(i, i + pageSize).map(survivor => `\`${survivor.name}\``).join('\n');

                const embed = new EmbedBuilder()
                    .setTitle('🔦 Dead By Daylight Survivors 🔦')
                    .setDescription(`Total survivors: ${totalSurvivors}\n` +
                        'Here are the Dead By Daylight survivors:')
                    .setColor(0x00FF00)
                    .addFields({
                        name: `Survivors (Page ${Math.floor(i / pageSize) + 1} of ${Math.ceil(totalSurvivors / pageSize)})`,
                        value: currentPageSurvivors || 'Geen survivors gevonden',
                    });

                pages.push(embed);
            }

            let currentPage = 0;
            const embedMessage = await message.reply({embeds: [pages[currentPage]]});

            // Als er meer dan één pagina is, voeg navigatie-reacties toe
            if (pages.length > 1) {
                await embedMessage.react('⬅️');
                await embedMessage.react('➡️');

                const filter = (reaction, user) => {
                    return ['⬅️', '➡️'].includes(reaction.emoji.name) && !user.bot;
                };

                const collector = embedMessage.createReactionCollector({filter, time: 60000});

                collector.on('collect', (reaction, user) => {
                    if (reaction.emoji.name === '➡️') {
                        if (currentPage < pages.length - 1) {
                            currentPage++;
                            embedMessage.edit({embeds: [pages[currentPage]]});
                        }
                    } else if (reaction.emoji.name === '⬅️') {
                        if (currentPage > 0) {
                            currentPage--;
                            embedMessage.edit({embeds: [pages[currentPage]]});
                        }
                    }
                    reaction.users.remove(user.id);
                });

            }
        } catch (error) {
            console.error(error);
            return message.channel.send('Er ging iets mis bij het ophalen van de survivorgegevens.');
        }
    }
};
