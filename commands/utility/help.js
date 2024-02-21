const { ActionRowBuilder, ButtonBuilder, MessageEmbed } = require('discord.js');
const { EmbedBuilder } = require('@discordjs/builders');


module.exports = {
  name: 'help',
  description: 'List all available commands.',
  execute(message, args, client) {
    const embed = new EmbedBuilder()
      .setColor(0x0099ff)
      .setTitle('Command List')
      .setDescription('List of all available commands.')
      .addFields(
        { name: '🃏 Casino', value: '`Slots` \n `Blackjack` \n `Roulette` \n `Coinflip`', inline: true },
        { name: '💰 Economy', value: '`Adduser` \n `Balance` \n `Buy` \n `Store` \n `Inventory` \n `Give` \n `Leaderboard` \n `Work` \n `Daily` \n `Monthly` \n `Yearly`', inline: true },
        { name: '😙 Fun', value: '`Ping` \n `random` \n `userinfo` \n `server`', inline: true },
        { name: '📝 ToDo List', value: '`!Todo` Explanation for todo!', inline: true },
        { name: '⚒️ Admin', value: '`clear` \n `additem` \n `removeitem` \n `ideas` \n `addidea` \n `removeidea`', inline: true },
        {name: '🎮 Video Games Information', value: '`!steamProfile`', inline: true},
      );

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('help_casino')
          .setLabel('Casino Commands')
          .setStyle(1),
        new ButtonBuilder()
          .setCustomId('help_economy')
          .setLabel('Economy Commands')
          .setStyle(1),
        new ButtonBuilder()
          .setCustomId('help_fun')
          .setLabel('Fun Commands')
          .setStyle(1),
        new ButtonBuilder()
          .setCustomId('help_admin')
          .setLabel('Admin Commands')
          .setStyle(1),
        new ButtonBuilder()
            .setCustomId('help_videogames')
            .setLabel('Video Games Information')
            .setStyle(1),
      );

    message.channel.send({ embeds: [embed], components: [row] });
  },
};









