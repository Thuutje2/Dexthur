const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js');
const User = require('../../models/achievements/user');
const allAchievements = require('../../data/achievements');

module.exports = {
  name: 'achievements',
  description: 'View your achievements',
  usage: '!achievements',
  category: 'Game',
  data: new SlashCommandBuilder()
    .setName('achievements')
    .setDescription('View your achievements'),

  async execute(interactionOrMessage) {
    try {
      // Check if it's an interaction (slash command) or message (prefix command)
      const isInteraction =
        interactionOrMessage.isCommand?.() || interactionOrMessage.commandName;
      const user = isInteraction
        ? interactionOrMessage.user
        : interactionOrMessage.author;
      const userId = user.id;

      let userDoc = await User.findOne({ userId });
      if (!userDoc) {
        userDoc = await User.create({ userId, achievements: [] });
      }

      // Calculate achievement stats
      const totalAchievements = allAchievements.length;
      const unlockedAchievements = userDoc.achievements.length;
      const completionPercentage = Math.round(
        (unlockedAchievements / totalAchievements) * 100
      );

      // Sorting state
      let currentSortMode = 'unlocked'; // 'unlocked', 'rarity_asc', 'rarity_desc', 'original'
      let currentPage = 0;

      // Helper function to get rarity order from emoji
      const getRarityOrder = (emoji) => {
        switch (emoji) {
          case '🏅':
            return 1; // Common
          case '🌟':
            return 2; // Rare
          case '💎':
            return 3; // Epic
          case '👑':
            return 4; // Legendary
          default:
            return 0;
        }
      };

      // Sort achievements function
      const getSortedAchievements = (sortMode) => {
        let sorted = [...allAchievements];

        switch (sortMode) {
          case 'unlocked':
            // Unlocked first, then by rarity descending
            sorted.sort((a, b) => {
              const aUnlocked = userDoc.achievements.find(
                (ach) => ach.id === a.id
              );
              const bUnlocked = userDoc.achievements.find(
                (ach) => ach.id === b.id
              );

              if (aUnlocked && !bUnlocked) return -1;
              if (!aUnlocked && bUnlocked) return 1;

              return getRarityOrder(b.emoji) - getRarityOrder(a.emoji);
            });
            break;

          case 'rarity_asc':
            // Common to Legendary (lowest to highest rarity)
            sorted.sort(
              (a, b) => getRarityOrder(a.emoji) - getRarityOrder(b.emoji)
            );
            break;

          case 'rarity_desc':
            // Legendary to Common (highest to lowest rarity)
            sorted.sort(
              (a, b) => getRarityOrder(b.emoji) - getRarityOrder(a.emoji)
            );
            break;
        }

        return sorted;
      };

      // Pagination setup
      const achievementsPerPage = 5;

      // Create embed for current page
      const createEmbed = (page, sortMode) => {
        const sortedAchievements = getSortedAchievements(sortMode);
        const totalPages = Math.ceil(
          sortedAchievements.length / achievementsPerPage
        );

        const start = page * achievementsPerPage;
        const end = start + achievementsPerPage;
        const pageAchievements = sortedAchievements.slice(start, end);

        // Get sort mode display name
        const sortModeNames = {
          unlocked: 'Unlocked First',
          rarity_asc: 'Common → Legendary',
          rarity_desc: 'Legendary → Common',
          original: 'Original Order',
        };

        const embed = new EmbedBuilder()
          .setTitle(`🏆 ${user.username}'s Achievements`)
          .setDescription(
            `📊 **Progress:** ${unlockedAchievements}/${totalAchievements} (${completionPercentage}%)\n` +
              `${this.createProgressBar(completionPercentage)}\n\n` +
              `📋 **Sort:** ${sortModeNames[sortMode]}\n` +
              `✅ Unlocked | 🔒 Locked | 🏅 Common | 🌟 Rare | 💎 Epic | 👑 Legendary`
          )
          .setColor(this.getCompletionColor(completionPercentage))
          .setFooter({
            text: `Page ${page + 1} of ${totalPages} • ${unlockedAchievements} achievements unlocked`,
            iconURL: user.displayAvatarURL(),
          })
          .setTimestamp();

        pageAchievements.forEach((ach) => {
          const unlocked = userDoc.achievements.find((a) => a.id === ach.id);
          const rarityIcon = ach.emoji || '🏅';
          const statusIcon = unlocked ? '✅' : '🔒';

          let fieldName = `${statusIcon} ${rarityIcon} ${ach.name}`;
          let fieldValue;

          if (unlocked) {
            const unlockedDate = new Date(unlocked.unlockedAt);
            fieldValue =
              `🎉 **Unlocked!** <t:${Math.floor(unlockedDate.getTime() / 1000)}:R>\n` +
              `💭 *${ach.description}*`;
          } else {
            fieldValue =
              `🎯 **Goal:** ${ach.description}\n` +
              `💡 *${ach.hint || 'Keep playing to unlock this achievement!'}*`;
          }

          embed.addFields({
            name: fieldName,
            value: fieldValue,
            inline: false,
          });
        });

        return embed;
      };

      // Create navigation buttons
      const createButtons = (page, sortMode) => {
        const sortedAchievements = getSortedAchievements(sortMode);
        const totalPages = Math.ceil(
          sortedAchievements.length / achievementsPerPage
        );

        const navigationRow = new ActionRowBuilder();

        // Previous page button
        navigationRow.addComponents(
          new ButtonBuilder()
            .setCustomId('achievements_prev')
            .setLabel('◀ Previous')
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(page === 0)
        );

        // Page indicator
        navigationRow.addComponents(
          new ButtonBuilder()
            .setCustomId('achievements_page')
            .setLabel(`${page + 1}/${totalPages}`)
            .setStyle(ButtonStyle.Success)
            .setDisabled(true)
        );

        // Next page button
        navigationRow.addComponents(
          new ButtonBuilder()
            .setCustomId('achievements_next')
            .setLabel('Next ▶')
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(page === totalPages - 1)
        );

        // Stats button
        navigationRow.addComponents(
          new ButtonBuilder()
            .setCustomId('achievements_stats')
            .setLabel('📊 Stats')
            .setStyle(ButtonStyle.Primary)
        );

        // Sort buttons row
        const sortRow = new ActionRowBuilder();

        sortRow.addComponents(
          new ButtonBuilder()
            .setCustomId('sort_unlocked')
            .setLabel('✅ Unlocked First')
            .setStyle(
              sortMode === 'unlocked'
                ? ButtonStyle.Success
                : ButtonStyle.Secondary
            )
        );

        sortRow.addComponents(
          new ButtonBuilder()
            .setCustomId('sort_rarity_asc')
            .setLabel('🏅➡️👑 Common→Legendary')
            .setStyle(
              sortMode === 'rarity_asc'
                ? ButtonStyle.Success
                : ButtonStyle.Secondary
            )
        );

        sortRow.addComponents(
          new ButtonBuilder()
            .setCustomId('sort_rarity_desc')
            .setLabel('👑➡️🏅 Legendary→Common')
            .setStyle(
              sortMode === 'rarity_desc'
                ? ButtonStyle.Success
                : ButtonStyle.Secondary
            )
        );

        sortRow.addComponents(
          new ButtonBuilder()
            .setCustomId('sort_original')
            .setLabel('📄 Original Order')
            .setStyle(
              sortMode === 'original'
                ? ButtonStyle.Success
                : ButtonStyle.Secondary
            )
        );

        return [navigationRow, sortRow];
      };

      // Initial response
      const initialEmbed = createEmbed(currentPage, currentSortMode);
      const initialButtons = createButtons(currentPage, currentSortMode);

      const response = {
        embeds: [initialEmbed],
        components: initialButtons,
      };

      let message;
      if (isInteraction) {
        await interactionOrMessage.reply({ ...response, ephemeral: true });
        message = await interactionOrMessage.fetchReply();
      } else {
        message = await interactionOrMessage.reply(response);
      }

      // Button collector for pagination and sorting
      const collector = message.createMessageComponentCollector({
        filter: (i) => i.user.id === userId,
        time: 300000, // 5 minutes
      });

      collector.on('collect', async (buttonInteraction) => {
        // Handle navigation
        if (buttonInteraction.customId === 'achievements_prev') {
          currentPage = Math.max(0, currentPage - 1);
        } else if (buttonInteraction.customId === 'achievements_next') {
          const sortedAchievements = getSortedAchievements(currentSortMode);
          const totalPages = Math.ceil(
            sortedAchievements.length / achievementsPerPage
          );
          currentPage = Math.min(totalPages - 1, currentPage + 1);
        } else if (buttonInteraction.customId === 'achievements_stats') {
          // Show detailed stats
          const statsEmbed = this.createStatsEmbed(
            user,
            userDoc,
            allAchievements
          );
          await buttonInteraction.reply({
            embeds: [statsEmbed],
            ephemeral: true,
          });
          return;
        }
        // Handle sorting
        else if (buttonInteraction.customId.startsWith('sort_')) {
          const newSortMode = buttonInteraction.customId.replace('sort_', '');
          currentSortMode = newSortMode;
          currentPage = 0; // Reset to first page when changing sort
        }

        const newEmbed = createEmbed(currentPage, currentSortMode);
        const newButtons = createButtons(currentPage, currentSortMode);

        await buttonInteraction.update({
          embeds: [newEmbed],
          components: newButtons,
        });
      });

      collector.on('end', () => {
        // Disable all buttons when collector ends
        const disabledButtons = createButtons(currentPage, currentSortMode);
        disabledButtons.forEach((row) => {
          row.components.forEach((button) => button.setDisabled(true));
        });

        message.edit({ components: disabledButtons }).catch(() => {});
      });
    } catch (error) {
      console.error('Error in achievements command:', error);
      const errorMessage =
        'There was an error fetching your achievements. Please try again later.';

      if (isInteraction) {
        if (interactionOrMessage.replied || interactionOrMessage.deferred) {
          await interactionOrMessage.followUp({
            content: errorMessage,
            ephemeral: true,
          });
        } else {
          await interactionOrMessage.reply({
            content: errorMessage,
            ephemeral: true,
          });
        }
      } else {
        await interactionOrMessage.reply(errorMessage);
      }
    }
  },

  // Helper methods
  createProgressBar(percentage) {
    const totalBars = 20;
    const filledBars = Math.round((percentage / 100) * totalBars);
    const emptyBars = totalBars - filledBars;

    const progressBar = '🟩'.repeat(filledBars) + '⬜'.repeat(emptyBars);
    return `${progressBar} ${percentage}%`;
  },

  getCompletionColor(percentage) {
    if (percentage >= 90) return 0xffd700; // Gold
    if (percentage >= 70) return 0x00ff00; // Green
    if (percentage >= 50) return 0xffa500; // Orange
    if (percentage >= 25) return 0xffff00; // Yellow
    return 0xff0000; // Red
  },

  createStatsEmbed(user, userDoc, allAchievements) {
    const totalAchievements = allAchievements.length;
    const unlockedAchievements = userDoc.achievements.length;
    const completionPercentage = Math.round(
      (unlockedAchievements / totalAchievements) * 100
    );

    // Calculate rarity breakdown using the emoji property
    const rarityBreakdown = {
      legendary: 0,
      epic: 0,
      rare: 0,
      common: 0,
    };

    userDoc.achievements.forEach((userAch) => {
      const ach = allAchievements.find((a) => a.id === userAch.id);
      if (ach) {
        if (ach.emoji === '👑') rarityBreakdown.legendary++;
        else if (ach.emoji === '💎') rarityBreakdown.epic++;
        else if (ach.emoji === '🌟') rarityBreakdown.rare++;
        else rarityBreakdown.common++;
      }
    });

    // Find most recent achievement
    const mostRecent =
      userDoc.achievements.length > 0
        ? userDoc.achievements.sort(
            (a, b) => new Date(b.unlockedAt) - new Date(a.unlockedAt)
          )[0]
        : null;

    return new EmbedBuilder()
      .setTitle(`📊 ${user.username}'s Achievement Statistics`)
      .setColor(0x00aeff)
      .setThumbnail(user.displayAvatarURL())
      .addFields(
        {
          name: '📈 Overall Progress',
          value:
            `**${unlockedAchievements}** out of **${totalAchievements}** achievements\n` +
            `**${completionPercentage}%** completion rate`,
          inline: true,
        },
        {
          name: '🎯 Rarity Breakdown',
          value:
            `👑 Legendary: **${rarityBreakdown.legendary}**\n` +
            `💎 Epic: **${rarityBreakdown.epic}**\n` +
            `🌟 Rare: **${rarityBreakdown.rare}**\n` +
            `🏅 Common: **${rarityBreakdown.common}**`,
          inline: true,
        },
        {
          name: '⏰ Most Recent Achievement',
          value: mostRecent
            ? `**${allAchievements.find((a) => a.id === mostRecent.id)?.name || 'Unknown'}**\n` +
              `<t:${Math.floor(new Date(mostRecent.unlockedAt).getTime() / 1000)}:R>`
            : 'No achievements unlocked yet',
          inline: false,
        }
      )
      .setFooter({ text: 'Keep playing to unlock more achievements!' })
      .setTimestamp();
  },

  async executeSlash(interaction) {
    await this.execute(interaction);
  },
};
