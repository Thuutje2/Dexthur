const { Client } = require('discord.js');
const { EmbedBuilder } = require('@discordjs/builders');
const { ActionRowBuilder, ButtonBuilder } = require('discord.js');

module.exports = {
  name: 'help',
  description: 'List all available commands.',
  async execute(interaction, args, client) {
    const pages = [
      {
        title: 'Pages in this help menu',
        description: 'Use the buttons below to navigate through the help menu.',
        commands: [
            { name: '`Page 1`', value: '🎲 Casino Commands' },
            { name: '`Page 2`', value: '💰 Economy Commands' },
            { name: '`Page 3`', value: '😙 Fun Commands' },
            { name: '`Page 4`', value: '📝 ToDo List Commands' },
            { name: '`Page 5`', value: '⚒️ Admin Commands' },
            { name: '`Page 6`', value: '🎮 Video Games Information Commands' }
        ]
      },
      {
        title: '🃏 Casino Commands',
        description: 'Play casino games and earn coins.',
        commands: [
          { name: '`Slots`', value: 'Play the slots. `!Slots <bet>`' },
          { name: '`Blackjack`', value: 'Play a game of blackjack. `!Blackjack <bet>`' },
          { name: '`Roulette`', value: 'Play a game of roulette. `!Roulette <bet>`' },
          { name: '`Coinflip`', value: 'Flip a coin and bet on the outcome. `!Coinflip <bet> <heads/tails>`' }
        ]
      },
      {
        title: '💰 Economy Commands',
        description: 'Manage your economy and earn coins.',
        commands: [
          { name: '`Adduser`', value: 'Add a user to the database. `!Adduser`' },
          { name: '`Balance`', value: 'Check your balance. `!Balance`' },
          { name: '`Buy`', value: 'Buy an item or role from the store. `!Buy <item_name>`' },
          { name: '`Store`', value: 'View items available in the store. `!Store`' },
          { name: '`Inventory`', value: 'View your inventory. `!Inventory`' },
          { name: '`Give`', value: 'Give money to another user. `!Give <user> <amount>`' },
          { name: '`Leaderboard`', value: 'View the leaderboard. `!Leaderboard`' },
          { name: '`Work`', value: 'Work and earn money. `!Work`'},
          { name: '`Daily`', value: 'Claim your daily reward. `!Daily`' },
          { name: '`Monthly`', value: 'Claim your monthly reward. `!Monthly`' },
          { name: '`Yearly`', value: 'Claim your yearly reward. `!Yearly`' }
        ]
      },
      {
        title: '😙 Fun Commands',
        description: 'Fun commands to entertain yourself and others.',
        commands: [
          { name: '`Ping`', value: 'Check the bot\'s ping. `!Ping`' },
          { name: '`Random`', value: 'Generate a random number between 1 and 100. `!Random`' },
          { name: '`Userinfo`', value: 'Get information about a user. `!Userinfo <user>`' },
          { name: '`Server`', value: 'Get information about the server. `!Server`' }
        ]
      },
      {
        title: '📝 ToDo List Commands',
        description: 'Manage your todo list.',
        commands: [
          { name: 'Add Todo', value: '`!todo add <description>`' },
          { name: 'List Todos', value: '`!todo list`' },
          { name: 'Check Off Todo', value: '`!todo check <number>`' },
          { name: 'Remove Todo', value: '`!todo remove <number>`' }
        ]
      },
      {
        title: '⚒️ Admin Commands',
        description: 'Commands for server administrators.',
        commands: [
          { name: '`Clear`', value: 'Clear messages. `!Clear <amount>`' },
          { name: '`Additem`', value: 'Add an item to the store. `!Additem <item_name> <price>`' },
          { name: '`Removeitem`', value: 'Remove an item from the store. `!Removeitem <item_name>`' },
          { name: '`Ideas`', value: 'View the ideas list. `!Ideas`' },
          { name: '`Addidea`', value: 'Add an idea to the ideas list. `!Addidea <idea>`' },
          { name: '`Removeidea`', value: 'Remove an idea from the ideas list. `!Removeidea <idea_number>`' }
        ]
      },
      {
        title: '🎮 Video Games Information Commands',
        description: 'Get information about video games.',
        commands: [
          { name: '`SteamProfile`', value: 'Get information about a Steam user. `!SteamProfile <steam_id>`' },
        ]
      }
    ];

    let currentPage = 0;

    const embed = new EmbedBuilder()
        .setColor(0x0099ff)
        .setTitle(pages[currentPage].title)
        .setDescription(pages[currentPage].description);

    for (const command of pages[currentPage].commands) {
      embed.addFields({ name: command.name, value: command.value });
    }

    const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('previous_page')
                .setLabel('Previous')
                .setStyle(1),
            new ButtonBuilder()
                .setCustomId('next_page')
                .setLabel('Next')
                .setStyle(1)
        );


    const messageComponent = await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });

    const filter = (interaction) => interaction.user.id === interaction.user.id;
    const collector = messageComponent.createMessageComponentCollector({ filter, time: 60000 });

    collector.on('collect', async (interaction) => {
      if (interaction.customId === 'previous_page') {
        currentPage = (currentPage - 1 + pages.length) % pages.length;
      } else if (interaction.customId === 'next_page') {
        currentPage = (currentPage + 1) % pages.length;
      }

      const newEmbed = new EmbedBuilder()
          .setColor(0x0099ff)
          .setTitle(pages[currentPage].title)
          .setDescription(pages[currentPage].description);

      for (const command of pages[currentPage].commands) {
        newEmbed.addFields({ name: command.name, value: command.value });
      }

      await interaction.update({ embeds: [newEmbed] });
    });

    collector.on('end', () => {
      row.components.forEach(component => {
        component.setDisabled(true);
      });
      messageComponent.edit({ components: [row] });
    });
  },
};











