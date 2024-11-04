const { EmbedBuilder } = require('discord.js');
const survivorInformation = require('./json/DeadByDaylight.json');
const paginate = require('./pagination');

module.exports = {
    name: 'survivors',
    description: 'List of all survivors',
    aliases: ['survivorList', 'survivorsList'],
    execute(message) {
        try {
            const survivors = survivorInformation.survivors.map(survivor => survivor.name);
            paginate(message, survivors, 10, '🔦 Dead By Daylight Survivors 🔦', 0x98fb98);
        } catch (error) {
            console.error('An error occurred while getting the list of survivors: ', error);
            message.channel.send('An error occurred while getting the list of survivors.');
        }
    }
};
