const {EmbedBuilder} = require("@discordjs/builders");
const { query } = require('../../database');

module.exports = {
    name: 'emojigame',
    description: 'Emoji game.',
    aliases: ['eg'],
    category: 'GuessEmoji',

    async execute(message, args) {
        try {
            const themesQuery = await query('SELECT name FROM themes');
            const themes = themesQuery.rows;

            const embed = new EmbedBuilder()
                .setTitle('Emoji Game Themes')
                .setDescription('Choose a theme to play the emoji game.')
                .setColor(0x0099ff)
                .setTimestamp()
                .addFields(themes.map(theme => {
                    return {
                        name: '🔹 ' + theme.name,
                        value: '\u200B',
                        inline: true
                    };
                }));

            message.channel.send({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            message.channel.send('An error occurred while fetching the themes.');
        }
    }
};
