const db = require('../../database');

module.exports = {
  name: 'inventory',
  description: 'View your inventory.',
  aliases: ['inv'],
  usage: '!inventory',
  category: 'Store',
  async execute(message, args) {
    try {
      // Haal de inventaris op van de gebruiker
      const result = await db.query('SELECT item_name, quantity FROM inventory WHERE user_id = $1', [message.author.id]);
      const userInventory = result.rows;

      if (userInventory.length === 0) {
        return message.reply('Your inventory is empty.');
      }

      // Bouw een bericht op met de inventarisgegevens
      const inventoryMessage = userInventory.map(item => `${item.item_name}: ${item.quantity}`).join('\n');

      message.reply(`Your inventory:\n${inventoryMessage}`);
    } catch (error) {
      console.error('Error fetching inventory:', error);
      message.reply('An error occurred while fetching your inventory.');
    }
  },
};
