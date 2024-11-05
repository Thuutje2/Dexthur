const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

/**
 * Function to create paginated embeds.
 * @param {Object} message - The message object to send the embed.
 * @param {Array} items - The list of items to paginate.
 * @param {number} itemsPerPage - The number of items per page.
 * @param {string} title - The title of the embed.
 * @param {number} color - The color of the embed.
 */
async function paginate(message, items, itemsPerPage, title, color, footer) {
    let currentPage = 0;
    const totalPages = Math.ceil(items.length / itemsPerPage);

    const getPageEmbed = (page) => {
        const start = page * itemsPerPage;
        const pageItems = items.slice(start, start + itemsPerPage).join('\n');
        return new EmbedBuilder()
            .setTitle(title)
            .setDescription(`**Page ${page + 1} of ${totalPages}**\n\n${pageItems}`)
            .setColor(color)
            .setFooter({ text: footer });
    };

    const embedMessage = await message.channel.send({ embeds: [getPageEmbed(currentPage)] });

    if (totalPages > 1) {
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('previous')
                    .setLabel('◀️')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(currentPage === 0),
                new ButtonBuilder()
                    .setCustomId('next')
                    .setLabel('▶️')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(currentPage === totalPages - 1)
            );

        await embedMessage.edit({ components: [row] });

        const filter = (interaction) => ['previous', 'next'].includes(interaction.customId) && interaction.user.id === message.author.id;
        const collector = embedMessage.createMessageComponentCollector({ filter, time: 60000 });

        collector.on('collect', async (interaction) => {
            if (interaction.customId === 'previous' && currentPage > 0) currentPage--;
            else if (interaction.customId === 'next' && currentPage < totalPages - 1) currentPage++;

            await interaction.update({
                embeds: [getPageEmbed(currentPage)],
                components: [
                    new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId('previous')
                                .setLabel('◀️')
                                .setStyle(ButtonStyle.Primary)
                                .setDisabled(currentPage === 0),
                            new ButtonBuilder()
                                .setCustomId('next')
                                .setLabel('▶️')
                                .setStyle(ButtonStyle.Primary)
                                .setDisabled(currentPage === totalPages - 1)
                        ),
                ],
            });
        });

        collector.on('end', () => {
            embedMessage.edit({ components: [] });
        });
    }
}

module.exports = paginate;
