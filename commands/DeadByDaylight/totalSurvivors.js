const { EmbedBuilder } = require('discord.js');
const survivorInformation = require('./json/DeadByDaylight.json');

module.exports = {
    name: 'totalSurvivors',
    description: 'Total number of survivors',
    aliases: ['totalSurvs'],
    execute(message) {
        try {
            const totalSurvivors = survivorInformation.survivors.length;
            const embed = new EmbedBuilder()
                .setTitle('Total number of survivors')
                .setDescription(`There are ${totalSurvivors} survivors in Dead by Daylight.`)
                .setColor(0xf0c0e3);
            message.channel.send({ embeds: [embed] });
        } catch (error) {
            console.error('An error occurred while getting the total number of survivors: ', error);
            message.channel.send('An error occurred while getting the total number of survivors.');
        }
    }
};