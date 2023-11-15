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
      { name: 'Admin', value: '`nickname`', inline: true },
      { name: 'Casino', value: '`Balance` \n `Slots` \n `Daily` \n `Monthly` \n `Yearly`', inline: true },
      { name: 'Fun', value: '`Ping` \n `userinfo` \n `server`', inline: true},
      { name: 'Help', value: '`Help`', inline: true}
    );
  
  message.channel.send({ embeds: [embed] });
  
  },
};








