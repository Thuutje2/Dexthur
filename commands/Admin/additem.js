const db = require('../../database');

module.exports = {
  name: 'additem',
  description: 'Add a new item or role to the store.',
  usage: '!additem <item_name> <item_price> <item_type>',
  category: 'Admin',
  async execute(message, args, userData) {
    // Controleer of de gebruiker beheerderrechten heeft (pas dit aan aan je eigen logica)
    if (!message.member.permissions.has('ADMINISTRATOR')) {
      return message.reply('You do not have permission to use this command.');
    }

    // Args[0] bevat de naam van het item, args[1] bevat de prijs, args[2] bevat het type (item/role)
    const itemName = args[0];
    const itemPrice = parseInt(args[1]);
    const itemType = args[2];

    // Controleer of het type geldig is
    if (itemType !== 'item' && itemType !== 'role') {
      return message.reply('Invalid item type. Use either "item" or "role".');
    }

    try {
      // Voeg het nieuwe item toe aan de winkel
      await db.query('INSERT INTO store (item_name, item_price, item_type) VALUES ($1, $2, $3)', [itemName, itemPrice, itemType]);

      message.reply(`Item ${itemName} (Type: ${itemType}) has been added to the store with a price of ${itemPrice} coins.`);
    } catch (error) {
      console.error('Error adding item to the store:', error);
      message.reply('An error occurred while adding the item to the store.');
    }
  },
};


