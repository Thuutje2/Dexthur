const { EmbedBuilder } = require('@discordjs/builders');
const { DisneyCharacter } = require('../../models/index');

module.exports = {
  name: 'serieInfo',
  description: 'Disney characters in the series or movie',
  aliases: ['si'],
  async execute(message, args) {
    try {
      const serie = args.join(' ').toLowerCase();

      const characters = await DisneyCharacter.find({
        series_film: { $regex: new RegExp(`^${serie}$`, 'i') },
      });

      if (characters.length === 0) {
        return message.reply(
          `No characters found for series or movie: ${serie}`
        );
      }

      const serieCharacters = characters.map((character) => character.name);

      const embed = new EmbedBuilder()
        .setTitle(`${serie.toUpperCase()}`)
        .setColor(0x00ae86)
        .setDescription(
          `**Total characters:** ${serieCharacters.length} \n\n` +
            serieCharacters.join('\n')
        );

      await message.reply({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      message.reply('An error occurred while processing the command');
    }
  },
};
