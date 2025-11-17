const { SlashCommandBuilder } = require('discord.js');
const Player = require('../../models/rpg/player');

const exploreEvents = [
  {
    text: 'Je vindt een oud boek dat straalt met mysterieuze gloed.',
    reward: { xp: 20, item: 'Gloedboek' },
  },
  {
    text: 'Je struikelt over een slapende cave-beer en vlucht op tijd weg!',
    reward: { xp: 10 },
  },
  {
    text: 'Je vindt een zakje glinsterende stenen.',
    reward: { xp: 15, item: 'Glimsteentjes' },
  },
  {
    text: 'Je vindt niets behalve echo’s van een vergeten lied.',
    reward: { xp: 5 },
  },
];

module.exports = {
  name: 'explore',
  description: 'Ga op verkenning in de Cozy Cave.',
  usage: '!explore',
  category: 'Game',
  cooldown: 1800, // 30 minuten cooldown (1800 seconden)
  data: new SlashCommandBuilder()
    .setName('explore')
    .setDescription('Ga op verkenning in de Cozy Cave.'),

  async execute(message) {
    const user = message.author;
    await this.explore(user, message.guild.id, (msg) => message.reply(msg));
  },

  async executeSlash(interaction) {
    const user = interaction.user;
    await this.explore(user, interaction.guild.id, (msg) =>
      interaction.reply({ content: msg, ephemeral: false })
    );
  },

  async explore(user, guildId, sendReply) {
    try {
      const player = await Player.findOne({ userId: user.id, guildId });
      if (!player)
        return sendReply(
          'Je hebt nog geen karakter! Gebruik `/begin` om te starten.'
        );

      // Cooldown check
      const now = new Date();
      const cooldownTime = 30 * 60 * 1000; // 30 minuten in milliseconden

      if (player.cooldowns && player.cooldowns.explore) {
        const timeSinceLastExplore = now - player.cooldowns.explore;
        if (timeSinceLastExplore < cooldownTime) {
          const remainingTime = cooldownTime - timeSinceLastExplore;
          const remainingMinutes = Math.ceil(remainingTime / (60 * 1000));
          return sendReply(
            `⏰ Je moet nog **${remainingMinutes} minuten** wachten voordat je weer kunt verkennen!`
          );
        }
      }

      // Random event kiezen
      const event =
        exploreEvents[Math.floor(Math.random() * exploreEvents.length)];
      const { xp, item } = event.reward;

      player.xp += xp;

      if (item) {
        player.items.push(item);
      }

      // Update cooldown
      if (!player.cooldowns) player.cooldowns = {};
      player.cooldowns.explore = now;

      await player.save();

      let rewardText = `+${xp} XP`;
      if (item) rewardText += `, gevonden item: **${item}**`;

      sendReply(`🔍 ${event.text}\n${rewardText}`);
    } catch (err) {
      console.error('Explore error:', err);
      sendReply('Er ging iets mis tijdens het verkennen!');
    }
  },
};
