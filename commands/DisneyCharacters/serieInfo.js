const { EmbedBuilder } = require('@discordjs/builders');
const { query } = require('../../database');

module.exports = {
  name: 'serieInfo',
  description: 'Disney characters in the series or movie',
  aliases: ['si'],
  async execute(message, args) {
    try {
      const serie = args.join(' ').toLowerCase();
      const res = await query(
        'SELECT * FROM disney_characters WHERE LOWER(series_film) = $1',
        [serie]
      );

      if (res.rows.length === 0) {
        return message.reply(
          `No characters found for series or movie: ${serie}`
        );
      }

      const serieCharacters = res.rows.map((row) => row.name);

      const embed = new EmbedBuilder()
        .setTitle(`${serie.toUpperCase()}`)
        .setColor(0x00ae86) // Optionally, set a color for the embed
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
