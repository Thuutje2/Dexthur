const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  name: 'ping',
  description: 'Ping!',
  category: 'Fun',
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Replies with Pong!'),
  async executeSlash(interaction) {
    await interaction.reply('Pong!');
  },
};
