const { EmbedBuilder } = require('discord.js');
const survivorInformation = require('./json/DeadByDaylight.json');

module.exports = {
    name: 'survivors',
    description: 'List of all survivors',
    aliases: ['survivorList', 'survivorsList'],
    execute(message) {
        try {
            const survivors = survivorInformation.survivors.map(survivor => survivor.name).join('\n');
            const totalSurvivors = survivorInformation.survivors.length;
            const embed = new EmbedBuilder()
                .setTitle('List of all survivors')
                .setDescription(`**Total Survivors:** ${totalSurvivors}\n\n` + survivors)
                .setColor(0xf0c0e3);

            message.channel.send({ embeds: [embed] });

        } catch (error) {
            console.error('An error occurred while getting the list of survivors: ', error);
            message.channel.send('An error occurred while getting the list of survivors.');
        }
    }
}