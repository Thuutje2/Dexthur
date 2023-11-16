const { EmbedBuilder } = require('@discordjs/builders');

module.exports = {
  name: 'help',
  description: 'List all available commands.',
  execute(message, args, client) {

    const embed = new EmbedBuilder()
    .setColor(0x0099ff) // Use a number for color
    .setTitle('Command List')
    .setDescription('List of all available commands.')
    .addFields(
      { name: '🃏 Casino', value: '`Balance` \n `Slots` \n `Blackjack`', inline: true },
      { name: '💰 Economy', value: '`Adduser` \n `Daily` \n `Monthly` \n `Yearly`', inline: true },
      { name: '😙 Fun', value: '`Ping` \n `userinfo` \n `server`', inline: true},
      { name: '⚒️ Admin', value: '`clear`', inline: true }
    );
  
  message.channel.send({ embeds: [embed] });
  
  },
};








