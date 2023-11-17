const { EmbedBuilder } = require('@discordjs/builders');
const db = require('../../database');

module.exports = {
  name: 'store',
  description: 'View items available in the store.',
  category: 'Store',
  async execute(message, args, userData) {
    try {
      // Haal alle items op uit de winkel
      const result = await db.query('SELECT item_name, item_price FROM store');
      const storeItems = result.rows;

      if (storeItems.length === 0) {
        return message.reply('The store is currently empty.');
      }

      // Bouw het bericht op met de beschikbare items en hun prijzen
      const storeMessage = storeItems.map(item => `**${item.item_name}:** ${item.item_price} coins`).join('\n');

      // Maak een embed aan met EmbedBuilder
      const storeEmbed = new EmbedBuilder()
        .setTitle('Items available in the store')
        .setDescription(storeMessage)
        .setColor(0x0099ff); 

      message.reply({ embeds: [storeEmbed] });
    } catch (error) {
      console.error('Error fetching store items:', error);
      message.reply('An error occurred while fetching store items.');
    }
  },
};

