const { EmbedBuilder } = require('@discordjs/builders');
const db = require('../../database');

module.exports = {
  name: 'display',
  description: 'View a full album.',
  usage: '!display <album_name>',
  category: 'Gacha',
  async execute(message, args) {
    try {
      // Controleer of het album-naam is opgegeven
      if (!args[0]) {
        return message.reply('Please provide an album name.');
      }

      // Vervang deze query met de juiste methode om album- en stickergegevens op te halen uit je database
      const albumName = args[0];
      const result = await db.query('SELECT * FROM albums WHERE album_name = $1', [albumName]);

      // Controleer of het album bestaat
      if (!result.rows[0]) {
        return message.reply('Album not found.');
      }

      const album = result.rows[0];
      console.log('Album:', album);

      // Maak een embed voor het album met EmbedBuilder
      const albumEmbed = new EmbedBuilder()
        .setColor(0x0099ff)
        .setTitle(`Album: ${album.album_name}`)
        .setDescription('Check out the stickers in the album!')
        .setTimestamp();

      const stickersResult = await db.query('SELECT * FROM stickers WHERE album_id = $1', [album.album_id]);
      const stickers = stickersResult.rows;
      console.log('Stickers:', stickers);

      stickers.forEach(sticker => {
        albumEmbed.addFields({
          name: `Sticker ${sticker.sticker_name}`,
          value: '\u200b', // To ensure each field has content
          attachment: sticker.image_url,
          inline: true,
        });
      });

      // Stuur de embed naar het kanaal als er stickers zijn, anders geef een melding weer
      if (stickers.length > 0) {
        message.channel.send({ embeds: [albumEmbed] });
      } else {
        message.reply('There are no stickers in this album.');
      }
    } catch (error) {
      console.error(error);
      message.reply('There was an error retrieving the album.');
    }
  },
};









