// Voeg dit toe aan je bestaande code
module.exports = {
    name: 'buypack',
    description: 'Buy a pack from the store.',
    usage: '!buypack <pack_name>',
    category: 'Store',
    async execute(message, args) {
      const packName = args[0];
  
      try {
        // Haal pack informatie op uit de store
        const packResult = await db.query('SELECT pack_id, pack_price FROM store_packs WHERE pack_name = $1', [packName]);
        const pack = packResult.rows[0];
  
        if (!pack) {
          return message.reply('Pack not found in the store.');
        }
  
        // Haal gebruikersgegevens rechtstreeks uit de database
        const userResult = await db.query('SELECT balance FROM users WHERE user_id = $1', [message.author.id]);
        const userBalance = userResult.rows[0].balance || 0;
  
        if (userBalance < pack.pack_price) {
          return message.reply(`Insufficient funds to purchase ${packName}. Your balance is ${userBalance} coins, but you need ${pack.pack_price} coins.`);
        }
  
        // Bereken de nieuwe balans na de aankoop
        const newBalance = userBalance - pack.pack_price;
  
        // Voer de transactie uit: verminder het saldo van de gebruiker
        await db.query('UPDATE users SET balance = $1 WHERE user_id = $2', [newBalance, message.author.id]);
  
        // Voeg het gekochte pack toe aan de inventaris van de gebruiker
        await db.query('INSERT INTO inventory (user_id, pack_id, quantity) VALUES ($1, $2, 1) ON CONFLICT (user_id, pack_id) DO UPDATE SET quantity = inventory.quantity + 1', [message.author.id, pack.pack_id]);
  
        message.reply(`You have successfully purchased ${packName}! Your new balance is ${newBalance} coins.`);
      } catch (error) {
        console.error('Error processing pack purchase:', error);
        message.reply('An error occurred while processing your pack purchase.');
      }
    },
  };
  