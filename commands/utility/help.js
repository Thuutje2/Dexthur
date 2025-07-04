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
          { name: '`Page 1`', value: '👑 Disney Guess Game Commands' },
          { name: '`Page 2`', value: '🔪 Dead By Daylight Commands' },
          { name: '`Page 3`', value: '⚒️ Admin Commands' },
          { name: '`Page 4`', value: '😙 Fun Commands' },
          { name: '`Page 5`', value: '🔧 Helping the bot' },
        ],
      },
      {
        title: '👑 Disney Guess Game Commands',
        description: 'Commands for the Disney Guess Game.',
        commands: [
          {
            name: 'Information about the game',
            value:
              'Get information about the Disney character guessing game. `!DisneyGuessGame or !dgg`',
          },
          {
            name: 'Set your favorite character',
            value: 'Set your favorite character. `!dfc <charactername>`',
          },
          {
            name: 'Set your favorite series/film',
            value: 'Set your favorite series/film. `!dfsm <series/film>`',
          },
        ],
      },
      {
        title: '🔪 Dead By Daylight Commands',
        description: 'Commands for Dead By Daylight players.',
        commands: [
          {
            name: 'Perk Information',
            value:
              'Get information about a perk. `!PerkInformation <perkname>` or `!perk`',
          },
          {
            name: 'Survivor Information',
            value:
              'Get information about a survivor. `!SurvivorInformation <survivorname>` or `!surv`',
          },
          {
            name: 'Survivors',
            value:
              'List of all survivors. `!Survivors`',
          },
          {
            name: 'Perk Quiz',
            value:
              'Answer questions about perks and survivors. `!PerkQuiz`, `!pq`',
          },
          {
            name: 'Description Quiz',
            value:
              'Answer questions about perk descriptions. `!DescriptionQuiz`, `!dq`',
          },
        ],
      },
      {
        title: '⚒️ Admin Commands',
        description: 'Commands for server administrators.',
        commands: [
          { name: 'Clear', value: 'Clear messages. `!Clear <amount>`' },
        ],
      },
      {
        title: '😙 Fun Commands',
        description: 'Fun commands to entertain yourself and others.',
        commands: [
          { name: 'Ping', value: "Check the bot's ping. `!Ping`" },
          {
            name: 'Random',
            value: 'Generate a random number between 1 and 100. `!Random`',
          },
          {
            name: 'Userinfo',
            value: 'Get information about a user. `!Userinfo <user>`',
          },
          {
            name: 'Server',
            value: 'Get information about the server. `!Server`',
          },
        ],
      },
      {
        title: '🔧 Helping the bot',
        description: 'Commands to help the bot and its developers.',
        commands: [
          {
            name: 'Idea',
            value:
              'Send an idea to the ideas chat for the developers. `!Idea <idea>`',
          },
        ],
      },
    ];

    let currentPage = 0;

    const embed = new EmbedBuilder()
      .setColor(0x0099ff)
      .setTitle(pages[currentPage].title)
      .setDescription(pages[currentPage].description);

    for (const command of pages[currentPage].commands) {
      embed.addFields({ name: command.name, value: command.value });
    }

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('previous_page')
        .setLabel('Previous')
        .setStyle(1),
      new ButtonBuilder().setCustomId('next_page').setLabel('Next').setStyle(1)
    );

    const messageComponent = await interaction.reply({
      embeds: [embed],
      components: [row],
      ephemeral: true,
    });

    const filter = (interaction) => interaction.user.id === interaction.user.id;
    const collector = messageComponent.createMessageComponentCollector({
      filter,
      time: 60000,
    });

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
      row.components.forEach((component) => {
        component.setDisabled(true);
      });
      messageComponent.edit({ components: [row] });
    });
  },
};

