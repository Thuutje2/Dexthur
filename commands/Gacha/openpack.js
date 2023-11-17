// Voeg dit toe aan je bestaande code
module.exports = {
    name: 'openpack',
    description: 'Open a pack from your inventory.',
    usage: '!openpack <pack_name>',
    category: 'Gacha',
    async execute(message, args) {
      const packName = args[0];
  
      try {
        // Zoek het pack in de inventory van de gebruiker
        const packResult = await db.query('SELECT pack_id FROM inventory WHERE user_id = $1 AND item_name = $2', [message.author.id, packName]);
  
        const pack = packResult.rows[0];
  
        if (!pack) {
          return message.reply('Pack not found in your inventory.');
        }
  
        // Haal de stickers op die aan het pack zijn gekoppeld
        const stickersResult = await db.query('SELECT s.sticker_id, s.sticker_name, s.image_url FROM pack_stickers ps JOIN stickers s ON ps.sticker_id = s.sticker_id WHERE ps.pack_id = $1', [pack.pack_id]);
        const stickers = stickersResult.rows;
  
        // Voeg de stickers toe aan het album van de gebruiker
        for (const sticker of stickers) {
          await db.query('INSERT INTO user_stickers (user_id, sticker_id) VALUES ($1, $2) ON CONFLICT (user_id, sticker_id) DO NOTHING', [message.author.id, sticker.sticker_id]);
        }
  
        // Verwijder het pack uit de inventory
        await db.query('DELETE FROM inventory WHERE user_id = $1 AND item_name = $2', [message.author.id, packName]);
  
        message.reply(`You have successfully opened ${packName}! Stickers have been added to your album.`);
      } catch (error) {
        console.error('Error opening pack:', error);
        message.reply('An error occurred while opening the pack.');
      }
    },
  };
  