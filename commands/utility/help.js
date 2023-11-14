const { EmbedBuilder } = require('@discordjs/builders');

module.exports = {
  name: 'help',
  description: 'List all available commands.',
  execute(message, args, client) {

    const embed = new EmbedBuilder()
    .setColor(0x0099ff) // Use a number for color
    .setTitle('Command List')
    .setDescription('List of all available commands categorized by folders.')
    .addFields(
      { name: 'Admin', value: 'Command \n Command 2', inline: true },
      { name: 'Casino', value: 'Balance \n Slots \n Daily', inline: true },
      { name: 'Fun', value: 'Ping', inline: true},
      { name: 'Help', value: 'Help', inline: true}
    );
  
  message.channel.send({ embeds: [embed] });
  
  },
};








