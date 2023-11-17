const db = require('../../database');

module.exports = {
  name: 'removeitem',
  description: 'Remove an item or role from the store.',
  usage: '!removeitem <item_name>',
  category: 'Admin',
  async execute(message, args) {
    // Controleer of de gebruiker beheerderrechten heeft
    if (!message.member.permissions.has('ADMINISTRATOR')) {
      return message.reply('You do not have permission to use this command.');
    }

    const itemName = args[0];

    try {
      // Verwijder het item uit de winkel
      const result = await db.query('DELETE FROM store WHERE item_name = $1', [itemName]);

      if (result.rowCount === 0) {
        return message.reply(`Item "${itemName}" not found in the store.`);
      }

      message.reply(`Item "${itemName}" has been successfully removed from the store.`);
    } catch (error) {
      console.error('Error removing item from the store:', error);
      message.reply('An error occurred while removing the item from the store.');
    }
  },
};
