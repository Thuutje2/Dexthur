const { EmbedBuilder } = require('discord.js');
const survivorInformation = require('./json/DeadByDaylight.json');

module.exports = {
  name: 'killers',
  description: 'List of all survivors',
  aliases: ['killerList', 'killersList'],
  execute(message) {
    try {
      const killers = survivorInformation.killers
        .map((killer) => killer.name)
        .join('\n');
      const embed = new EmbedBuilder()
        .setTitle('List of all killers')
        .setDescription(killers)
        .setColor(0xf0c0e3);

      message.channel.send({ embeds: [embed] });
    } catch (error) {
      console.error(
        'An error occurred while getting the list of survivors: ',
        error
      );
      message.channel.send(
        'An error occurred while getting the list of survivors.'
      );
    }
  },
};
