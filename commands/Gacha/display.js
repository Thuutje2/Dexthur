const { EmbedBuilder, ButtonBuilder, ActionRowBuilder } = require('@discordjs/builders');
const { createCanvas, loadImage } = require('canvas');
const { AttachmentBuilder } = require('discord.js');
const db = require('../../database');

module.exports = {
  name: 'display',
  description: 'Bekijk een volledig album.',
  usage: '!display <album_name>',
  category: 'Gacha',
  async execute(interaction, args) {
    try {
      if (!args[0]) {
        return interaction.reply('Geef alsjeblieft de naam van een album op.');
      }

      const albumName = args[0];
      const result = await db.query('SELECT * FROM albums WHERE album_name = $1', [albumName]);

      if (!result.rows[0]) {
        return interaction.reply('Album niet gevonden.');
      }

      const album = result.rows[0];

      console.log('Album resultaat:', album);

      const stickersResult = await db.query('SELECT * FROM stickers WHERE album_id = $1', [album.album_id]);
      const stickers = stickersResult.rows;

      console.log('Stickers resultaat:', stickers);

      if (stickers.length === 0) {
        return interaction.reply('Dit album bevat geen stickers.');
      }

      // Canvas setup
      const canvas = createCanvas(600, 600);
      const ctx = canvas.getContext('2d');

      // Load each image and draw it on the canvas
      for (let i = 0; i < stickers.length; i++) {
        const image = await loadImage(stickers[i].image_url);
        ctx.drawImage(image, i * 150, 0, 150, 150); // Adjust the positioning and size as needed
      }

      // Convert the canvas to a data URL
      const dataUrl = canvas.toDataURL();

      // Create an embed with the merged image
      const embed = new EmbedBuilder()
        .setColor(0x0099ff)
        .setTitle(`Sticker Album: ${album.album_name}`)
        .setImage(dataUrl);

      const row = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder().setCustomId('previous').setLabel('Vorige').setStyle(1),
          new ButtonBuilder().setCustomId('next').setLabel('Volgende').setStyle(1),
        );

      await interaction.reply({ content: 'Stickeralbum weergeven:', embeds: [embed], components: [row] });
    } catch (error) {
      console.error(error);
      interaction.reply('Er is een fout opgetreden bij het ophalen van het album.');
    }
  },
};



















