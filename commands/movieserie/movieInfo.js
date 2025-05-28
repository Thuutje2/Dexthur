const { EmbedBuilder } = require('@discordjs/builders');
const axios = require('axios');

module.exports = {
  name: 'movieInfo',
  description: 'Get information about a movie from OMDB.',
  aliases: ['mi'],
  args: true,
  usage: '<movie_name>',
  async execute(message, args) {
    const movieName = args.join(' ');
    const apiKey = process.env.OMDB_API_KEY;
    const url = `http://www.omdbapi.com/?t=${movieName}&apikey=${apiKey}`;

    try {
      const response = await axios.get(url);
      const data = response.data;

      if (data.Response === 'True') {
        const embed = new EmbedBuilder()
          .setTitle(data.Title)
          .setDescription(data.Plot)
          .setColor(0x00ae86)
          .addFields(
            { name: 'Year', value: data.Year, inline: true },
            { name: 'Rated', value: data.Rated, inline: true },
            { name: 'Released', value: data.Released, inline: true },
            { name: 'Runtime', value: data.Runtime, inline: true },
            { name: 'Genre', value: data.Genre, inline: true },
            { name: 'Director', value: data.Director, inline: true },
            { name: 'Actors', value: data.Actors, inline: true }
          )
          .setThumbnail(data.Poster);

        await message.reply({ embeds: [embed] });
      } else {
        await message.reply(`No results found for "${movieName}"`);
      }
    } catch (error) {
      console.error(error);
      message.reply('An error occurred while fetching the movie data.');
    }
  },
};
