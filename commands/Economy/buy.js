const db = require('../../database');

function getRandomColor() {
  return '#'+(Math.random()*0xFFFFFF<<0).toString(16);
}

module.exports = {
  name: 'buy',
  description: 'Buy an item or role from the store.',
  usage: '!buy <item_name>',
  category: 'Store',
  async execute(message, args) {
    const itemName = args[0];

    try {
      // Haal het item op uit de winkel
      const result = await db.query('SELECT item_name, item_price, item_type FROM store WHERE item_name = $1', [itemName]);
      const storeItem = result.rows[0];

      if (!storeItem) {
        return message.reply('Item not found in the store.');
      }

      // Haal gebruikersgegevens rechtstreeks uit de database
      const userResult = await db.query('SELECT balance FROM users WHERE user_id = $1', [message.author.id]);
      const userBalance = userResult.rows[0].balance || 0;

      if (userBalance < storeItem.item_price) {
        return message.reply(`Insufficient funds to purchase ${storeItem.item_name}. Your balance is ${userBalance} coins, but you need ${storeItem.item_price} coins.`);
      }

      // Bereken de nieuwe balans na de aankoop
      const newBalance = userBalance - storeItem.item_price;

      // Voer de transactie uit: verminder het saldo van de gebruiker
      await db.query('UPDATE users SET balance = $1 WHERE user_id = $2', [newBalance, message.author.id]);

      // Voeg het gekochte item of rol toe aan de inventaris van de gebruiker
      if (storeItem.item_type === 'item') {
        await db.query('INSERT INTO inventory (user_id, item_name, quantity, item_type) VALUES ($1, $2, 1, $3) ON CONFLICT (user_id, item_name) DO UPDATE SET quantity = inventory.quantity + 1', [message.author.id, storeItem.item_name, storeItem.item_type]);
      } else if (storeItem.item_type === 'role') {
        await db.query('INSERT INTO inventory (user_id, item_name, quantity, item_type) VALUES ($1, $2, 1, $3) ON CONFLICT (user_id, item_name) DO UPDATE SET quantity = inventory.quantity + 1', [message.author.id, storeItem.item_name, storeItem.item_type]);
        const role = message.guild.roles.cache.find(r => r.name === storeItem.item_name);

        if (!role) {
          // Rol bestaat nog niet, maak de rol aan en wijs deze toe aan de gebruiker
          const createdRole = await message.guild.roles.create({
            name: storeItem.item_name,
            color: getRandomColor(),
          });
          await message.member.roles.add(createdRole);
        } else {
          // Wijs bestaande rol toe aan de gebruiker
          await message.member.roles.add(role);
        }
      } else if (storeItem.item_type === 'pack') {
        // Voeg het gekochte pack toe aan de pack_inventory van de gebruiker
        await db.query('INSERT INTO pack_inventory (user_id, pack_id, quantity) VALUES ($1, $2, 1) ON CONFLICT (user_id, pack_id) DO UPDATE SET quantity = pack_inventory.quantity + 1', [message.author.id, packId]);
      }

      message.reply(`You have successfully purchased ${storeItem.item_name}! Your new balance is ${newBalance} coins.`);
    } catch (error) {
      console.error('Error processing purchase:', error);
      message.reply('An error occurred while processing your purchase.');
    }
  },
};



