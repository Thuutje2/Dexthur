const { Client } = require('discord.js');
const { EmbedBuilder } = require('@discordjs/builders');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

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
          { name: '`Page 5`', value: '🎖️ Levels/Achievements Commands' },
          { name: '`Page 6`', value: '🔧 Helping the bot' },
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
            name: 'Information about the game',
            value:
              'Get information about the Dead by Daylight Quizzes game. `!dbdqg`',
          },
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
        title: '🎖️ Levels/Achievements Commands',
        description: 'Commands related to levels and achievements.',
        commands: [
          { name: 'Achievements', value: "View your achievements `!Achievements`" },
          {
            name: 'Get all achievements',
            value: 'Get a list of all achievements. `!getallachievements`',
          },
          {
            name: 'Leaderboard',
            value: 'Display the server\'s XP leaderboard. `!Leaderboard`',
          },
          {
            name: 'Level',
            value: 'Get information about your level. `!Level`',
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
    
    // Handle both interaction and message contexts
    const isInteraction = interaction.isCommand?.() || interaction.commandName || interaction.customId !== undefined;
    const user = isInteraction ? interaction.user : interaction.author;
    const userId = user?.id;
    
    if (!userId) {
      const errorMessage = 'Unable to identify user.';
      if (isInteraction) {
        return interaction.reply({ content: errorMessage, ephemeral: true });
      } else {
        return interaction.reply(errorMessage);
      }
    }

    // Create embed function
    const createEmbed = (page) => {
      const embed = new EmbedBuilder()
        .setColor(0x0099ff)
        .setTitle(pages[page].title)
        .setDescription(pages[page].description)
        .setFooter({
          text: `Page ${page + 1} of ${pages.length}`,
          iconURL: user.displayAvatarURL()
        })
        .setTimestamp();

      for (const command of pages[page].commands) {
        embed.addFields({ name: command.name, value: command.value });
      }

      return embed;
    };

    // Create buttons function
    const createButtons = (page) => {
      // Navigation row
      const navigationRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('help_previous')
          .setLabel('◀ Previous')
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(page === 0),
        new ButtonBuilder()
          .setCustomId('help_home')
          .setLabel('🏠 Home')
          .setStyle(ButtonStyle.Primary)
          .setDisabled(page === 0),
        new ButtonBuilder()
          .setCustomId('help_next')
          .setLabel('Next ▶')
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(page === pages.length - 1)
      );

      // Quick navigation row 1 (max 5 buttons)
      const quickNavRow1 = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('help_disney')
          .setLabel('👑 Disney')
          .setStyle(page === 1 ? ButtonStyle.Success : ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId('help_dbd')
          .setLabel('🔪 DBD')
          .setStyle(page === 2 ? ButtonStyle.Success : ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId('help_admin')
          .setLabel('⚒️ Admin')
          .setStyle(page === 3 ? ButtonStyle.Success : ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId('help_fun')
          .setLabel('😙 Fun')
          .setStyle(page === 4 ? ButtonStyle.Success : ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId('help_achievements')
          .setLabel('🏆 Levels & Achievements')
          .setStyle(page === 5 ? ButtonStyle.Success : ButtonStyle.Secondary)
      );

      // Quick navigation row 2 (remaining buttons)
      const quickNavRow2 = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('help_bot')
          .setLabel('🔧 Bot Help')
          .setStyle(page === 6 ? ButtonStyle.Success : ButtonStyle.Secondary)
      );

      return [navigationRow, quickNavRow1, quickNavRow2];
    };

    // Initial response
    const initialEmbed = createEmbed(currentPage);
    const initialButtons = createButtons(currentPage);

    let messageComponent;
    if (isInteraction) {
      messageComponent = await interaction.reply({
        embeds: [initialEmbed],
        components: initialButtons,
        ephemeral: true,
      });
    } else {
      messageComponent = await interaction.reply({
        embeds: [initialEmbed],
        components: initialButtons,
      });
    }

    // Button collector with fixed filter
    const filter = (i) => {
      return i.user && i.user.id === userId;
    };
    
    const collector = messageComponent.createMessageComponentCollector({
      filter,
      time: 300000, // 5 minutes
    });

    collector.on('collect', async (buttonInteraction) => {
      // Handle navigation buttons
      if (buttonInteraction.customId === 'help_previous') {
        currentPage = Math.max(0, currentPage - 1);
      } else if (buttonInteraction.customId === 'help_next') {
        currentPage = Math.min(pages.length - 1, currentPage + 1);
      } else if (buttonInteraction.customId === 'help_home') {
        currentPage = 0;
      }
      // Handle quick navigation buttons
      else if (buttonInteraction.customId === 'help_disney') {
        currentPage = 1;
      } else if (buttonInteraction.customId === 'help_dbd') {
        currentPage = 2;
      } else if (buttonInteraction.customId === 'help_admin') {
        currentPage = 3;
      } else if (buttonInteraction.customId === 'help_fun') {
        currentPage = 4;
      } else if (buttonInteraction.customId === 'help_achievements') {
        currentPage = 5;
      } else if (buttonInteraction.customId === 'help_bot') {
        currentPage = 6;
      }

      const newEmbed = createEmbed(currentPage);
      const newButtons = createButtons(currentPage);

      await buttonInteraction.update({
        embeds: [newEmbed],
        components: newButtons,
      });
    });

    collector.on('end', () => {
      // Disable all buttons when collector ends
      const disabledButtons = createButtons(currentPage);
      disabledButtons.forEach((row) => {
        row.components.forEach((button) => button.setDisabled(true));
      });

      messageComponent.edit({ components: disabledButtons }).catch(() => {});
    });
  },
};

