const {EmbedBuilder } = require('discord.js');
const allAchievements = require('../../data/achievements');

module.exports = {
    name: 'getallachievements',
    description: 'Get a list of all achievements.',
    usage: '!getallachievements',
    async execute(message, args) {
        const embed = new EmbedBuilder()
            .setColor(0x0099ff)
            .setTitle('All Achievements')
            .setDescription('Here is a list of all achievements:')
            .addFields(
                allAchievements.map((achievement) => ({
                    name: `${achievement.emoji} ${achievement.name}`,
                    value: `\`\`\`${achievement.description}\`\`\``,
                }))
            );

        await message.reply({ embeds: [embed] });
    },
};