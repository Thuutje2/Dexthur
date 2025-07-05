const { EmbedBuilder } = require('@discordjs/builders');
const { DisneyCharacter } = require('../../models/index');

module.exports = {
  name: 'update',
  description: 'New Characters to guess',
  async execute(message, args) {
    try {
      const newCharacters = await DisneyCharacter.find({ is_new: true })
        .sort({ series_film: 1, name: 1 })
        .select('name series_film');

      const totalNewCharacters = newCharacters.length;

      const newCharactersByFilm = {};
      newCharacters.forEach((character) => {
        if (!newCharactersByFilm[character.series_film]) {
          newCharactersByFilm[character.series_film] = [];
        }
        newCharactersByFilm[character.series_film].push(character.name);
      });

      const embeds = [];
      const pageSize = 5;
      const seriesArray = Object.entries(newCharactersByFilm);

      if (seriesArray.length === 0) {
        return message.reply(
          'sadly there are no new characters to guess at the moment. Please check back later.'
        );
      }

      for (let i = 0; i < seriesArray.length; i += pageSize) {
        const currentSeries = seriesArray.slice(i, i + pageSize);

        const embed = new EmbedBuilder()
          .setTitle('New Characters to guess')
          .setDescription(`Total new characters: ${totalNewCharacters}\n`)
          .setColor(0x0099ff)
          .setFooter({
            text: `Page ${Math.floor(i / pageSize) + 1} of ${Math.ceil(seriesArray.length / pageSize)}`,
          });

        currentSeries.forEach(([series, characters]) => {
          embed.addFields({
            name: '🔹' + series,
            value: characters.map((name) => `\`${name}\``).join(', '),
          });
        });

        embeds.push(embed);
      }

      let currentPage = 0;
      const embedMessage = await message.reply({
        embeds: [embeds[currentPage]],
      });

      if (embeds.length > 1) {
        await embedMessage.react('⬅️');
        await embedMessage.react('➡️');

        const filter = (reaction, user) => {
          return ['⬅️', '➡️'].includes(reaction.emoji.name) && !user.bot;
        };

        const collector = embedMessage.createReactionCollector({
          filter,
          time: 60000,
        });

        collector.on('collect', (reaction, user) => {
          if (reaction.emoji.name === '⬅️') {
            currentPage = (currentPage - 1 + embeds.length) % embeds.length;
          } else {
            currentPage = (currentPage + 1) % embeds.length;
          }

          embedMessage.edit({ embeds: [embeds[currentPage]] });
        });
      }
    } catch (error) {
      console.error(
        `Error executing command "update": ${error.message}` +
          '\n' +
          error.stack
      );
    }
  },
};
