const { SlashCommandBuilder } = require('discord.js');
const Player = require('../../models/rpg/player');

module.exports = {
  name: 'begin',
  description: 'Begin je avontuur!',
  usage: '!begin <rol>',
  category: 'Game',
  data: new SlashCommandBuilder()
    .setName('begin')
    .setDescription('Begin je avontuur!')
    .addStringOption((option) =>
      option
        .setName('rol')
        .setDescription('Kies je rol')
        .setRequired(true)
        .addChoices(
          {
            name: 'Warden - Beschermt de cave en ontrafelt fysieke geheimen',
            value: 'Warden',
          },
          {
            name: 'Emberkin - Beheerst oude vuurmagie en energiebronnen',
            value: 'Emberkin',
          },
          {
            name: 'Glowmancer - Gebruikt licht en illusies, manipuleert anderen',
            value: 'Glowmancer',
          },
          {
            name: 'Burrower - Graaft tunnels en onthult verborgen paden',
            value: 'Burrower',
          },
          {
            name: 'Scribe - Ontcijfert oude teksten, weet alles van de geschiedenis',
            value: 'Scribe',
          }
        )
    ),

  async execute(message, args) {
    const role = args[0];
    const user = message.author;
    if (!role) return message.reply('Gebruik: !begin <rol>');

    await this.handleBegin(user, message.guild.id, role, (msg) =>
      message.reply(msg)
    );
  },

  async executeSlash(interaction) {
    const role = interaction.options.getString('rol');
    const user = interaction.user;

    await this.handleBegin(user, interaction.guild.id, role, (msg) =>
      interaction.reply({ content: msg, ephemeral: true })
    );
  },

  async handleBegin(user, guildId, role, sendReply) {
    try {
      const existing = await Player.findOne({ userId: user.id, guildId });
      if (existing)
        return sendReply('🕯️ Je hebt al een karakter in deze server!');

      const newPlayer = new Player({
        userId: user.id,
        guildId,
        name: user.username,
        role,
        level: 1,
        xp: 0,
        caveLore: [],
        skills: { glow: 1, charm: 1, knowledge: 1 },
        items: [],
        reputation: 0,
      });

      await newPlayer.save();
      sendReply(
        `🎉 Welkom, **${role} ${user.username}**. Je avontuur is begonnen!`
      );
    } catch (error) {
      console.error('Error bij /begin:', error);
      sendReply('⚠️ Er ging iets mis bij het starten van je avontuur.');
    }
  },
};
