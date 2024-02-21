const { ActionRowBuilder, EmbedBuilder, ButtonBuilder } = require('discord.js');
const { query } = require('../../database');

module.exports = {
    name: 'leaderboard',
    description: 'View the leaderboard for the casino.',
    aliases: ['lb'],
    category: 'Casino',
    async execute(message, args) {
        try {
            const result = await query('SELECT * FROM users ORDER BY balance DESC LIMIT 10');
            const users = result.rows;

            if (users.length === 0) {
                return message.reply('The leaderboard is currently empty.');
            }

            const leaderboardMessage = users.map((user, index) => `**#${index + 1}:** ${user.username} - ${user.balance} coins`).join('\n');

            const url = message.client.user.displayAvatarURL({ extension: "png", size: 1024 });
            const leaderboardEmbed = new EmbedBuilder()
                .setColor(0x0099ff)
                .setTitle('Casino Leaderboard')
                .setDescription('Top 10 users by balance:')
                .setAuthor({
                    name: message.author.username,
                    icon_url: url,
                })
                .setTimestamp()
                .setFooter({
                    text: 'Casino Leaderboard',
                    icon_url: message.client.user.avatarURL(),
                })
                .addFields(
                    { name: 'Users', value: leaderboardMessage }
                );

            message.channel.send({ embeds: [leaderboardEmbed], components: [] });
        } catch (error) {
            console.error('Error fetching leaderboard:', error);
            message.reply('An error occurred while fetching the leaderboard.');
        }
    }
}